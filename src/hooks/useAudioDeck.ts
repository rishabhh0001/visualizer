import { useRef, useState, useEffect } from "react";

const guessBPM = (buffer: AudioBuffer): number => {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    const peaks = [];
    let max = 0;
    for (let i = 0; i < Math.min(data.length, sampleRate * 30); i++) { // scan first 30s
        if (Math.abs(data[i]) > max) max = Math.abs(data[i]);
    }
    const threshold = max * 0.8;
    const gap = sampleRate / 5; // 200ms skip
    for (let i = 0; i < Math.min(data.length, sampleRate * 30); i++) {
        if (Math.abs(data[i]) > threshold) {
            peaks.push(i);
            i += gap;
        }
    }
    if (peaks.length < 2) return 120;
    const intervals: { [key: number]: number } = {};
    for (let i = 1; i < peaks.length; i++) {
        let tempo = 60 / ((peaks[i] - peaks[i - 1]) / sampleRate);
        while (tempo < 70) tempo *= 2;
        while (tempo > 180) tempo /= 2;
        tempo = Math.round(tempo);
        if (tempo >= 70 && tempo <= 180) intervals[tempo] = (intervals[tempo] || 0) + 1;
    }
    let bestTempo = 120, maxCount = 0;
    for (const t in intervals) {
        if (intervals[t] > maxCount) {
            maxCount = intervals[t];
            bestTempo = parseInt(t);
        }
    }
    return bestTempo;
};

export function useAudioDeck(audioContext: AudioContext | null) {
    const [file, setFile] = useState<File | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [pitch, setPitch] = useState(1);
    const [eq, setEq] = useState({ low: 0, mid: 0, high: 0 }); // -12 to +12 dB
    const [fx, setFx] = useState({
        delayTime: 0, // 0 to 1
        delayFeedback: 0, // 0 to 0.9
        reverbMix: 0, // 0 to 1
        compression: -24, // threshold
        width: 1.0 // 0 to 2
    });
    const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
    const [baseBpm, setBaseBpm] = useState(120);

    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const eqNodesRef = useRef<{
        low: BiquadFilterNode;
        mid: BiquadFilterNode;
        high: BiquadFilterNode;
    } | null>(null);

    // FX Refs
    const compressorRef = useRef<DynamicsCompressorNode | null>(null);
    const delayRef = useRef<DelayNode | null>(null);
    const delayFeedbackRef = useRef<GainNode | null>(null);
    const reverbRef = useRef<ConvolverNode | null>(null);
    const reverbGainRef = useRef<GainNode | null>(null);
    const dryGainRef = useRef<GainNode | null>(null);

    const startTimeRef = useRef(0);
    const pauseTimeRef = useRef(0);
    const reqFrameRef = useRef(0);

    // Setup audio graph once context is available
    useEffect(() => {
        if (!audioContext) return;

        const gain = audioContext.createGain();

        // Create EQ Nodes
        const low = audioContext.createBiquadFilter();
        low.type = "lowshelf";
        low.frequency.value = 320;

        const mid = audioContext.createBiquadFilter();
        mid.type = "peaking";
        mid.frequency.value = 1000;
        mid.Q.value = 1;

        const high = audioContext.createBiquadFilter();
        high.type = "highshelf";
        high.frequency.value = 3200;

        const widener = audioContext.createGain();
        const panner = audioContext.createStereoPanner();
        panner.pan.value = 0;

        // Dynamics
        const compressor = audioContext.createDynamicsCompressor();
        compressor.threshold.value = -24;
        compressor.ratio.value = 4;

        // Delay
        const delay = audioContext.createDelay(2.0);
        delay.delayTime.value = 0;
        const delayFeedback = audioContext.createGain();
        delayFeedback.gain.value = 0;

        // Reverb
        const reverb = audioContext.createConvolver();
        const reverbGain = audioContext.createGain();
        reverbGain.gain.value = 0;
        const dryGain = audioContext.createGain();
        dryGain.gain.value = 1;

        // Generate simple impulse response
        const length = audioContext.sampleRate * 2;
        const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate);
        for (let c = 0; c < 2; c++) {
            const d = impulse.getChannelData(c);
            for (let i = 0; i < length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
        }
        reverb.buffer = impulse;

        // Chain architecture:
        // Source -> Low -> Mid -> High -> Compressor -> (Split to Reverb & Dry)
        // Dry -> Delay -> Gain
        // Reverb -> Delay
        // Delay -> Gain -> Destination

        low.connect(mid);
        mid.connect(high);
        high.connect(compressor);

        compressor.connect(dryGain);
        compressor.connect(reverb);
        reverb.connect(reverbGain);

        dryGain.connect(delay);
        reverbGain.connect(delay);

        delay.connect(delayFeedback);
        delayFeedback.connect(delay);

        delay.connect(gain);
        gain.connect(audioContext.destination);

        gainNodeRef.current = gain;
        eqNodesRef.current = { low, mid, high };
        compressorRef.current = compressor;
        delayRef.current = delay;
        delayFeedbackRef.current = delayFeedback;
        reverbRef.current = reverb;
        reverbGainRef.current = reverbGain;
        dryGainRef.current = dryGain;

        return () => {
            low.disconnect();
            mid.disconnect();
            high.disconnect();
            compressor.disconnect();
            delay.disconnect();
            reverb.disconnect();
            gain.disconnect();
        };
    }, [audioContext]);

    // Handle volume changes
    useEffect(() => {
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), audioContext?.currentTime || 0, 0.05);
        }
    }, [volume, audioContext]);

    // Handle EQ changes
    useEffect(() => {
        if (eqNodesRef.current) {
            eqNodesRef.current.low.gain.setTargetAtTime(eq.low, audioContext?.currentTime || 0, 0.05);
            eqNodesRef.current.mid.gain.setTargetAtTime(eq.mid, audioContext?.currentTime || 0, 0.05);
            eqNodesRef.current.high.gain.setTargetAtTime(eq.high, audioContext?.currentTime || 0, 0.05);
        }
    }, [eq, audioContext]);

    // Handle FX changes
    useEffect(() => {
        if (!audioContext) return;
        const now = audioContext.currentTime;
        if (delayRef.current) delayRef.current.delayTime.setTargetAtTime(fx.delayTime, now, 0.05);
        if (delayFeedbackRef.current) delayFeedbackRef.current.gain.setTargetAtTime(fx.delayFeedback, now, 0.05);
        if (reverbGainRef.current) reverbGainRef.current.gain.setTargetAtTime(fx.reverbMix, now, 0.05);
        if (dryGainRef.current) dryGainRef.current.gain.setTargetAtTime(1 - fx.reverbMix * 0.5, now, 0.05);
        if (compressorRef.current) compressorRef.current.threshold.setTargetAtTime(fx.compression, now, 0.05);
        // Widener logic (using gain as proxy for simplicity in this version)
        if (gainNodeRef.current) gainNodeRef.current.gain.setTargetAtTime(volume * (fx.width > 1 ? 1.1 : 1.0), now, 0.05);
    }, [fx, audioContext, volume]);

    const [loopIn, setLoopIn] = useState<number | null>(null);
    const [loopOut, setLoopOut] = useState<number | null>(null);
    const [isLooping, setIsLooping] = useState(false);

    const [hotCues, setHotCues] = useState<(number | null)[]>([null, null, null, null]);

    // Load and decode file
    const loadFile = async (newFile: File) => {
        if (!audioContext) return;
        setFile(newFile);
        stop();
        const arrayBuffer = await newFile.arrayBuffer();
        const decoded = await audioContext.decodeAudioData(arrayBuffer);
        setBuffer(decoded);
        setBaseBpm(guessBPM(decoded));
        setDuration(decoded.duration);
        pauseTimeRef.current = 0;
        setHotCues([null, null, null, null]);
        setLoopIn(null);
        setLoopOut(null);
        setIsLooping(false);
    };

    const unloadFile = () => {
        stop();
        setFile(null);
        setBuffer(null);
        setDuration(0);
        setBaseBpm(120);
        pauseTimeRef.current = 0;
        setHotCues([null, null, null, null]);
        setLoopIn(null);
        setLoopOut(null);
        setIsLooping(false);
    };

    const getElapsed = () => {
        if (!audioContext || !buffer) return 0;
        if (!isPlaying) return pauseTimeRef.current;
        return (audioContext.currentTime - startTimeRef.current) * pitch + pauseTimeRef.current;
    };

    const updateProgress = () => {
        if (!isPlaying || !audioContext) return;
        const elapsed = getElapsed();

        // Handle looping
        if (isLooping && loopIn !== null && loopOut !== null && elapsed >= loopOut) {
            seek(loopIn);
            return;
        }

        if (elapsed >= (buffer?.duration || 0)) {
            stop();
            return;
        }

        reqFrameRef.current = requestAnimationFrame(updateProgress);
    };

    const play = () => {
        if (!audioContext || !buffer || !gainNodeRef.current) return;
        if (audioContext.state === "suspended") audioContext.resume();

        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = pitch;

        if (eqNodesRef.current) {
            source.connect(eqNodesRef.current.low);
        } else if (compressorRef.current) {
            source.connect(compressorRef.current);
        } else if (gainNodeRef.current) {
            source.connect(gainNodeRef.current);
        }

        source.start(0, pauseTimeRef.current);
        startTimeRef.current = audioContext.currentTime;
        sourceRef.current = source;

        setIsPlaying(true);
        reqFrameRef.current = requestAnimationFrame(updateProgress);
    };

    const pause = () => {
        if (!audioContext || !sourceRef.current) return;
        sourceRef.current.stop();
        sourceRef.current.disconnect();
        pauseTimeRef.current += (audioContext.currentTime - startTimeRef.current) * pitch;
        setIsPlaying(false);
        cancelAnimationFrame(reqFrameRef.current);
    };

    const stop = () => {
        if (sourceRef.current) {
            try { sourceRef.current.stop(); } catch { }
            sourceRef.current.disconnect();
        }
        setIsPlaying(false);
        pauseTimeRef.current = 0;
        cancelAnimationFrame(reqFrameRef.current);
    };

    const togglePlayback = () => {
        if (isPlaying) pause();
        else play();
    };

    const seek = (time: number) => {
        const wasPlaying = isPlaying;
        if (wasPlaying) pause();
        pauseTimeRef.current = time;
        if (wasPlaying) play();
    };

    // Hot Cues
    const handleHotCue = (index: number) => {
        if (hotCues[index] === null) {
            // Set cue
            const newCues = [...hotCues];
            newCues[index] = getElapsed();
            setHotCues(newCues);
        } else {
            // Jump to cue
            seek(hotCues[index]!);
            if (!isPlaying) play();
        }
    };

    const clearHotCue = (index: number) => {
        const newCues = [...hotCues];
        newCues[index] = null;
        setHotCues(newCues);
    };

    // Loop logic
    const toggleLoop = () => {
        if (loopIn !== null && loopOut !== null) {
            setIsLooping(!isLooping);
        } else if (loopIn !== null && loopOut === null) {
            // implicit out at current time
            const current = getElapsed();
            if (current > loopIn) {
                setLoopOut(current);
                setIsLooping(true);
            }
        }
    };

    // Handle pitch changes
    useEffect(() => {
        if (sourceRef.current) {
            sourceRef.current.playbackRate.value = pitch;
        }
    }, [pitch]);

    return {
        file,
        buffer,
        isPlaying,
        getElapsed,
        duration,
        volume,
        pitch,
        eq,
        fx,
        baseBpm,
        loadFile,
        unloadFile,
        togglePlayback,
        stop,
        seek,
        setVolume,
        setPitch,
        setEq,
        setFx,
        setBaseBpm,
        hotCues,
        handleHotCue,
        clearHotCue,
        loopIn,
        setLoopIn,
        loopOut,
        setLoopOut,
        isLooping,
        toggleLoop
    };
}

import { useRef, useState, useEffect } from "react";

export function useAudioDeck(audioContext: AudioContext | null) {
    const [file, setFile] = useState<File | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [pitch, setPitch] = useState(1);
    const [buffer, setBuffer] = useState<AudioBuffer | null>(null);

    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const startTimeRef = useRef(0);
    const pauseTimeRef = useRef(0);
    const reqFrameRef = useRef(0);

    // Setup gain node once context is available
    useEffect(() => {
        if (!audioContext) return;
        const gain = audioContext.createGain();
        gain.connect(audioContext.destination);
        gainNodeRef.current = gain;

        return () => {
            gain.disconnect();
        };
    }, [audioContext]);

    // Handle volume changes
    useEffect(() => {
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = Math.max(0, Math.min(1, volume));
        }
    }, [volume]);

    // Load and decode file
    const loadFile = async (newFile: File) => {
        if (!audioContext) return;
        setFile(newFile);
        stop();
        const arrayBuffer = await newFile.arrayBuffer();
        const decoded = await audioContext.decodeAudioData(arrayBuffer);
        setBuffer(decoded);
        setDuration(decoded.duration);
        setCurrentTime(0);
        pauseTimeRef.current = 0;
    };

    const updateProgress = () => {
        if (!isPlaying || !audioContext) return;
        const elapsed = (audioContext.currentTime - startTimeRef.current) * pitch + pauseTimeRef.current;
        if (elapsed >= (buffer?.duration || 0)) {
            stop();
            return;
        }
        setCurrentTime(elapsed);
        reqFrameRef.current = requestAnimationFrame(updateProgress);
    };

    const play = () => {
        if (!audioContext || !buffer || !gainNodeRef.current) return;
        if (audioContext.state === "suspended") audioContext.resume();

        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = pitch;
        source.connect(gainNodeRef.current);

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
            try { sourceRef.current.stop(); } catch (e) { }
            sourceRef.current.disconnect();
        }
        setIsPlaying(false);
        setCurrentTime(0);
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
        setCurrentTime(time);
        if (wasPlaying) play();
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
        currentTime,
        duration,
        volume,
        pitch,
        loadFile,
        togglePlayback,
        stop,
        seek,
        setVolume,
        setPitch,
    };
}

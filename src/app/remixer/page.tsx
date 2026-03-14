/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { Deck } from "@/components/Deck";
import { SlidersHorizontal, Settings2, Play, Pause, SkipBack } from "lucide-react";
import { useAudioDeck } from "@/hooks/useAudioDeck";
import Link from "next/link";

export default function RemixerPage() {
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [crossfader, setCrossfader] = useState(0.5); // 0 = A, 1 = B
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const deckA = useAudioDeck(audioContext);
    const deckB = useAudioDeck(audioContext);

    const initAudio = () => {
        if (!audioContext) {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            setAudioContext(ctx);
            return ctx;
        }
        if (audioContext.state === "suspended") {
            audioContext.resume();
        }
        return audioContext;
    };

    useEffect(() => {
        document.addEventListener("click", initAudio, { once: true });
        return () => document.removeEventListener("click", initAudio);
    }, [audioContext]);

    // Apply Crossfader (Equal Power)
    useEffect(() => {
        // Cosine/Sine equal power panning
        const gainA = Math.cos(crossfader * 0.5 * Math.PI);
        const gainB = Math.cos((1.0 - crossfader) * 0.5 * Math.PI);

        deckA.setVolume(gainA);
        deckB.setVolume(gainB);
    }, [crossfader, deckA, deckB]);

    const handleCrossfader = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCrossfader(parseFloat(e.target.value));
    };

    const handleSync = () => {
        if (deckA.buffer && deckB.buffer) {
            deckB.setPitch(deckA.pitch);
            if (deckA.isPlaying && !deckB.isPlaying) {
                deckB.seek(deckA.getElapsed());
                deckB.togglePlayback();
            }
        }
    };

    const handleAutomix = async () => {
        if (!deckA.buffer && !deckB.buffer) return;
        setIsAiLoading(true);
        try {
            const res = await fetch('/api/automix', {
                method: 'POST',
                body: JSON.stringify({
                    trackA: { bpm: deckA.baseBpm * deckA.pitch, elapsed: deckA.getElapsed(), duration: deckA.duration || 1 },
                    trackB: { bpm: deckB.baseBpm * deckB.pitch, elapsed: deckB.getElapsed(), duration: deckB.duration || 1 }
                })
            });
            const data = await res.json();
            if (data.suggestion) {
                setAiSuggestion(data.suggestion);
                setTimeout(() => setAiSuggestion(null), 15000);
            }
        } catch (e) {
            console.error("AI Automix failed:", e);
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-black text-white p-2 md:p-4 gap-2 md:gap-4 overflow-y-auto relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Top Navigation */}
            <header className="flex items-center justify-between h-12 md:h-14 bg-white/5 backdrop-blur-md rounded-xl px-6 border border-white/10 shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="font-black text-xl tracking-tighter hover:text-emerald-400 transition-colors">
                        WAVE<span className="text-emerald-500">CRAFT</span>
                    </Link>
                    <div className="px-3 py-1 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black tracking-widest uppercase">
                        Remixer Pro
                    </div>
                </div>

                {/* Master Controls */}
                <div className="flex items-center gap-6 text-white/50 text-xs font-mono font-medium">
                    {!audioContext && <span className="text-yellow-500 animate-pulse">CLICK ANYWHERE TO INIT AUDIO</span>}
                    {audioContext && audioContext.state === "running" && <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-[pulse_2s_ease-in-out_infinite]" /> ENGINE ACTIVE</span>}
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex gap-1 items-end h-4 w-12">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className={`w-1.5 ${i > 4 ? 'bg-red-500' : 'bg-emerald-500'} rounded-sm opacity-50`} style={{ height: `${i * 16}%` }} />)}
                    </div>
                    <button className="hover:text-white transition-colors p-2"><Settings2 className="w-4 h-4" /></button>
                </div>
            </header>

            {/* Main DJ Interface */}
            <div className="flex flex-1 gap-2 md:gap-4 min-h-0 z-10">
                {/* Left Deck (Deck A) */}
                <Deck deckName="A" colorClass="emerald" audioState={deckA} onInteraction={initAudio} />

                {/* Central Mixer */}
                <div className="w-80 flex flex-col gap-2 md:gap-4 shrink-0 overflow-hidden">
                    <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-2 md:p-3 flex flex-col items-center shadow-2xl relative min-h-0">
                        {/* Mixer Header */}
                        <div className="w-full flex justify-between items-center mb-2 md:mb-4 shrink-0">
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSync}
                                    className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black border border-emerald-500/50 rounded text-xs font-bold transition-all"
                                >
                                    SYNC
                                </button>
                                <button
                                    onClick={handleAutomix}
                                    disabled={isAiLoading}
                                    className={`px-3 py-1.5 flex items-center gap-1.5 ${isAiLoading ? 'bg-purple-500/30' : 'bg-purple-500/10 hover:bg-purple-500 hover:text-black'} text-purple-400 border border-purple-500/50 rounded text-xs font-bold transition-all`}
                                >
                                    {isAiLoading ? <span className="animate-spin text-sm">↻</span> : <span className="text-sm">✨</span>}
                                    {isAiLoading ? 'THINKING' : 'AI COPILOT'}
                                </button>
                            </div>
                            <h3 className="text-white/40 text-[10px] md:text-xs font-bold tracking-widest flex items-center gap-2">
                                MIXER <SlidersHorizontal className="w-3 h-3" />
                            </h3>
                        </div>

                        {aiSuggestion && (
                            <div className="w-full mb-2 p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[10px] text-purple-300 font-mono tracking-wide leading-tight animate-[fadeIn_0.5s_ease-out] shrink-0">
                                <span className="font-bold text-purple-400">DJ ASSISTANT:</span> {aiSuggestion}
                            </div>
                        )}
                        {/* EQ Section */}
                        <div className="flex justify-between gap-2 md:gap-4 flex-1 w-full px-1 md:px-2 min-h-0 overflow-y-auto custom-scrollbar">
                            {/* Channel A EQ */}
                            <div className="flex flex-col items-center gap-4 md:gap-6 py-2">
                                <div className="text-emerald-500 text-[9px] md:text-[10px] font-bold tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">CH A</div>

                                {['high', 'mid', 'low'].map((band) => (
                                    <div key={band} className="flex flex-col items-center gap-1.5 md:gap-2">
                                        <span className="text-white/30 text-[8px] md:text-[9px] font-mono uppercase">{band}</span>
                                        <div
                                            className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-emerald-500/30 bg-black relative cursor-pointer hover:border-emerald-500/60 shadow-[inset_0_2px_10px_rgba(255,255,255,0.05)]"
                                            onClick={() => {
                                                const current = (deckA.eq as any)[band];
                                                const next = current === 0 ? 12 : current === 12 ? -12 : 0;
                                                deckA.setEq({ ...deckA.eq, [band]: next });
                                            }}
                                            onWheel={(e) => {
                                                const delta = e.deltaY > 0 ? -1 : 1;
                                                const next = Math.max(-12, Math.min(12, (deckA.eq as any)[band] + delta));
                                                deckA.setEq({ ...deckA.eq, [band]: next });
                                            }}
                                        >
                                            <div
                                                className="w-1 h-2.5 bg-emerald-500 absolute top-1 left-1/2 -translate-x-1/2 rounded-full shadow-[0_0_5px_#10b981]"
                                                style={{
                                                    transform: `translateX(-50%) rotate(${(deckA.eq as any)[band] * 15}deg)`,
                                                    transformOrigin: "bottom center"
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Master / Meters / FX */}
                            <div className="flex flex-col items-center justify-between py-2 gap-2 md:gap-4">
                                <div className="text-white/20 text-[8px] md:text-[9px] font-bold tracking-[0.2em] uppercase text-center w-full">FX & DYN</div>

                                <div className="flex flex-col gap-2 md:gap-4">
                                    {/* Delay Feedback Knob */}
                                    <div className="flex flex-col items-center gap-1">
                                        <div
                                            className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-white/10 bg-black/40 relative cursor-pointer hover:border-white/30"
                                            onWheel={(e) => {
                                                const delta = e.deltaY > 0 ? -0.05 : 0.05;
                                                deckA.setFx({ ...deckA.fx, delayFeedback: Math.max(0, Math.min(0.9, deckA.fx.delayFeedback + delta)) });
                                                deckB.setFx({ ...deckB.fx, delayFeedback: Math.max(0, Math.min(0.9, deckB.fx.delayFeedback + delta)) });
                                            }}
                                        >
                                            <div
                                                className="w-0.5 h-2 bg-white/40 absolute top-1 left-1/2 -translate-x-1/2 rounded-full"
                                                style={{ transform: `translateX(-50%) rotate(${deckA.fx.delayFeedback * 300 - 150}deg)`, transformOrigin: "bottom center" }}
                                            />
                                        </div>
                                        <span className="text-[7px] md:text-[8px] text-white/30 uppercase">Delay</span>
                                    </div>

                                    {/* Reverb Mix Knob */}
                                    <div className="flex flex-col items-center gap-1">
                                        <div
                                            className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-white/10 bg-black/40 relative cursor-pointer hover:border-white/30"
                                            onWheel={(e) => {
                                                const delta = e.deltaY > 0 ? -0.05 : 0.05;
                                                deckA.setFx({ ...deckA.fx, reverbMix: Math.max(0, Math.min(0.8, deckA.fx.reverbMix + delta)) });
                                                deckB.setFx({ ...deckB.fx, reverbMix: Math.max(0, Math.min(0.8, deckB.fx.reverbMix + delta)) });
                                            }}
                                        >
                                            <div
                                                className="w-0.5 h-2 bg-white/40 absolute top-1 left-1/2 -translate-x-1/2 rounded-full"
                                                style={{ transform: `translateX(-50%) rotate(${deckA.fx.reverbMix * 300 - 150}deg)`, transformOrigin: "bottom center" }}
                                            />
                                        </div>
                                        <span className="text-[7px] md:text-[8px] text-white/30 uppercase">Rev</span>
                                    </div>

                                    {/* Width / Spatial Knob */}
                                    <div className="flex flex-col items-center gap-1">
                                        <div
                                            className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-white/10 bg-black/40 relative cursor-pointer hover:border-white/30"
                                            onWheel={(e) => {
                                                const delta = e.deltaY > 0 ? -0.05 : 0.05;
                                                const next = Math.max(0.5, Math.min(2.0, deckA.fx.width + delta));
                                                deckA.setFx({ ...deckA.fx, width: next });
                                                deckB.setFx({ ...deckB.fx, width: next });
                                            }}
                                        >
                                            <div
                                                className="w-0.5 h-2 bg-cyan-400 absolute top-1 left-1/2 -translate-x-1/2 rounded-full shadow-[0_0_5px_rgba(34,211,238,0.5)]"
                                                style={{ transform: `translateX(-50%) rotate(${((deckA.fx.width - 0.5) / 1.5) * 300 - 150}deg)`, transformOrigin: "bottom center" }}
                                            />
                                        </div>
                                        <span className="text-[7px] md:text-[8px] text-white/30 uppercase">Wide</span>
                                    </div>

                                    {/* Comp Knob */}
                                    <div className="flex flex-col items-center gap-1">
                                        <div
                                            className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-white/10 bg-black/40 relative cursor-pointer hover:border-white/30"
                                            onWheel={(e) => {
                                                const delta = e.deltaY > 0 ? -1 : 1;
                                                const next = Math.max(-60, Math.min(0, deckA.fx.compression + delta));
                                                deckA.setFx({ ...deckA.fx, compression: next });
                                                deckB.setFx({ ...deckB.fx, compression: next });
                                            }}
                                        >
                                            <div
                                                className="w-0.5 h-2 bg-emerald-400 absolute top-1 left-1/2 -translate-x-1/2 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.5)]"
                                                style={{ transform: `translateX(-50%) rotate(${((deckA.fx.compression + 60) / 60) * 300 - 150}deg)`, transformOrigin: "bottom center" }}
                                            />
                                        </div>
                                        <span className="text-[7px] md:text-[8px] text-white/30 uppercase">Comp</span>
                                    </div>
                                </div>

                                {/* Channel Volume Faders */}
                                <div className="flex gap-4 md:gap-8 mt-2 w-full justify-center px-1 md:px-4">
                                    {/* Deck A Volume */}
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="text-[8px] md:text-[9px] text-white/40 font-bold uppercase tracking-widest">VOL A</div>
                                        <div className="relative h-16 md:h-20 w-6 md:w-8 flex justify-center bg-black/40 rounded-lg border border-white/5 py-2">
                                            {/* Track */}
                                            <div className="absolute w-1 h-full bg-white/10 rounded-full" />
                                            {/* Slider */}
                                            <input
                                                type="range"
                                                min="0" max="1" step="0.01"
                                                value={deckA.volume}
                                                onChange={(e) => deckA.setVolume(parseFloat(e.target.value))}
                                                className="absolute w-16 md:w-20 h-4 -rotate-90 top-1/2 -translate-y-1/2 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:shadow-lg"
                                            />
                                            {/* Visual Level Meter */}
                                            <div className="absolute left-0.5 md:left-1 bottom-2 w-0.5 bg-black/50 rounded-full overflow-hidden" style={{ height: 'calc(100% - 16px)' }}>
                                                <div className="absolute bottom-0 w-full bg-emerald-500/50" style={{ height: `${deckA.volume * 100}%` }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Deck B Volume */}
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="text-[8px] md:text-[9px] text-white/40 font-bold uppercase tracking-widest">VOL B</div>
                                        <div className="relative h-16 md:h-20 w-6 md:w-8 flex justify-center bg-black/40 rounded-lg border border-white/5 py-2">
                                            {/* Track */}
                                            <div className="absolute w-1 h-full bg-white/10 rounded-full" />
                                            {/* Slider */}
                                            <input
                                                type="range"
                                                min="0" max="1" step="0.01"
                                                value={deckB.volume}
                                                onChange={(e) => deckB.setVolume(parseFloat(e.target.value))}
                                                className="absolute w-16 md:w-20 h-4 -rotate-90 top-1/2 -translate-y-1/2 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:shadow-lg"
                                            />
                                            {/* Visual Level Meter */}
                                            <div className="absolute right-0.5 md:right-1 bottom-2 w-0.5 bg-black/50 rounded-full overflow-hidden" style={{ height: 'calc(100% - 16px)' }}>
                                                <div className="absolute bottom-0 w-full bg-cyan-500/50" style={{ height: `${deckB.volume * 100}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Channel B EQ */}
                            <div className="flex flex-col items-center gap-4 md:gap-6 py-2">
                                <div className="text-cyan-500 text-[9px] md:text-[10px] font-bold tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">CH B</div>

                                {['high', 'mid', 'low'].map((band) => (
                                    <div key={band} className="flex flex-col items-center gap-1.5 md:gap-2">
                                        <span className="text-white/30 text-[8px] md:text-[9px] font-mono uppercase">{band}</span>
                                        <div
                                            className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-cyan-500/30 bg-black relative cursor-pointer hover:border-cyan-500/60 shadow-[inset_0_2px_10px_rgba(255,255,255,0.05)]"
                                            onClick={() => {
                                                const current = (deckB.eq as any)[band];
                                                const next = current === 0 ? 12 : current === 12 ? -12 : 0;
                                                deckB.setEq({ ...deckB.eq, [band]: next });
                                            }}
                                            onWheel={(e) => {
                                                const delta = e.deltaY > 0 ? -1 : 1;
                                                const next = Math.max(-12, Math.min(12, (deckB.eq as any)[band] + delta));
                                                deckB.setEq({ ...deckB.eq, [band]: next });
                                            }}
                                        >
                                            <div
                                                className="w-1 h-2.5 bg-cyan-500 absolute top-1 left-1/2 -translate-x-1/2 rounded-full shadow-[0_0_5px_#06b6d4]"
                                                style={{
                                                    transform: `translateX(-50%) rotate(${(deckB.eq as any)[band] * 15}deg)`,
                                                    transformOrigin: "bottom center"
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Crossfader */}
                        <div className="w-full mt-auto bg-black/40 rounded-xl p-2 md:p-3 border border-white/5 relative shrink-0">
                            <div className="flex justify-between text-[9px] md:text-[10px] font-bold font-mono text-white/30 mb-1 px-1 tracking-widest">
                                <span className="text-emerald-500/50">A</span>
                                <span>CROSSFADER</span>
                                <span className="text-cyan-500/50">B</span>
                            </div>

                            <div className="relative h-8 md:h-10 flex items-center">
                                <div className="absolute w-full h-1 md:h-1.5 bg-white/10 rounded-full" />
                                <div className="absolute w-full h-0.5 bg-black rounded-full" />

                                <input
                                    type="range"
                                    min="0" max="1" step="0.01"
                                    value={crossfader}
                                    onChange={handleCrossfader}
                                    className="w-full absolute z-10 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:md:w-10 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:md:h-8 [&::-webkit-slider-thumb]:bg-zinc-300 [&::-webkit-slider-thumb]:rounded [&::-webkit-slider-thumb]:shadow-xl [&::-webkit-slider-thumb]:border-b-4 [&::-webkit-slider-thumb]:border-zinc-500"
                                />

                                {/* Visual marker lines inside the track */}
                                <div className="absolute w-0.5 h-2 md:h-3 bg-white/20 left-1/2 -translate-x-1/2 z-0" />
                                <div className="absolute w-0.5 h-1.5 md:h-2 bg-white/10 left-1/4 -translate-x-1/2 z-0" />
                                <div className="absolute w-0.5 h-1.5 md:h-2 bg-white/10 left-3/4 -translate-x-1/2 z-0" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Deck (Deck B) */}
                <Deck deckName="B" colorClass="cyan" audioState={deckB} onInteraction={initAudio} />
            </div>

            {/* Track Library / Bottom Panel */}
            <div className="h-32 md:h-40 lg:h-48 bg-white/5 backdrop-blur border border-white/10 rounded-xl shrink-0 flex flex-col overflow-hidden z-10">
                <div className="h-8 md:h-10 border-b border-white/10 bg-black/40 flex items-center px-4 text-[9px] md:text-[10px] font-bold text-white/40 tracking-widest font-mono">
                    <div className="w-12 text-center">DECK</div>
                    <div className="flex-1">TITLE</div>
                    <div className="w-32">DURATION</div>
                    <div className="w-32 text-right">STATUS</div>
                </div>

                <div className="flex-1 flex flex-col">
                    {deckA.file ? (
                        <div className="flex items-center px-4 py-3 border-b border-white/5 hover:bg-white/5 text-sm group">
                            <div className="w-12 text-center font-bold text-emerald-500 text-xs bg-emerald-500/10 py-1 rounded w-8 mx-auto -ml-2 border border-emerald-500/20">A</div>
                            <div className="flex-1 font-medium pl-6">{deckA.file.name}</div>
                            <div className="w-32 text-white/40 font-mono text-xs">{(deckA.duration / 60).toFixed(1)} mins</div>
                            <div className="w-32 text-right">
                                <span className={`text-[10px] px-2 py-0.5 border rounded-full font-bold tracking-widest ${deckA.isPlaying ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-white/20 text-white/50'}`}>
                                    {deckA.isPlaying ? "PLAYING" : "LOADED"}
                                </span>
                            </div>
                        </div>
                    ) : null}

                    {deckB.file ? (
                        <div className="flex items-center px-4 py-3 border-b border-white/5 hover:bg-white/5 text-sm group">
                            <div className="w-12 text-center font-bold text-cyan-500 text-xs bg-cyan-500/10 py-1 rounded w-8 mx-auto -ml-2 border border-cyan-500/20">B</div>
                            <div className="flex-1 font-medium pl-6">{deckB.file.name}</div>
                            <div className="w-32 text-white/40 font-mono text-xs">{(deckB.duration / 60).toFixed(1)} mins</div>
                            <div className="w-32 text-right">
                                <span className={`text-[10px] px-2 py-0.5 border rounded-full font-bold tracking-widest ${deckB.isPlaying ? 'border-cyan-500 text-cyan-500 bg-cyan-500/10' : 'border-white/20 text-white/50'}`}>
                                    {deckB.isPlaying ? "PLAYING" : "LOADED"}
                                </span>
                            </div>
                        </div>
                    ) : null}

                    {!deckA.file && !deckB.file && (
                        <div className="flex-1 flex flex-col items-center justify-center text-white/30 text-xs font-mono tracking-widest">
                            <div className="w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                            </div>
                            DRAG & DROP AUDIO FILES DIRECTLY ONTO DECK A OR DECK B
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

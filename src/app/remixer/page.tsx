"use client";

import { useState, useEffect, useRef } from "react";
import { Deck } from "@/components/Deck";
import { SlidersHorizontal, Settings2, Play, Pause, SkipBack } from "lucide-react";
import { useAudioDeck } from "@/hooks/useAudioDeck";
import Link from "next/link";

export default function RemixerPage() {
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [crossfader, setCrossfader] = useState(0.5); // 0 = A, 1 = B

    // EQs (0-1)
    const [eqA, setEqA] = useState({ high: 0.5, mid: 0.5, low: 0.5 });
    const [eqB, setEqB] = useState({ high: 0.5, mid: 0.5, low: 0.5 });

    const deckA = useAudioDeck(audioContext);
    const deckB = useAudioDeck(audioContext);

    useEffect(() => {
        // Init AudioContext on first click to bypass browser autoplay policies
        const initAudio = () => {
            if (!audioContext) {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                setAudioContext(ctx);
            }
        };

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

    // Sync B to A
    const handleSync = () => {
        if (deckA.buffer && deckB.buffer) {
            deckB.setPitch(deckA.pitch);
            if (deckA.isPlaying && !deckB.isPlaying) {
                deckB.seek(deckA.currentTime);
                deckB.togglePlayback();
            }
        }
    };

    return (
        <div className="flex flex-col h-screen bg-black text-white p-4 gap-4 overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Top Navigation */}
            <header className="flex items-center justify-between h-14 bg-white/5 backdrop-blur-md rounded-xl px-6 border border-white/10 shrink-0 z-10">
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
            <div className="flex flex-1 gap-4 min-h-0 z-10">
                {/* Left Deck (Deck A) */}
                <Deck deckName="A" colorClass="emerald" audioState={deckA} />

                {/* Central Mixer */}
                <div className="w-80 flex flex-col gap-4 shrink-0">
                    <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex flex-col items-center shadow-2xl relative overflow-hidden">
                        {/* Mixer Header */}
                        <div className="w-full flex justify-between items-center mb-6">
                            <button
                                onClick={handleSync}
                                className="text-[10px] font-bold px-3 py-1.5 rounded border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all text-white/60"
                            >
                                SYNC B TO A
                            </button>
                            <h3 className="text-white/40 text-xs font-bold tracking-widest flex items-center gap-2">
                                MIXER <SlidersHorizontal className="w-3 h-3" />
                            </h3>
                        </div>

                        {/* EQ Section */}
                        <div className="flex justify-between gap-4 flex-1 w-full px-2">
                            {/* Channel A EQ */}
                            <div className="flex flex-col items-center gap-6">
                                <div className="text-emerald-500 text-[10px] font-bold tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">CH A</div>

                                {['HIGH', 'MID', 'LOW'].map((band) => (
                                    <div key={band} className="flex flex-col items-center gap-2">
                                        <span className="text-white/30 text-[9px] font-mono">{band}</span>
                                        <div className="w-10 h-10 rounded-full border border-emerald-500/30 bg-black relative cursor-pointer hover:border-emerald-500/60 shadow-[inset_0_2px_10px_rgba(255,255,255,0.05)]">
                                            <div className="w-1 h-3 bg-emerald-500 absolute top-1 left-1/2 -translate-x-1/2 rounded-full shadow-[0_0_5px_#10b981]" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Master / Meters */}
                            <div className="flex flex-col items-center justify-between py-8 content-center">
                                <div className="w-10 h-48 bg-black/60 border border-white/10 rounded-lg overflow-hidden flex justify-center gap-1.5 p-1.5 shadow-inner">
                                    {/* Left specific fake meter for aesthetics since analyser nodes are heavy */}
                                    <div className="w-2.5 h-full flex flex-col justify-end gap-[1px]">
                                        {Array.from({ length: 20 }).map((_, i) => (
                                            <div key={`L${i}`} className={`w-full flex-1 rounded-sm opacity-20 ${i < 4 ? 'bg-red-500' : i < 8 ? 'bg-yellow-500' : 'bg-emerald-500'}`} />
                                        ))}
                                    </div>
                                    {/* Right specific fake meter */}
                                    <div className="w-2.5 h-full flex flex-col justify-end gap-[1px]">
                                        {Array.from({ length: 20 }).map((_, i) => (
                                            <div key={`R${i}`} className={`w-full flex-1 rounded-sm opacity-20 ${i < 4 ? 'bg-red-500' : i < 8 ? 'bg-yellow-500' : 'bg-emerald-500'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Channel B EQ */}
                            <div className="flex flex-col items-center gap-6">
                                <div className="text-cyan-500 text-[10px] font-bold tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">CH B</div>

                                {['HIGH', 'MID', 'LOW'].map((band) => (
                                    <div key={band} className="flex flex-col items-center gap-2">
                                        <span className="text-white/30 text-[9px] font-mono">{band}</span>
                                        <div className="w-10 h-10 rounded-full border border-cyan-500/30 bg-black relative cursor-pointer hover:border-cyan-500/60 shadow-[inset_0_2px_10px_rgba(255,255,255,0.05)]">
                                            <div className="w-1 h-3 bg-cyan-500 absolute top-1 left-1/2 -translate-x-1/2 rounded-full shadow-[0_0_5px_#06b6d4]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Crossfader */}
                        <div className="w-full mt-8 bg-black/40 rounded-xl p-4 border border-white/5 relative">
                            <div className="flex justify-between text-[10px] font-bold font-mono text-white/30 mb-2 px-1 tracking-widest">
                                <span className="text-emerald-500/50">A</span>
                                <span>CROSSFADER</span>
                                <span className="text-cyan-500/50">B</span>
                            </div>

                            <div className="relative h-10 flex items-center">
                                <div className="absolute w-full h-1.5 bg-white/10 rounded-full" />
                                <div className="absolute w-full h-0.5 bg-black rounded-full" />

                                <input
                                    type="range"
                                    min="0" max="1" step="0.01"
                                    value={crossfader}
                                    onChange={handleCrossfader}
                                    className="w-full absolute z-10 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-10 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:bg-zinc-300 [&::-webkit-slider-thumb]:rounded [&::-webkit-slider-thumb]:shadow-xl [&::-webkit-slider-thumb]:border-b-4 [&::-webkit-slider-thumb]:border-zinc-500"
                                />

                                {/* Visual marker lines inside the track */}
                                <div className="absolute w-0.5 h-3 bg-white/20 left-1/2 -translate-x-1/2 z-0" />
                                <div className="absolute w-0.5 h-2 bg-white/10 left-1/4 -translate-x-1/2 z-0" />
                                <div className="absolute w-0.5 h-2 bg-white/10 left-3/4 -translate-x-1/2 z-0" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Deck (Deck B) */}
                <Deck deckName="B" colorClass="cyan" audioState={deckB} />
            </div>

            {/* Track Library / Bottom Panel */}
            <div className="h-64 bg-white/5 backdrop-blur border border-white/10 rounded-xl shrink-0 flex flex-col overflow-hidden z-10">
                <div className="h-10 border-b border-white/10 bg-black/40 flex items-center px-4 text-[10px] font-bold text-white/40 tracking-widest font-mono">
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

/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useRef, useEffect } from "react";

export function Deck({
    deckName,
    colorClass = "emerald",
    audioState,
    onInteraction
}: {
    deckName: string;
    colorClass?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    audioState: any;
    onInteraction?: () => void;
}) {
    const [isDragging, setIsDragging] = useState(false);

    const {
        file, isPlaying, getElapsed, duration,
        togglePlayback, seek, loadFile, unloadFile, setPitch, pitch,
        baseBpm, loopIn, setLoopIn, loopOut, setLoopOut, isLooping, toggleLoop,
        hotCues, handleHotCue, clearHotCue
    } = audioState;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [aestheticBars, setAestheticBars] = useState<number[]>(Array(40).fill(20));

    useEffect(() => {
        // Run once on mount to establish pure random values without SSR mismatch
        setAestheticBars(Array.from({ length: 40 }).map(() => 20 + Math.random() * 60));
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "copy";
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const progressFillRef = useRef<HTMLDivElement>(null);
    const progressLineRef = useRef<HTMLDivElement>(null);
    const timeTextRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        let reqId: number;
        const updateUI = () => {
            if (duration) {
                const elapsed = getElapsed();
                const progress = (elapsed / duration) * 100;
                if (progressFillRef.current) progressFillRef.current.style.width = `${progress}%`;
                if (progressLineRef.current) progressLineRef.current.style.left = `${progress}%`;
                if (timeTextRef.current) timeTextRef.current.textContent = formatTime(elapsed);
            }
            reqId = requestAnimationFrame(updateUI);
        };
        reqId = requestAnimationFrame(updateUI);
        return () => cancelAnimationFrame(reqId);
    }, [duration, getElapsed]);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        onInteraction?.();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith("audio/")) {
                await loadFile(file);
            } else {
                alert("Please drop a valid audio file (.mp3, .wav, etc).");
            }
        }
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    // Calculate values mostly once
    const colorHex = colorClass === "emerald" ? "#10b981" : "#0ea5e9";

    return (
        <div
            className={`flex-1 rounded-xl p-4 flex flex-col gap-2 md:gap-3 border transition-colors ${isDragging ? `border-${colorClass}-500 bg-white/10` : "border-white/5 bg-white/5"
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border"
                        style={{
                            background: `rgba(${colorClass === "emerald" ? "16,185,129" : "6,182,212"},0.15)`,
                            borderColor: colorHex,
                            color: colorHex
                        }}
                    >
                        {deckName}
                    </div>
                    <div className="flex flex-col gap-1 w-full flex-1">
                        <div className="flex justify-between items-end border-b border-white/10 pb-1 mb-1">
                            <span className="text-[10px] font-bold text-white/50">{deckName}</span>
                            <span ref={timeTextRef} className="text-xl font-mono font-bold tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                                {formatTime(0)}
                            </span>
                            <span className="text-[10px] font-mono text-white/40 border border-white/10 px-1 rounded bg-black/20">
                                {formatTime(duration)}
                            </span>
                        </div>
                        <div className="text-white font-medium text-sm truncate w-40">
                            {file ? file.name : "Drop Audio File Here"}
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => {
                        onInteraction?.();
                        fileInputRef.current?.click();
                    }}
                    className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 rounded px-2 py-1 text-white/50 hover:text-white transition-colors uppercase font-bold tracking-wider"
                >
                    Browse
                </button>
                {file && (
                    <button
                        onClick={() => { unloadFile?.(); }}
                        title="Eject / Unload track"
                        className="text-[10px] bg-red-500/10 hover:bg-red-500/80 border border-red-500/40 rounded px-2 py-1 text-red-400 hover:text-white transition-all uppercase font-bold tracking-wider ml-1 flex items-center gap-1"
                    >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M5 20h14v-2H5v2zm7-18L5.33 13h13.34L12 2z"/></svg>
                        Eject
                    </button>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="audio/*"
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) loadFile(f);
                    }}
                />
            </div>

            {/* Waveform / Progress Scrub */}
            <div
                className="h-16 md:h-20 rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer"
                style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.05)" }}
                onClick={(e) => {
                    if (!duration) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    seek(percent * duration);
                }}
            >
                {file ? (
                    <>
                        {/* Progress fill */}
                        <div
                            ref={progressFillRef}
                            className="absolute left-0 top-0 bottom-0 opacity-20 pointer-events-none"
                            style={{ width: `0%`, background: colorHex }}
                        />
                        {/* Loop Visual Overlay */}
                        {loopIn !== null && (
                            <div 
                                className={`absolute top-0 bottom-0 pointer-events-none border-l-2 shadow-[0_0_15px_rgba(251,191,36,0.5)] ${isLooping || loopOut === null ? 'bg-amber-400/30' : 'bg-amber-400/10'}`}
                                style={{
                                    left: `${(loopIn / duration) * 100}%`,
                                    width: loopOut !== null ? `${((loopOut - loopIn) / duration) * 100}%` : `calc(100% - ${(loopIn / duration) * 100}%)`,
                                    borderLeftColor: '#fbbf24',
                                    borderRight: loopOut !== null ? '2px solid #fbbf24' : 'none',
                                    transition: 'background-color 0.2s ease',
                                    zIndex: 10
                                }}
                            />
                        )}
                        {/* Progress line */}
                        <div
                            ref={progressLineRef}
                            className="absolute top-0 bottom-0 w-0.5 shadow-[0_0_10px_rgba(255,255,255,0.5)] pointer-events-none z-20"
                            style={{ left: `0%`, background: colorHex }}
                        />
                        {/* Generic waveform bars for aesthetic */}
                        <div className="flex items-center gap-[2px] w-full px-2 opacity-50 pointer-events-none z-0">
                            {aestheticBars.map((height, i) => (
                                <div key={i} className="flex-1 bg-white/40 rounded-full" style={{ height: `${height}%` }} />
                            ))}
                        </div>
                    </>
                ) : (
                    <span className="text-white/20 text-xs font-medium">NO TRACK LOADED</span>
                )}
            </div>

            {/* Loop & Hot Cues Row */}
            <div className="flex justify-between items-center gap-4">
                {/* Loop Controls */}
                <div className="flex flex-col gap-1">
                    <div className="flex bg-black/50 rounded-lg p-1 border border-white/10 gap-0.5">
                        {/* IN button — sets loop start at current playhead */}
                        <button
                            title="Set Loop IN point at current position"
                            className={`text-[9px] font-bold px-3 py-1.5 rounded transition-all ${
                                loopIn !== null
                                    ? 'bg-amber-500 text-black shadow-[0_0_8px_#f59e0b]'
                                    : 'text-white/50 hover:bg-white/10 hover:text-white'
                            }`}
                            onClick={() => {
                                if (!file) return;
                                if (loopIn === null) {
                                    setLoopIn(getElapsed());
                                } else {
                                    // Re-press: reset IN point
                                    setLoopIn(null);
                                    setLoopOut(null);
                                }
                            }}
                        >
                            {loopIn !== null ? `IN ${loopIn.toFixed(1)}s` : 'IN'}
                        </button>

                        {/* OUT button — sets loop end at current playhead, only valid after IN */}
                        <button
                            title={loopIn === null ? 'Set IN point first' : 'Set Loop OUT point at current position'}
                            disabled={loopIn === null}
                            className={`text-[9px] font-bold px-3 py-1.5 rounded transition-all disabled:opacity-30 ${
                                loopOut !== null
                                    ? 'bg-amber-400 text-black shadow-[0_0_8px_#fbbf24]'
                                    : loopIn !== null
                                    ? 'text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20'
                                    : 'text-white/50 hover:bg-white/10 hover:text-white'
                            }`}
                            onClick={() => {
                                if (loopIn === null) return;
                                if (loopOut === null) {
                                    const out = getElapsed();
                                    if (out > loopIn + 0.05) setLoopOut(out);
                                } else {
                                    setLoopOut(null);
                                }
                            }}
                        >
                            {loopOut !== null ? `OUT ${loopOut.toFixed(1)}s` : 'OUT'}
                        </button>

                        {/* RELOOP — jumps back to IN and toggles loop active state */}
                        <button
                            title={
                                loopIn === null ? 'Set IN/OUT points first' :
                                isLooping ? 'Exit loop' : 'Jump to IN and loop'
                            }
                            disabled={loopIn === null || loopOut === null}
                            className={`text-[9px] font-bold px-3 py-1.5 rounded transition-all disabled:opacity-30 ${
                                isLooping
                                    ? 'bg-amber-500 text-black shadow-[0_0_12px_#f59e0b] animate-[pulse_2s_ease-in-out_infinite]'
                                    : loopIn !== null && loopOut !== null
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/40'
                                    : 'text-white/50 hover:bg-white/10 hover:text-white'
                            }`}
                            onClick={() => {
                                if (loopIn !== null && loopOut !== null) {
                                    if (!isLooping) {
                                        // Jump to loop start and activate
                                        seek(loopIn);
                                        if (!isPlaying) togglePlayback();
                                    }
                                    toggleLoop();
                                }
                            }}
                        >
                            {isLooping ? '⟳ LOOP' : 'RELOOP'}
                        </button>
                    </div>
                    {/* Loop state label */}
                    <div className="text-[8px] font-mono text-white/30 pl-1">
                        {!loopIn ? 'No loop set' : !loopOut ? `IN: ${loopIn.toFixed(1)}s — waiting for OUT` : isLooping ? `LOOPING ${loopIn.toFixed(1)}s → ${loopOut.toFixed(1)}s` : `Loop ready (${(loopOut - loopIn).toFixed(1)}s)`}
                    </div>
                </div>

                {/* Hot Cues */}
                <div className="flex flex-col gap-1 items-end">
                    <div className="text-[8px] font-mono text-white/30">HOT CUES (right-click to clear)</div>
                    <div className="flex gap-2">
                        {hotCues.map((cue: number | null, i: number) => (
                            <button
                                key={i}
                                className={`w-10 h-8 rounded border transition-all relative group ${cue !== null ? `bg-${colorClass}-500/20 border-${colorClass}-500/50 shadow-[0_0_8px_rgba(${colorClass === 'emerald' ? '16,185,129' : '6,182,212'},0.4)]` : 'bg-black/50 border-white/5 hover:bg-white/5'}`}
                                onClick={() => handleHotCue(i)}
                                onContextMenu={(e) => { e.preventDefault(); clearHotCue(i); }}
                                title={cue !== null ? `Jump to ${cue.toFixed(1)}s` : `Set cue ${i + 1}`}
                            >
                                {cue !== null && (
                                    <span className={`text-[7px] font-mono absolute top-1 left-1 text-${colorClass}-400/60`}>{cue.toFixed(0)}s</span>
                                )}
                                <span className={`text-[8px] font-bold absolute bottom-1 right-1 ${cue !== null ? `text-${colorClass}-400` : 'text-white/20'}`}>{i + 1}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* FX Sliders Panel */}
            <div className="bg-black/40 rounded-xl border border-white/5 p-3 flex flex-col gap-2">
                <div className="text-[9px] font-bold text-white/30 tracking-widest uppercase mb-1">Effects</div>
                {[
                    { label: 'Delay Time', key: 'delayTime', min: 0, max: 1, step: 0.01, color: colorHex },
                    { label: 'Delay Fbk', key: 'delayFeedback', min: 0, max: 0.9, step: 0.01, color: colorHex },
                    { label: 'Reverb', key: 'reverbMix', min: 0, max: 0.8, step: 0.01, color: colorHex },
                    { label: 'Width', key: 'width', min: 0.5, max: 2.0, step: 0.01, color: colorHex },
                    { label: 'Compression', key: 'compression', min: -60, max: 0, step: 1, color: colorHex },
                ].map(({ label, key, min, max, step, color }) => {
                    const value = (audioState.fx as any)[key];
                    const pct = ((value - min) / (max - min)) * 100;
                    return (
                        <div key={key} className="flex items-center gap-2">
                            <span className="text-[8px] font-mono text-white/40 w-20 shrink-0">{label}</span>
                            <div className="relative flex-1 h-3 flex items-center group">
                                {/* Track BG */}
                                <div className="absolute w-full h-1 bg-white/10 rounded-full" />
                                {/* Fill */}
                                <div
                                    className="absolute h-1 rounded-full transition-none"
                                    style={{ width: `${pct}%`, background: color, opacity: 0.7 }}
                                />
                                <input
                                    type="range"
                                    min={min} max={max} step={step}
                                    value={value}
                                    onChange={(e) => audioState.setFx({ ...audioState.fx, [key]: parseFloat(e.target.value) })}
                                    className="absolute w-full opacity-0 cursor-pointer h-3"
                                    style={{ accentColor: color }}
                                />
                                {/* Custom Thumb */}
                                <div
                                    className="absolute w-3 h-3 rounded-full border-2 pointer-events-none shadow-lg"
                                    style={{ left: `calc(${pct}% - 6px)`, background: color, borderColor: 'rgba(0,0,0,0.5)', boxShadow: `0 0 6px ${color}` }}
                                />
                            </div>
                            <span className="text-[8px] font-mono text-white/30 w-10 text-right shrink-0">
                                {key === 'compression' ? `${value}dB` : key === 'width' ? `${value.toFixed(1)}x` : `${Math.round(pct)}%`}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Transport Controls + Pitch */}
            <div className="flex items-center gap-2 md:gap-4 mt-1 md:mt-2">
                <button
                    onClick={() => seek(0)}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 bg-white/5 hover:bg-white/10 shrink-0"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="19,20 9,12 19,4" /><rect x="5" y="4" width="2" height="16" /></svg>
                </button>

                <button
                    onClick={togglePlayback}
                    disabled={!file}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shrink-0"
                    style={{
                        background: isPlaying ? `rgba(${colorClass === "emerald" ? "16,185,129" : "6,182,212"},0.2)` : "rgba(255,255,255,0.1)",
                        border: isPlaying ? `1px solid ${colorHex}` : "1px solid transparent",
                        boxShadow: isPlaying ? `0 0 20px rgba(${colorClass === "emerald" ? "16,185,129" : "6,182,212"},0.2)` : "none"
                    }}
                >
                    {isPlaying
                        ? <svg width="24" height="24" viewBox="0 0 24 24" fill={colorHex} className="w-5 h-5 md:w-6 md:h-6"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                        : <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="w-5 h-5 md:w-6 md:h-6" style={{ marginLeft: 3 }}><polygon points="5,3 19,12 5,21" /></svg>
                    }
                </button>

                <div className="flex flex-col items-center gap-1 ml-auto">
                    <div className="text-[10px] font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-white/10" style={{ color: colorHex }}>
                        {file ? `${(baseBpm * pitch).toFixed(1)} BPM` : "--- BPM"}
                    </div>
                    <span className="text-white/40 text-[9px] font-mono mt-1">PITCH {(pitch * 100).toFixed(1)}%</span>
                    <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 4 }}>
                        <input
                            type="range"
                            value={pitch}
                            onChange={(e) => setPitch(parseFloat(e.target.value))}
                            min={0.8}
                            max={1.2}
                            step={0.001}
                            className="cursor-pointer"
                            style={{
                                width: 80,
                                height: 4,
                                transform: "rotate(-90deg)",
                                accentColor: colorHex,
                            }}
                        />
                    </div>
                    <button
                        onClick={() => setPitch(1)}
                        className="text-[8px] bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded mt-1 text-white/40 hover:text-white border border-white/5"
                    >
                        RESET
                    </button>
                </div>
            </div>
        </div>
    );
}

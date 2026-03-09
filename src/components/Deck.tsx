"use client";

import { useState, useRef } from "react";

export function Deck({
    deckName,
    colorClass = "emerald",
    audioState
}: {
    deckName: string;
    colorClass?: string;
    audioState: any;
}) {
    const [isDragging, setIsDragging] = useState(false);

    const {
        file, isPlaying, currentTime, duration,
        togglePlayback, seek, loadFile, setPitch, pitch
    } = audioState;

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

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
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

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const colorHex = colorClass === "emerald" ? "#10b981" : "#06b6d4";

    return (
        <div
            className={`flex-1 rounded-xl p-6 flex flex-col gap-4 border transition-colors ${isDragging ? `border-${colorClass}-500 bg-white/10` : "border-white/5 bg-white/5"
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border"
                        style={{
                            background: `rgba(${colorClass === "emerald" ? "16,185,129" : "6,182,212"},0.15)`,
                            borderColor: colorHex,
                            color: colorHex
                        }}>
                        {deckName}
                    </div>
                    <div>
                        <div className="text-white font-medium text-sm truncate w-40">
                            {file ? file.name : "Drop Audio File Here"}
                        </div>
                        <div className="flex gap-2 text-white/40 text-xs font-mono mt-1">
                            <span>{formatTime(currentTime)}</span>
                            <span>/</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Waveform / Progress Scrub */}
            <div
                className="h-24 rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer"
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
                            className="absolute left-0 top-0 bottom-0 opacity-20 pointer-events-none"
                            style={{ width: `${progress}%`, background: colorHex }}
                        />
                        {/* Progress line */}
                        <div
                            className="absolute top-0 bottom-0 w-0.5 shadow-[0_0_10px_rgba(255,255,255,0.5)] pointer-events-none"
                            style={{ left: `${progress}%`, background: colorHex }}
                        />
                        {/* Generic waveform bars for aesthetic */}
                        <div className="flex items-center gap-[2px] w-full px-2 opacity-50 pointer-events-none">
                            {Array.from({ length: 40 }).map((_, i) => (
                                <div key={i} className="flex-1 bg-white/40 rounded-full" style={{ height: `${20 + Math.random() * 60}%` }} />
                            ))}
                        </div>
                    </>
                ) : (
                    <span className="text-white/20 text-xs font-medium">NO TRACK LOADED</span>
                )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-2">
                <button
                    onClick={() => seek(0)}
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 bg-white/5 hover:bg-white/10"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="19,20 9,12 19,4" /><rect x="5" y="4" width="2" height="16" /></svg>
                </button>

                <button
                    onClick={togglePlayback}
                    disabled={!file}
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    style={{
                        background: isPlaying ? `rgba(${colorClass === "emerald" ? "16,185,129" : "6,182,212"},0.2)` : "rgba(255,255,255,0.1)",
                        border: isPlaying ? `1px solid ${colorHex}` : "1px solid transparent",
                        boxShadow: isPlaying ? `0 0 20px rgba(${colorClass === "emerald" ? "16,185,129" : "6,182,212"},0.2)` : "none"
                    }}>
                    {isPlaying
                        ? <svg width="24" height="24" viewBox="0 0 24 24" fill={colorHex}><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                        : <svg width="24" height="24" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 3 }}><polygon points="5,3 19,12 5,21" /></svg>
                    }
                </button>

                <div className="flex flex-col items-center gap-2 ml-auto">
                    <span className="text-white/40 text-[10px] font-mono">PITCH {(pitch * 100).toFixed(0)}%</span>
                    <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <input
                            type="range"
                            value={pitch}
                            onChange={(e) => setPitch(parseFloat(e.target.value))}
                            min={0.5}
                            max={1.5}
                            step={0.01}
                            className="cursor-pointer"
                            style={{
                                width: 60,
                                height: 4,
                                transform: "rotate(-90deg)",
                                accentColor: colorHex,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

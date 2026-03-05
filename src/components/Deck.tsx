"use client";

export function Deck({ deckName, isPlaying, trackName, colorClass = "emerald" }: {
    deckName: string;
    isPlaying?: boolean;
    trackName?: string;
    colorClass?: string;
}) {
    return (
        <div className="flex-1 rounded-xl p-6 flex flex-col gap-4" style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.05)",
        }}>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)", color: "#10b981" }}>
                        {deckName}
                    </div>
                    <div>
                        <div className="text-white font-medium text-sm truncate w-40">{trackName || "No Track Loaded"}</div>
                        <div className="text-white/40 text-xs">128.00 BPM</div>
                    </div>
                </div>
                <button className="text-xs px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)" }}>
                    SYNC
                </button>
            </div>

            {/* Waveform placeholder */}
            <div className="h-24 rounded-lg flex items-center justify-center" style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
            }}>
                {trackName ? (
                    <div className="w-full h-0.5 mx-4" style={{ background: "rgba(16,185,129,0.4)" }} />
                ) : (
                    <span className="text-white/20 text-xs font-medium">DROP TRACK HERE</span>
                )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
                <button className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105"
                    style={{ background: "rgba(255,255,255,0.08)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="19,20 9,12 19,4" /><rect x="5" y="4" width="2" height="16" /></svg>
                </button>
                <button className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105"
                    style={{
                        background: isPlaying ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.1)",
                        border: isPlaying ? "1px solid rgba(16,185,129,0.5)" : "1px solid transparent",
                    }}>
                    {isPlaying
                        ? <svg width="20" height="20" viewBox="0 0 24 24" fill="#10b981"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                        : <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 3 }}><polygon points="5,3 19,12 5,21" /></svg>
                    }
                </button>
                <div className="flex flex-col items-center gap-1 ml-auto">
                    <span className="text-white/40 text-[10px] font-mono">PITCH</span>
                    <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <input
                            type="range"
                            defaultValue={50}
                            min={0}
                            max={100}
                            className="cursor-pointer"
                            style={{
                                width: 56,
                                height: 6,
                                transform: "rotate(-90deg)",
                                accentColor: "#10b981",
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

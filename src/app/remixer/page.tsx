import { Deck } from "@/components/Deck";
import { SlidersHorizontal, Settings2 } from "lucide-react";

export default function RemixerPage() {
    return (
        <div className="flex flex-col h-screen bg-black text-white p-4 gap-4 overflow-hidden">
            {/* Top Navigation / Status */}
            <header className="flex items-center justify-between h-14 bg-white/5 rounded-xl px-6 border border-white/5 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="font-black text-xl tracking-tighter">
                        WAVE<span className="text-emerald-500">CRAFT</span>
                    </div>
                    <div className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase">
                        Remixer Pro
                    </div>
                </div>
                <div className="flex items-center gap-4 text-white/50 text-sm font-medium">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> REC</span>
                    <span>MASTER: 0.0 dB</span>
                    <span>CPU: 12%</span>
                    <button className="hover:text-white transition-colors p-2"><Settings2 className="w-5 h-5" /></button>
                </div>
            </header>

            {/* Main DJ Interface */}
            <div className="flex flex-1 gap-4 min-h-0">
                {/* Left Deck (Deck A) */}
                <Deck deckName="A" colorClass="emerald" />

                {/* Central Mixer */}
                <div className="w-80 flex flex-col gap-4 shrink-0">
                    <div className="flex-1 bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center">
                        <h3 className="text-white/40 text-xs font-bold tracking-widest mb-6 flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4" /> MIXER
                        </h3>

                        {/* EQ Section */}
                        <div className="flex justify-center gap-8 flex-1 w-full">
                            {/* Channel A EQ */}
                            <div className="flex flex-col items-center gap-6">
                                <div className="text-emerald-500 text-xs font-bold">CH A</div>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-white/30 text-[10px]">HIGH</span>
                                    <div className="w-10 h-10 rounded-full border-2 border-white/10 relative cursor-pointer" />
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-white/30 text-[10px]">MID</span>
                                    <div className="w-10 h-10 rounded-full border-2 border-white/10 relative cursor-pointer" />
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-white/30 text-[10px]">LOW</span>
                                    <div className="w-10 h-10 rounded-full border-2 border-white/10 relative cursor-pointer" />
                                </div>
                            </div>

                            {/* Master / Meters */}
                            <div className="flex flex-col items-center justify-between py-8">
                                <div className="w-12 h-40 bg-black/50 border border-white/10 rounded overflow-hidden flex justify-center gap-1 p-1">
                                    <div className="w-2 bg-gradient-to-t from-emerald-500 via-yellow-500 to-red-500 opacity-20" />
                                    <div className="w-2 bg-gradient-to-t from-emerald-500 via-yellow-500 to-red-500 opacity-20" />
                                </div>
                            </div>

                            {/* Channel B EQ */}
                            <div className="flex flex-col items-center gap-6">
                                <div className="text-cyan-500 text-xs font-bold">CH B</div>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-white/30 text-[10px]">HIGH</span>
                                    <div className="w-10 h-10 rounded-full border-2 border-white/10 relative cursor-pointer" />
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-white/30 text-[10px]">MID</span>
                                    <div className="w-10 h-10 rounded-full border-2 border-white/10 relative cursor-pointer" />
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-white/30 text-[10px]">LOW</span>
                                    <div className="w-10 h-10 rounded-full border-2 border-white/10 relative cursor-pointer" />
                                </div>
                            </div>
                        </div>

                        {/* Crossfader */}
                        <div className="w-full mt-6 flex flex-col items-center gap-2">
                            <div className="w-full h-12 bg-black/50 border border-white/10 rounded px-2 flex items-center relative">
                                <div className="w-full h-1 bg-white/5 rounded-full absolute left-0 top-1/2 -translate-y-1/2" />
                                <div className="w-10 h-8 bg-zinc-300 rounded shadow-lg absolute left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing border-b-4 border-zinc-400 flex items-center justify-center">
                                    <div className="w-0.5 h-4 bg-zinc-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Deck (Deck B) */}
                <Deck deckName="B" colorClass="cyan" />
            </div>

            {/* Track Library */}
            <div className="h-64 bg-white/5 border border-white/5 rounded-xl shrink-0 flex flex-col overflow-hidden">
                <div className="h-10 border-b border-white/5 bg-white/5 flex items-center px-4 text-xs font-semibold text-white/50 tracking-wider">
                    <div className="w-8">#</div>
                    <div className="flex-1">TITLE & ARTIST</div>
                    <div className="w-24">BPM</div>
                    <div className="w-24">KEY</div>
                    <div className="w-16 text-right">TIME</div>
                </div>
                <div className="flex-1 p-8 flex items-center justify-center text-white/20 text-sm">
                    Drag and drop audio files here to build your library
                </div>
            </div>
        </div>
    );
}

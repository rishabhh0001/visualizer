import Link from "next/link";
import { Disc3, Radio, AudioWaveform } from "lucide-react";

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 w-full z-50 pointer-events-none">
            <div className="max-w-7xl mx-auto flex items-center justify-between p-6">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-white font-bold text-xl tracking-tighter pointer-events-auto hover:text-emerald-400 transition-colors"
                >
                    <AudioWaveform className="w-6 h-6 text-emerald-500" />
                    <span>WAVECRAFT<span className="text-emerald-500">.</span></span>
                </Link>

                <div className="flex items-center gap-6 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/5 pointer-events-auto">
                    <Link
                        href="/visualizer"
                        className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
                    >
                        <Radio className="w-4 h-4" />
                        Visualizer
                    </Link>
                    <div className="w-px h-4 bg-white/10" />
                    <Link
                        href="/remixer"
                        className="flex items-center gap-2 text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
                    >
                        <Disc3 className="w-4 h-4" />
                        Remixer Pro
                    </Link>
                </div>
            </div>
        </nav>
    );
}

"use client";

import Link from "next/link";
import { AudioWaveform, Disc3, Radio } from "lucide-react";
import { Scene3D } from "@/components/Scene3D";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="relative w-full min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 pt-32 pb-20 text-center">
      {/* 3D Scene Background */}
      <Scene3D />

      {/* Animated grid background */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(29,185,84,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(29,185,84,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }} />

      {/* Top overlay fade */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none opacity-80" />

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-5"
      >
        <div className="flex items-center gap-2 text-white font-black text-lg tracking-tighter">
          <Link href="/" className="flex items-center gap-2 group">
            <AudioWaveform className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
            WAVE<span className="text-emerald-500">CRAFT</span>
          </Link>
          <span className="text-zinc-600 mx-1">·</span>
          <a href="https://rishabhj.in" target="_blank" rel="noopener"
            className="text-emerald-500 text-xs font-semibold hover:text-emerald-400 transition-colors" style={{ opacity: 0.85 }}>
            by Rishabh
          </a>
        </div>
        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 hover:bg-black/60 transition-colors">
          <Link href="/visualizer" className="flex items-center gap-1.5 text-xs font-medium text-white/60 hover:text-white transition-colors px-3 py-1">
            <Radio className="w-3.5 h-3.5" /> Visualizer
          </Link>
          <div className="w-px h-3 bg-white/10" />
          <Link href="/remixer" className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors px-3 py-1">
            <Disc3 className="w-3.5 h-3.5" /> Remixer Pro
          </Link>
        </div>
      </motion.nav>

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl flex flex-col items-center">
        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-8 tracking-wide backdrop-blur-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]" />
          Studio v2.0 Platform Live
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-7xl md:text-9xl font-black mb-6 tracking-tighter leading-none"
        >
          MASTER YOUR<br />
          <span style={{
            backgroundImage: "linear-gradient(135deg, #10b981, #06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 30px rgba(16,185,129,0.3))"
          }}>
            FREQUENCIES
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-base md:text-xl text-white/60 mb-12 max-w-2xl leading-relaxed font-light backdrop-blur-sm"
        >
          Professional-grade web audio toolkit. High-fidelity real-time 3D visualizations,
          dual-deck mixing, and granular EQ control — directly in your browser.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <a href="/remixer"
            className="px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold text-sm hover:from-emerald-400 hover:to-emerald-300 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(16,185,129,0.4)]"
          >
            Launch Remixer Pro
          </a>
          <a href="/visualizer"
            className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-all backdrop-blur-md hover:border-white/20"
          >
            Open Visualizer
          </a>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-2 mt-16"
        >
          {["Dual Decks", "5-Band EQ", "Linear Crossfader", "Real-time Processing", "Spatial Audio", "Visualizations"].map(f => (
            <span key={f} className="px-3 py-1 rounded-full bg-black/40 border border-white/5 text-white/40 text-xs font-medium backdrop-blur-md">
              {f}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Features Section */}
      <section className="relative z-10 max-w-6xl w-full mt-40 grid grid-cols-1 md:grid-cols-3 gap-8 text-left px-4">
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Disc3 className="text-emerald-500 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-4">Remixer Pro</h3>
          <p className="text-white/40 text-sm leading-relaxed">
            A professional dual-deck DJ interface with real-time pitch control, 3-band EQ, and crossfading. Designed for seamless performance in the browser.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <AudioWaveform className="text-cyan-500 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-4">3D Visualizer</h3>
          <p className="text-white/40 text-sm leading-relaxed">
            High-fidelity audio visualizations including mirrored bars, radials, and particles. Responsive 60FPS rendering for an immersive experience.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Radio className="text-purple-500 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-4">Spatial Audio</h3>
          <p className="text-white/40 text-sm leading-relaxed">
            Experience sound in 3D. Our HRTF panner and surround sound simulation bring depth and width to your audio directly in the web.
          </p>
        </div>
      </section>

      {/* Stats/Social Proof */}
      <section className="relative z-10 w-full mt-40 border-y border-white/10 py-20 overflow-hidden">
        <div className="flex flex-wrap justify-center gap-20 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
          <div className="text-center">
            <div className="text-4xl font-black mb-2">0ms</div>
            <div className="text-[10px] font-bold tracking-widest uppercase">Latency</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black mb-2">32-bit</div>
            <div className="text-[10px] font-bold tracking-widest uppercase">Processing</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black mb-2">60fps</div>
            <div className="text-[10px] font-bold tracking-widest uppercase">Rendering</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mt-40 pt-20 pb-10 border-t border-white/10 flex flex-col items-center">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 w-full text-left mb-20 px-4">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 text-white font-black text-xl tracking-tighter mb-6">
              <AudioWaveform className="w-6 h-6 text-emerald-500" />
              WAVE<span className="text-emerald-500">CRAFT</span>
            </div>
            <p className="text-white/40 text-sm max-w-xs leading-relaxed">
              Pushing the boundaries of what is possible with Web Audio and real-time visualizations. High-performance audio engineering meets creative coding.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase mb-6 text-white/40">Platform</h4>
            <ul className="flex flex-col gap-4 text-sm text-white/60">
              <li><Link href="/remixer" className="hover:text-emerald-400 transition-colors">Remixer Pro</Link></li>
              <li><Link href="/visualizer" className="hover:text-emerald-400 transition-colors">Visualizer</Link></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a></li>
              <li><a href="https://github.com/rishabhh0001/visualizer" className="hover:text-emerald-400 transition-colors">GitHub</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase mb-6 text-white/40">Legal</h4>
            <ul className="flex flex-col gap-4 text-sm text-white/60">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-white/20 font-medium px-4">
          <p>© 2026 Wavecraft Digital. Engineered for performance.</p>
          <div className="flex items-center gap-6">
            <a href="https://linkedin.com/in/rishabhh0001" className="hover:text-white transition-colors">LINKEDIN</a>
            <a href="https://instagram.com/rishabhh0001" className="hover:text-white transition-colors">INSTAGRAM</a>
            <a href="https://github.com/rishabhh0001" className="hover:text-white transition-colors">GITHUB</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

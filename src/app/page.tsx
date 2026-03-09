"use client";

import { AudioWaveform, Disc3, Radio } from "lucide-react";

export default function Home() {
  return (
    <main className="relative w-full min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 pt-32 pb-20 text-center">
      {/* Animated grid background */}
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: `
          linear-gradient(rgba(29,185,84,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(29,185,84,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }} />

      {/* Radial glow */}
      <div className="absolute inset-0 z-0" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(29,185,84,0.08) 0%, transparent 70%)",
      }} />

      {/* Top overlay fade */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2 text-white font-black text-lg tracking-tighter">
          <AudioWaveform className="w-5 h-5 text-emerald-500" />
          WAVE<span className="text-emerald-500">CRAFT</span>
          <span className="text-zinc-600 mx-1">·</span>
          <a href="https://rishabhj.in" target="_blank" rel="noopener"
            className="text-emerald-500 text-xs font-semibold hover:text-emerald-400 transition-colors" style={{ opacity: 0.85 }}>
            by Rishabh
          </a>
        </div>
        <div className="flex items-center gap-1 bg-white/5 backdrop-blur border border-white/5 rounded-full px-4 py-2">
          <a href="/visualizer" className="flex items-center gap-1.5 text-xs font-medium text-white/60 hover:text-white transition-colors px-3 py-1">
            <Radio className="w-3.5 h-3.5" /> Visualizer
          </a>
          <div className="w-px h-3 bg-white/10" />
          <a href="/remixer" className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors px-3 py-1">
            <Disc3 className="w-3.5 h-3.5" /> Remixer Pro
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-4xl flex flex-col items-center">
        {/* Live badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-8 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Studio v2.0 — Platform Live
        </div>

        <h1 className="text-7xl md:text-9xl font-black mb-6 tracking-tighter leading-none">
          MASTER YOUR<br />
          <span style={{
            backgroundImage: "linear-gradient(135deg, #10b981, #06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            FREQUENCIES
          </span>
        </h1>

        <p className="text-base md:text-lg text-white/40 mb-10 max-w-xl leading-relaxed font-light">
          Professional-grade web audio toolkit. Real-time visualizations,
          dual-deck mixing, and granular EQ control — directly in your browser.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <a href="/remixer"
            className="px-8 py-3.5 rounded-full bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95"
            style={{ boxShadow: "0 0 30px rgba(16,185,129,0.3)" }}>
            Launch Remixer Pro
          </a>
          <a href="/visualizer"
            className="px-8 py-3.5 rounded-full bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-all backdrop-blur-sm">
            Open Visualizer
          </a>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-12">
          {["Dual Decks", "5-Band EQ", "Crossfader", "Real-time Waveform", "FX Chain", "Presets"].map(f => (
            <span key={f} className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-white/40 text-xs font-medium">
              {f}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}

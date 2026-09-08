"use client";

import React, { useRef, useState } from "react";
import { Check, X, Shield, Cpu, Clock, Layers } from "lucide-react";

const DEFAULT_TRADITIONAL = [
  "No fixed pricing",
  "No live tracking",
  "Paper based documents",
  "Manual updates",
  "No dashboard",
  "Delays & cost overrun",
  "Limited after-sales",
  "No tech integration",
];

const DEFAULT_CONSTRUCTONS = [
  "Transparent package pricing",
  "AI-powered live tracking",
  "Digital documents",
  "Real-time updates",
  "On-time delivery guarantee",
  "Live milestone tracking",
  "10 year warranty",
  "AI + IoT + Cloud platform",
];

const DEFAULT_STATS = [
  { value: "100%", label: "Transparency Guaranteed", icon: Shield },
  { value: "0", label: "Hidden Costs", icon: Layers },
  { value: "24/7", label: "Live Dashboard Access", icon: Cpu },
  { value: "10 Yrs", label: "Structural Warranty", icon: Clock },
];

export default function WhyConstructONS({
  traditionalPoints = DEFAULT_TRADITIONAL,
  constructonsPoints = DEFAULT_CONSTRUCTONS,
  stats = DEFAULT_STATS,
}) {
  return (
    <section
      id="why"
      data-testid="why-section"
      className="relative scroll-mt-20 bg-[#F8F9FA] font-sans selection:bg-[#FF5A00] selection:text-white"
    >
      {/* 1) HERO SPOTLIGHT REVEAL */}
      <MaskRevealHero />

      {/* 2) SIDE-BY-SIDE VS COMPARISON */}
      <div className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ComparisonGrid
          traditional={traditionalPoints}
          constructons={constructonsPoints}
        />
      </div>

      {/* 3) STATS BANNER */}
      {stats.length > 0 && <StatsBanner stats={stats} />}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                            1) SPOTLIGHT HERO                               */
/* -------------------------------------------------------------------------- */
function MaskRevealHero() {
  const containerRef = useRef(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-[24rem] sm:h-[28rem] md:h-[32rem] bg-[#000F1B] overflow-hidden cursor-none flex items-center justify-center select-none"
    >
      {/* Dimmed Base Layer */}
      <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
        <p className="text-xl sm:text-3xl md:text-5xl font-bold text-white/30 leading-snug max-w-4xl">
          Building better with <span className="text-white/60">technology</span>, transparency, and <span className="text-white/60">AI-powered tracking</span> — from blueprint to handover.
        </p>
      </div>

      {/* Spotlight Reveal Layer */}
      <div
        className="absolute inset-0 bg-[#FF5A00] flex items-center justify-center px-6 text-center pointer-events-none transition-opacity duration-300"
        style={{
          WebkitMaskImage: `radial-gradient(circle ${isHovered ? 260 : 60}px at ${pos.x}% ${pos.y}%, black 100%, transparent 100%)`,
          maskImage: `radial-gradient(circle ${isHovered ? 260 : 60}px at ${pos.x}% ${pos.y}%, black 100%, transparent 100%)`,
        }}
      >
        <p className="text-xl sm:text-3xl md:text-5xl font-extrabold text-white leading-snug max-w-4xl">
          Traditional contractors leave you guessing. <br />
          <span className="text-[#000F1B]">We give you total control.</span>
        </p>
      </div>

      {/* Pointer Ring */}
      <div
        className="pointer-events-none absolute w-8 h-8 rounded-full border-2 border-white/80 -translate-x-1/2 -translate-y-1/2 z-30 transition-transform duration-75"
        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                         2) SIDE-BY-SIDE VS GRID                            */
/* -------------------------------------------------------------------------- */
function ComparisonGrid({ traditional = [], constructons = [] }) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <span className="inline-block text-[#FF5A00] font-bold text-xs uppercase tracking-widest bg-[#FF5A00]/10 px-4 py-1.5 rounded-full border border-[#FF5A00]/20">
          Side-By-Side Comparison
        </span>
        <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#000F1B] tracking-tight">
          The ConstructONS Advantage
        </h2>
        <p className="mt-3 text-base sm:text-lg text-slate-600">
          See how tech-driven execution eliminates the risks of traditional construction.
        </p>
      </div>

      {/* Grid Container */}
      <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
        
        {/* Left: Traditional Construction Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/80 shadow-sm flex flex-col justify-between transition-all duration-300 hover:border-slate-300">
          <div>
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  The Old Way
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-1">
                  Traditional Contractors
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                Opaque
              </span>
            </div>

            <ul className="space-y-4">
              {traditional.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3.5 text-slate-600 font-medium text-sm sm:text-base">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0 border border-red-100">
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-xs font-semibold text-slate-400">
            Higher risk of cost revisions & unexpected delays.
          </div>
        </div>

        {/* Center VS Badge */}
        <div className="flex items-center justify-center my-2 lg:my-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FF5A00] text-white font-black text-lg sm:text-xl flex items-center justify-center shadow-lg shadow-[#FF5A00]/30 border-4 border-white shrink-0 z-10">
            VS
          </div>
        </div>

        {/* Right: ConstructONS Card */}
        <div className="relative bg-[#000F1B] rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl flex flex-col justify-between border border-white/10 overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-[#FF5A00]/20 blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF5A00]">
                  Next-Gen Standard
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  ConstructONS
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#FF5A00]/20 text-[#FF5A00] text-xs font-bold uppercase tracking-wider border border-[#FF5A00]/30">
                Recommended
              </span>
            </div>

            <ul className="space-y-4">
              {constructons.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3.5 text-slate-200 font-semibold text-sm sm:text-base">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Guaranteed deliverables backed by technology.</span>
            <span className="text-[#FF5A00] font-bold">100% Tracked →</span>
          </div>
        </div>

      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             3) STATS BANNER                                */
/* -------------------------------------------------------------------------- */
function StatsBanner({ stats }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
      <div className="rounded-3xl bg-[#000F1B] text-white p-6 sm:p-8 md:p-10 grid grid-cols-2 md:grid-cols-4 gap-6 border border-white/10 shadow-2xl">
        {stats.map((s, idx) => {
          const IconComponent = s.icon || Shield;
          return (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <IconComponent className="w-6 h-6 text-[#FF5A00]" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {s.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
                  {s.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  PlayCircle,
  Cpu,
  ArrowUpRight,
  HardHat,
} from "lucide-react";
import LucideIcon from "@/components/site/LucideIcon";
import { FadeIn, SectionLabel } from "@/components/site/Primitives";

export default function AIPlatform({ modules = [] }) {
  return (
    <section
      id="ai-platform"
      data-testid="ai-platform-section"
      className="relative py-16 md:py-20 lg:py-24 scroll-mt-20 bg-white font-['Poppins',sans-serif] selection:bg-[#FF5A00] selection:text-white"
    >
      <div className="container-wide">
        {/* Header */}
        <div className="mb-10 md:mb-12">
          <FadeIn>
            <SectionLabel number={4} eyebrow="AI Platform (SaaS)" />
            <h2 className="mt-4 text-[#000F1B] font-bold text-3xl sm:text-4xl md:text-[40px] lg:text-[44px] leading-[1.15] tracking-tight max-w-3xl">
              AI-Powered Platform.{" "}
              <span className="text-[#FF5A00]">Everything In Control.</span>
            </h2>
            <p className="mt-4 text-[#000F1B]/60 max-w-2xl leading-relaxed text-sm md:text-[15px]">
              Every ConstructONS home comes with the AI Platform — an intelligent
              construction OS that keeps you in control with real-time insights,
              automation and recommendations.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF5A00]/10 text-[#FF5A00] text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Included with every home
            </div>
          </FadeIn>
        </div>

        {/* 3D Book Layout — 3 per row on Mobile, 5 per row on Laptop (Remaining items auto-centered) */}
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3.5 md:gap-4 lg:gap-5">
          {modules.map((m, i) => (
            <BookModuleCard key={m.id || i} module={m} index={i} />
          ))}
        </div>

        {/* Dashboard Display */}
        <FadeIn delay={0.2} className="mt-12 lg:mt-14">
          <div className="relative rounded-3xl border border-black/5 bg-gradient-to-br from-[#000F1B] to-[#0B1E30] p-1 shadow-[0_20px_60px_rgba(0,15,27,0.15)]">
            <div className="rounded-[22px] overflow-hidden bg-[#0B1E30]/50">
              <div className="px-4 py-2 flex items-center gap-2 border-b border-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <div className="ml-3 text-white/60 text-xs">
                  app.constructons.in / dashboard
                </div>
              </div>
              <div className="grid lg:grid-cols-[220px_1fr] gap-0">
                <div className="p-5 border-r border-white/10 text-white/80 hidden lg:block">
                  <div className="text-[11px] uppercase tracking-widest text-white/40 mb-3">
                    Q66 Dashboard
                  </div>
                  {["Projects", "Tasks", "Site", "Documents", "Reports", "Settings"].map(
                    (n) => (
                      <div
                        key={n}
                        className="px-3 py-2 rounded-lg hover:bg-white/5 flex items-center justify-between text-sm"
                      >
                        <span>{n}</span>
                        <span className="text-white/30 text-xs">›</span>
                      </div>
                    )
                  )}
                </div>
                <div className="p-5 grid md:grid-cols-3 gap-4">
                  <StatTile label="Overall Progress" value="72%" note="On Track">
                    <div className="h-1.5 rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "72%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.4 }}
                        className="h-full rounded-full bg-[#FF5A00]"
                      />
                    </div>
                  </StatTile>
                  <StatTile label="Project Timeline" value="18" note="Months" />
                  <StatTile label="Total Cost" value="₹2.45 Cr" note="of ₹2.40 Cr" />
                  <div className="md:col-span-3 grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-1 rounded-2xl bg-white/5 border border-white/10 p-4 text-white">
                      <div className="text-xs text-white/50">Site Camera</div>
                      <div className="mt-2 aspect-video rounded-xl bg-black/30 grid place-items-center relative overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1590595978583-3967cf17d2ea?auto=format&fit=crop&w=800&q=80"
                          alt="site"
                          className="absolute inset-0 w-full h-full object-cover opacity-80"
                        />
                        <PlayCircle className="relative w-10 h-10 text-white/90 drop-shadow" />
                      </div>
                      <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live View
                      </div>
                    </div>
                    <div className="md:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-white/50">AI Insight</div>
                        <div className="inline-flex items-center gap-1 text-[11px] text-[#FF8A4C]">
                          <Cpu className="w-3 h-3" /> real-time
                        </div>
                      </div>
                      <div className="mt-2 text-sm leading-relaxed text-white/85">
                        Roof casting is expected in{" "}
                        <b className="text-white">5 days</b>. Materials on-site
                        are sufficient. Structural progress is{" "}
                        <b className="text-white">6% ahead</b> of the baseline
                        plan.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* -------------------------------------------------------
   3D BOOK FLIP MODULE CARD
------------------------------------------------------- */
function BookModuleCard({ module, index }) {
  const fallbackImage =
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80";

  const formattedIndex = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      data-testid={`ai-module-${module.slug}`}
      className="
        relative group cursor-pointer
        w-[calc(33.333%-0.5rem)] sm:w-[calc(33.333%-0.75rem)] lg:w-[calc(20%-0.8rem)] lg:max-w-[14.5rem]
        h-48 sm:h-64 md:h-72 lg:h-80
        [perspective:1200px]
      "
    >
      {/* 3D BOOK CONTAINER */}
      <div className="relative w-full h-full rounded-xl sm:rounded-2xl bg-[#000F1B] border border-white/10 shadow-xl [transform-style:preserve-3d] transition-shadow duration-500 group-hover:shadow-[0_15px_35px_rgba(255,90,0,0.25)]">
        
        {/* ================= INSIDE PAGE (REVEALED ON HOVER) ================= */}
        <div className="absolute inset-0 z-0 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0B1E30] to-[#000F1B] flex flex-col justify-between overflow-hidden">
          {/* Blueprint grid accent line pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#FF5A00_1px,transparent_1px)] [background-size:12px_12px] opacity-10 pointer-events-none" />

          <div>
            <span className="text-[#FF5A00] font-mono text-[9px] sm:text-[11px] font-bold uppercase tracking-wider block">
              AI Module #{formattedIndex}
            </span>
            <h3 className="text-white font-bold text-xs sm:text-base md:text-lg leading-tight mt-1">
              {module.name}
            </h3>
            <p className="text-white/65 text-[9px] sm:text-xs leading-relaxed line-clamp-3 sm:line-clamp-4 mt-1.5 sm:mt-2">
              {module.tagline || module.description}
            </p>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] sm:text-xs font-medium text-[#FF5A00]">
            <span>Active Module</span>
            <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
        </div>

        {/* ================= FRONT COVER (FLIPS OPEN) ================= */}
        <div
          className="
            absolute inset-0 z-10 rounded-xl sm:rounded-2xl bg-[#0B1E30]
            border border-white/15 overflow-hidden
            origin-left transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
            group-hover:[transform:rotateY(-105deg)]
            shadow-[2px_0_10px_rgba(0,0,0,0.5)]
            flex flex-col justify-between p-2.5 sm:p-3.5
            [backface-visibility:hidden]
          "
        >
          {/* Cover Visual */}
          <div className="absolute inset-0 bg-[#000F1B]">
            <img
              src={module.image || fallbackImage}
              alt="Cover visual"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = fallbackImage;
              }}
              className="h-full w-full object-cover brightness-[0.65] group-hover:brightness-90 transition-all duration-500"
            />
            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#000F1B]/80 via-transparent to-[#000F1B]/90" />
          </div>

          {/* Top Header: Badge & Icon */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white/90 text-[8px] sm:text-[10px] font-mono tracking-widest">
              #{formattedIndex}
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full grid place-items-center bg-black/60 backdrop-blur-md border border-white/15 text-[#FF5A00]">
              <LucideIcon name={module.icon || "Sparkles"} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>

          {/* Architectural CAD Blueprint Radar / Construction Reticle */}
          <div className="relative z-10 self-center my-auto flex flex-col items-center justify-center">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 grid place-items-center">
              {/* Spinning CAD Blueprint Ring */}
              <div className="absolute inset-0 rounded-full border border-dashed border-[#FF5A00]/60 animate-[spin_10s_linear_infinite]" />
              
              {/* Outer Pulsing Crosshair Ring */}
              <div className="absolute inset-1 rounded-full border border-[#FF5A00]/30 animate-ping opacity-40" />

              {/* Central Construction Icon Badge */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/70 backdrop-blur-md border border-[#FF5A00]/60 grid place-items-center text-[#FF5A00] shadow-[0_0_15px_rgba(255,90,0,0.4)]">
                <HardHat className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>

          {/* Spine Accent Line */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-r from-black/70 to-transparent pointer-events-none" />

          {/* Bottom Callout displaying Module Title */}
          <div className="relative z-10 flex items-center justify-between text-white/90 text-[9px] sm:text-[11px] font-semibold tracking-wide">
            <span className="truncate pr-1 uppercase">{module.name}</span>
            <span className="text-[#FF5A00] font-bold shrink-0">›</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

function StatTile({ label, value, note, children }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-white">
      <div className="text-xs text-white/50">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      <div className="mt-1 text-[11px] text-white/60">{note}</div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
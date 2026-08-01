import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Activity, Sparkles, Timer, Award, PlayCircle } from "lucide-react";
import { useLeadModal } from "@/components/site/LeadModalProvider";

export default function Hero({ hero }) {
  const { open: openLead } = useLeadModal();
  if (!hero) return null;

  return (
    <section id="top" data-testid="hero-section" className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={hero.background_image}
          alt="Luxury villa"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/90 via-brand-navy/70 to-brand-navy/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/70 via-brand-navy/40 to-transparent" />
      </div>

      <div className="relative container-wide pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-white"
          >
            {hero.eyebrow && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold tracking-widest uppercase mb-6">
                <Sparkles className="w-3.5 h-3.5 text-brand-orangeLight" />
                {hero.eyebrow}
              </div>
            )}
            <h1 className="font-bold leading-[1.02] tracking-tight text-white text-4xl md:text-6xl xl:text-7xl">
              {hero.headline}{" "}
              <span className="text-gradient-orange">{hero.headline_highlight}</span>
            </h1>
            <p className="mt-6 text-white/80 text-base md:text-lg max-w-xl leading-relaxed">
              {hero.subheading}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={hero.primary_cta_link || "#home-collection"}
                data-testid="hero-primary-cta"
                className="btn-primary group"
                onClick={(e) => {
                  if ((hero.primary_cta_link || "").startsWith("#")) {
                    e.preventDefault();
                    document.getElementById(hero.primary_cta_link.slice(1))?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                {hero.primary_cta_label}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              </a>
              <button
                onClick={() => openLead({ source: "hero" })}
                data-testid="hero-secondary-cta"
                className="btn-ghost bg-white/10 text-white border-white/20 hover:bg-white/15"
              >
                <PlayCircle className="w-4 h-4" />
                {hero.secondary_cta_label}
              </button>
            </div>

            {hero.stats?.length > 0 && (
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
                {hero.stats.map((s, i) => (
                  <div key={i} className="px-3 py-2.5 rounded-2xl bg-white/8 border border-white/10 backdrop-blur-md">
                    <div className="text-white text-lg font-bold leading-none">{s.value}</div>
                    <div className="text-white/60 text-[11px] mt-1 uppercase tracking-widest">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Floating AI cards */}
          <div className="relative h-[480px] hidden lg:block">
            <FloatingCard
              className="absolute top-4 left-4 w-[260px] animate-float-slow"
              delay={0.2}
              testId="floating-ai-assistant"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-brand-orange/15 grid place-items-center">
                  <Sparkles className="w-4 h-4 text-brand-orange" />
                </div>
                <div>
                  <div className="text-brand-navy font-semibold text-sm">AI Project Assistant</div>
                  <div className="text-[10px] text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                  </div>
                </div>
              </div>
              <div className="text-[12px] text-brand-navy/60 bg-brand-bg rounded-xl px-3 py-2">
                Ask me anything about your project…
              </div>
            </FloatingCard>

            <FloatingCard
              className="absolute top-24 right-2 w-[210px] animate-float-slow"
              delay={0.5}
              testId="floating-progress"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs text-brand-navy/60">Live Progress</div>
                <div className="text-xs font-bold text-brand-orange">72%</div>
              </div>
              <div className="h-2 rounded-full bg-brand-navy/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "72%" }}
                  transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-brand-orange to-brand-orangeLight"
                />
              </div>
              <div className="mt-2 text-[11px] text-brand-navy/60">Structure Completed</div>
            </FloatingCard>

            <FloatingCard
              className="absolute bottom-4 left-8 w-[300px] animate-float-slow"
              delay={0.75}
              testId="floating-timeline"
            >
              <div className="text-xs text-brand-navy/60 mb-2">Project Timeline</div>
              <div className="flex items-center justify-between">
                {["Design", "Planning", "Structure", "Finishing", "Handover"].map((s, i) => (
                  <div key={s} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-6 h-6 rounded-full grid place-items-center text-[10px] font-bold border ${
                        i <= 2
                          ? "bg-brand-orange text-white border-brand-orange"
                          : "bg-white text-brand-navy/60 border-brand-navy/15"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="text-[9px] mt-1 text-brand-navy/60">{s}</div>
                  </div>
                ))}
              </div>
            </FloatingCard>

            <FloatingCard
              className="absolute bottom-32 right-6 w-[190px] animate-float-slow"
              delay={0.9}
              testId="floating-quality"
            >
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-brand-orange" />
                <div className="text-xs text-brand-navy/60">Quality Score</div>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <div className="text-2xl font-extrabold text-brand-navy">98</div>
                <div className="text-xs text-emerald-600">/100</div>
              </div>
              <div className="text-[10px] text-brand-navy/50">150+ checkpoints</div>
            </FloatingCard>
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingCard({ children, className = "", delay = 0, testId }) {
  return (
    <motion.div
      data-testid={testId}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-2xl bg-white shadow-premium p-3 border border-white ${className}`}
    >
      {children}
    </motion.div>
  );
}

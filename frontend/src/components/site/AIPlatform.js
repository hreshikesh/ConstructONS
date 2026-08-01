import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, PlayCircle, Cpu } from "lucide-react";
import LucideIcon from "@/components/site/LucideIcon";
import { FadeIn, SectionLabel } from "@/components/site/Primitives";

export default function AIPlatform({ modules = [] }) {
  return (
    <section id="ai-platform" data-testid="ai-platform-section" className="py-24 md:py-32 bg-white">
      <div className="container-wide">
        <div className="grid lg:grid-cols-[minmax(280px,360px)_1fr] gap-12 items-start">
          <FadeIn>
            <SectionLabel number={4} eyebrow="AI Platform (SaaS)" />
            <h2 className="mt-4 text-brand-navy font-bold">
              AI-Powered Platform<br /> That Manages Everything
            </h2>
            <p className="mt-4 text-brand-navy/60 max-w-md leading-relaxed">
              Every ConstructONS home comes with the AI Platform — an intelligent construction OS that keeps you
              in control with real-time insights, automation and recommendations.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Included with every home
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {modules.map((m, i) => (
              <ModuleCard key={m.id} module={m} index={i} />
            ))}
          </div>
        </div>

        {/* Dashboard preview */}
        <FadeIn delay={0.2} className="mt-14">
          <div className="rounded-3xl border border-black/5 bg-gradient-to-br from-brand-navy to-brand-navySoft p-1 shadow-premium">
            <div className="rounded-[22px] overflow-hidden bg-brand-navySoft/50">
              <div className="px-4 py-2 flex items-center gap-2 border-b border-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <div className="ml-3 text-white/60 text-xs">app.constructons.in / dashboard</div>
              </div>
              <div className="grid lg:grid-cols-[220px_1fr] gap-0">
                <div className="p-5 border-r border-white/10 text-white/80 hidden lg:block">
                  <div className="text-[11px] uppercase tracking-widest text-white/40 mb-3">Q66 Dashboard</div>
                  {["Projects", "Tasks", "Site", "Documents", "Reports", "Settings"].map((n) => (
                    <div key={n} className="px-3 py-2 rounded-lg hover:bg-white/5 flex items-center justify-between text-sm">
                      <span>{n}</span>
                      <span className="text-white/30 text-xs">›</span>
                    </div>
                  ))}
                </div>
                <div className="p-5 grid md:grid-cols-3 gap-4">
                  <StatTile label="Overall Progress" value="72%" note="On Track">
                    <div className="h-1.5 rounded-full bg-white/10">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: "72%" }} viewport={{ once: true }} transition={{ duration: 1.4 }} className="h-full rounded-full bg-brand-orange" />
                    </div>
                  </StatTile>
                  <StatTile label="Project Timeline" value="18" note="Months" />
                  <StatTile label="Total Cost" value="₹2.45 Cr" note="of ₹2.40 Cr" />
                  <div className="md:col-span-3 grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-1 rounded-2xl bg-white/5 border border-white/10 p-4 text-white">
                      <div className="text-xs text-white/50">Site Camera</div>
                      <div className="mt-2 aspect-video rounded-xl bg-black/30 grid place-items-center relative overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1590595978583-3967cf17d2ea?auto=format&fit=crop&w=800&q=80" alt="site" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                        <PlayCircle className="relative w-10 h-10 text-white/90 drop-shadow" />
                      </div>
                      <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live View
                      </div>
                    </div>
                    <div className="md:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-white/50">AI Insight</div>
                        <div className="inline-flex items-center gap-1 text-[11px] text-brand-orangeLight"><Cpu className="w-3 h-3" /> real-time</div>
                      </div>
                      <div className="mt-2 text-sm leading-relaxed text-white/85">
                        Roof casting is expected in <b className="text-white">5 days</b>. Materials on-site are sufficient.
                        Structural progress is <b className="text-white">6% ahead</b> of the baseline plan.
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

function ModuleCard({ module, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group rounded-2xl border border-black/5 bg-white p-4 hover:shadow-premium hover:-translate-y-0.5 transition-all"
      data-testid={`ai-module-${module.slug}`}
    >
      <div className="w-10 h-10 rounded-xl grid place-items-center bg-brand-orange/10 text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition">
        <LucideIcon name={module.icon || "Sparkles"} className="w-5 h-5" />
      </div>
      <div className="mt-3 font-semibold text-brand-navy text-sm">{module.name}</div>
      <div className="mt-1 text-[11px] text-brand-navy/60 leading-relaxed">{module.tagline}</div>
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

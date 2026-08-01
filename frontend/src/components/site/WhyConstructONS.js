import React from "react";
import { motion } from "framer-motion";
import { Check, X, ArrowRight, Home as HomeIcon, Award, Clock, Users } from "lucide-react";
import LucideIcon from "@/components/site/LucideIcon";
import { FadeIn, SectionLabel } from "@/components/site/Primitives";

export default function WhyConstructONS({ rows = [], stats = [] }) {
  return (
    <section id="why" data-testid="why-section" className="py-24 md:py-32 bg-brand-bg">
      <div className="container-wide">
        <div className="grid lg:grid-cols-[minmax(280px,340px)_1fr] gap-10 items-start mb-10">
          <FadeIn>
            <SectionLabel number={7} eyebrow="Why ConstructONS" />
            <h2 className="mt-4 text-brand-navy font-bold">
              Building Better<br /> with Technology
            </h2>
            <p className="mt-4 text-brand-navy/60 max-w-md leading-relaxed">
              Traditional contractors leave you guessing. We give you full transparency, AI-powered tracking
              and enterprise-grade quality.
            </p>
          </FadeIn>

          <FadeIn>
            <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
              <ComparisonColumn
                title="Traditional Construction"
                items={rows.map((r) => ({ text: r.traditional, positive: r.traditional_positive }))}
                variant="neg"
              />
              <div className="hidden md:flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-brand-orange grid place-items-center text-white font-bold text-lg shadow-glow">
                  VS
                </div>
              </div>
              <ComparisonColumn
                title="ConstructONS"
                items={rows.map((r) => ({ text: r.constructons, positive: r.constructons_positive }))}
                variant="pos"
              />
            </div>
          </FadeIn>
        </div>

        {stats.length > 0 && (
          <FadeIn delay={0.15}>
            <div className="mt-8 rounded-3xl bg-brand-navy text-white p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/10 grid place-items-center">
                    <LucideIcon name={s.icon || "Home"} className="w-5 h-5 text-brand-orangeLight" />
                  </div>
                  <div>
                    <div className="text-2xl md:text-3xl font-bold leading-none">{s.value}</div>
                    <div className="text-white/60 text-xs mt-1">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}

function ComparisonColumn({ title, items, variant }) {
  const isPos = variant === "pos";
  return (
    <div
      className={`rounded-3xl p-5 border ${
        isPos ? "bg-white border-brand-orange/20 shadow-glow" : "bg-white border-black/5"
      }`}
    >
      <div className={`text-xs font-bold uppercase tracking-widest mb-3 ${isPos ? "text-brand-orange" : "text-brand-navy/60"}`}>{title}</div>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-brand-navy/85">
            {it.positive ? (
              <Check className="w-4 h-4 mt-0.5 text-emerald-500" />
            ) : (
              <X className="w-4 h-4 mt-0.5 text-red-400" />
            )}
            {it.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

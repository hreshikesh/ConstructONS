import React, { useState } from "react";
import { Check, ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, SectionLabel } from "@/components/site/Primitives";
import { useLeadModal } from "@/components/site/LeadModalProvider";

export default function Packages({ packages = [] }) {
  const { open: openLead } = useLeadModal();

  return (
    <section id="packages" data-testid="packages-section" className="py-24 md:py-32 bg-brand-bg">
      <div className="container-wide">
        <div className="grid lg:grid-cols-[minmax(280px,340px)_1fr] gap-10 items-end mb-10">
          <FadeIn>
            <SectionLabel number={3} eyebrow="Build Packages" />
            <h2 className="mt-4 text-brand-navy font-bold">
              Transparent Packages.<br /> Trusted Construction.
            </h2>
            <p className="mt-4 text-brand-navy/60 max-w-md leading-relaxed">
              No hidden costs. No surprises. Just quality construction with clear pricing.
            </p>
          </FadeIn>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
          {packages.map((p, i) => (
            <PackageCard key={p.id} pkg={p} index={i} onQuote={() => openLead({ package: p.name, source: "packages" })} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PackageCard({ pkg, onQuote, index }) {
  const [expanded, setExpanded] = useState(false);
  const isPopular = pkg.is_most_popular;
  const isPremium = pkg.tier === "premium";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-3xl border p-6 flex flex-col ${
        isPopular
          ? "bg-brand-navy text-white border-brand-navy shadow-premium"
          : "bg-white border-black/5 shadow-soft"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-orange text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-glow">
          Most Popular
        </div>
      )}
      <div className={`text-xs font-semibold tracking-widest uppercase ${isPopular ? "text-brand-orangeLight" : "text-brand-orange"}`}>
        {pkg.name}
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <div className={`font-bold text-4xl ${isPopular ? "text-white" : "text-brand-navy"}`}>{pkg.price_display}</div>
        {pkg.price_unit && <div className={`text-sm ${isPopular ? "text-white/60" : "text-brand-navy/50"}`}>{pkg.price_unit}</div>}
      </div>
      <div className={`mt-1 text-sm font-semibold ${isPopular ? "text-white" : "text-brand-navy"}`}>{pkg.tagline}</div>
      <div className={`mt-1 text-xs ${isPopular ? "text-white/60" : "text-brand-navy/60"}`}>{pkg.description}</div>

      <ul className="mt-5 space-y-2">
        {pkg.highlights?.map((h, i) => (
          <li key={i} className={`text-sm flex items-start gap-2 ${isPopular ? "text-white/90" : "text-brand-navy/85"}`}>
            <Check className={`w-4 h-4 mt-0.5 shrink-0 ${isPopular ? "text-brand-orangeLight" : "text-brand-orange"}`} />
            {h}
          </li>
        ))}
      </ul>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden"
          >
            <div className="mt-5 space-y-4">
              {pkg.sections?.map((sec, i) => (
                <div key={i}>
                  <div className={`text-[11px] font-bold uppercase tracking-widest ${isPopular ? "text-brand-orangeLight" : "text-brand-orange"}`}>
                    {sec.title}
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {sec.items?.map((it, j) => (
                      <li key={j} className={`text-xs flex items-start gap-1.5 ${isPopular ? "text-white/80" : "text-brand-navy/70"}`}>
                        <Sparkles className={`w-3 h-3 mt-0.5 ${isPopular ? "text-white/40" : "text-brand-navy/30"}`} />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex flex-col gap-2">
        <button
          data-testid={`package-view-details-${pkg.slug}`}
          onClick={() => setExpanded((s) => !s)}
          className={`w-full rounded-full px-5 py-2.5 text-sm font-semibold border transition inline-flex items-center justify-center gap-1.5 ${
            isPopular
              ? "border-white/25 text-white hover:bg-white/10"
              : isPremium
              ? "bg-[#7C3AED] text-white border-[#7C3AED] hover:bg-[#6D28D9]"
              : "bg-white border-black/10 text-brand-navy hover:border-brand-navy"
          }`}
        >
          {expanded ? "Hide Details" : pkg.cta_label || "View Details"}
          <ChevronDown className={`w-3.5 h-3.5 transition ${expanded ? "rotate-180" : ""}`} />
        </button>
        {isPremium && (
          <button
            onClick={onQuote}
            className="w-full rounded-full px-5 py-2.5 text-sm font-semibold bg-brand-orange text-white hover:bg-brand-orangeDark inline-flex items-center justify-center gap-1.5"
          >
            Get Custom Quote <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

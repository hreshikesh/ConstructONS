import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Sparkles, ChevronDown, Download, Scale } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, SectionLabel } from "@/components/site/Primitives";
import { useLeadModal } from "@/components/site/LeadModalProvider";
import { publicApi } from "@/lib/api";

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
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to="/packages/compare"
                data-testid="packages-compare-link"
                className="inline-flex items-center gap-2 rounded-full bg-white border border-black/10 text-brand-navy font-semibold text-sm px-4 py-2 hover:border-brand-navy transition"
              >
                <Scale className="w-4 h-4" /> Compare All Packages
              </Link>
            </div>
          </FadeIn>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
          {packages.map((p, i) => (
            <PackageCard
              key={p.id}
              pkg={p}
              index={i}
              onQuote={() => openLead({ package: p.name, source: "packages" })}
            />
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
  const brochureUrl = publicApi.brochureUrl(pkg.slug);

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
      data-testid={`package-card-${pkg.slug}`}
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
            <div className="mt-5 space-y-3">
              {(pkg.spec_categories || pkg.sections || []).slice(0, 4).map((sec, i) => (
                <div key={i}>
                  <div className={`text-[11px] font-bold uppercase tracking-widest ${isPopular ? "text-brand-orangeLight" : "text-brand-orange"}`}>
                    {sec.name || sec.title}
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {(sec.items || []).slice(0, 3).map((it, j) => (
                      <li key={j} className={`text-xs flex items-start gap-1.5 ${isPopular ? "text-white/80" : "text-brand-navy/70"}`}>
                        <Sparkles className={`w-3 h-3 mt-0.5 shrink-0 ${isPopular ? "text-white/40" : "text-brand-navy/30"}`} />
                        <span className="line-clamp-1">{typeof it === "string" ? it : `${it.spec}: ${it.value || ""}`}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className={`text-[11px] pt-1 ${isPopular ? "text-white/60" : "text-brand-navy/60"}`}>
                + {(pkg.spec_categories || []).length - 4} more categories &middot; see full details \u2192
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex flex-col gap-2">
        <Link
          to={`/packages/${pkg.slug}`}
          data-testid={`package-view-details-${pkg.slug}`}
          className={`w-full rounded-full px-5 py-2.5 text-sm font-semibold border transition inline-flex items-center justify-center gap-1.5 ${
            isPopular
              ? "bg-brand-orange text-white border-brand-orange hover:bg-brand-orangeDark"
              : isPremium
              ? "bg-[#7C3AED] text-white border-[#7C3AED] hover:bg-[#6D28D9]"
              : "bg-white border-black/10 text-brand-navy hover:border-brand-navy"
          }`}
        >
          View Full Details <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded((s) => !s)}
            className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold inline-flex items-center justify-center gap-1 ${
              isPopular ? "text-white/85 hover:bg-white/5" : "text-brand-navy/70 hover:bg-brand-navy/5"
            }`}
          >
            Quick preview
            <ChevronDown className={`w-3 h-3 transition ${expanded ? "rotate-180" : ""}`} />
          </button>
          <a
            href={brochureUrl}
            target="_blank"
            rel="noreferrer"
            data-testid={`package-brochure-${pkg.slug}`}
            className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold inline-flex items-center justify-center gap-1 ${
              isPopular ? "text-brand-orangeLight hover:bg-white/5" : "text-brand-orange hover:bg-brand-orange/10"
            }`}
          >
            <Download className="w-3 h-3" /> Brochure
          </a>
        </div>
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

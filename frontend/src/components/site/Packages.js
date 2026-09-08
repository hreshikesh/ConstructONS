import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  ArrowRight,
  ShieldCheck,
  Download,
  Scale,
  Compass,
  X,
  Maximize2,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, SectionLabel } from "@/components/site/Primitives";
import { useLeadModal } from "@/components/site/LeadModalProvider";
import { useBrochureModal } from "@/components/site/BrochureModalProvider";

export default function Packages({ packages = [] }) {
  const { open: openLead } = useLeadModal();
  const { open: openBrochure } = useBrochureModal();
  const [previewPkg, setPreviewPkg] = useState(null);

  // First 3 = normal grid cards | Rest (custom/premium) = full-width long cards
  const normalPackages = packages.slice(0, 3);
  const customPackages = packages.slice(3);

  return (
    <section
      id="packages"
      data-testid="packages-section"
      className="relative py-16 md:py-20 lg:py-24 scroll-mt-20 bg-[#F7F7F7] font-['Poppins',sans-serif] selection:bg-[#FF5A00] selection:text-white"
    >
      <div className="container-wide">
        {/* Header — single-line title, orange/black */}
        <div className="mb-10 md:mb-12">
          <FadeIn>
            <SectionLabel number={3} eyebrow="Build Packages" />
            <h2 className="mt-4 text-[#000F1B] font-bold text-3xl sm:text-4xl md:text-[40px] lg:text-[44px] leading-[1.15] tracking-tight">
              Transparent Packages.{" "}
              <span className="text-[#FF5A00]">Trusted Construction.</span>
            </h2>
            <p className="mt-4 text-[#000F1B]/60 max-w-xl leading-relaxed text-sm md:text-[15px]">
              No hidden costs. No surprises. Just quality construction with clear pricing.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link
                to="/find-my-package"
                data-testid="packages-quiz-link"
                className="inline-flex items-center gap-2 rounded-full bg-[#000F1B] text-white font-semibold text-sm px-5 py-2.5 hover:bg-[#0B1E30] transition"
              >
                <Compass className="w-4 h-4" /> Find My Perfect Package
              </Link>
              <Link
                to="/packages/compare"
                data-testid="packages-compare-link"
                className="inline-flex items-center gap-2 rounded-full bg-white border border-black/10 text-[#000F1B] font-semibold text-sm px-5 py-2.5 hover:border-[#000F1B] transition"
              >
                <Scale className="w-4 h-4" /> Compare All Packages
              </Link>
            </div>
          </FadeIn>
        </div>

        {/* -------------------------------------------------
            FIRST 3 — NORMAL PACKAGE CARDS
        -------------------------------------------------- */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {normalPackages.map((p, i) => (
            <PackageCard
              key={p.id}
              pkg={p}
              index={i}
              onQuote={() => openLead({ package: p.name, source: "packages" })}
              onBrochure={() => openBrochure(p.slug, p.name)}
              onPreview={() => setPreviewPkg(p)}
            />
          ))}
        </div>

        {/* -------------------------------------------------
            CUSTOM / PREMIUM — LONG FULL-WIDTH CARDS
        -------------------------------------------------- */}
        {customPackages.length > 0 && (
          <div className="mt-5 md:mt-6 space-y-5">
            {customPackages.map((p, i) => (
              <CustomPackageCard
                key={p.id}
                pkg={p}
                index={i + 3}
                onQuote={() => openLead({ package: p.name, source: "packages" })}
                onBrochure={() => openBrochure(p.slug, p.name)}
                onPreview={() => setPreviewPkg(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Preview Modal */}
      <PreviewModal
        pkg={previewPkg}
        onClose={() => setPreviewPkg(null)}
        onBrochure={() => {
          if (previewPkg) openBrochure(previewPkg.slug, previewPkg.name);
        }}
        onQuote={() => {
          if (previewPkg) {
            openLead({ package: previewPkg.name, source: "packages-preview" });
            setPreviewPkg(null);
          }
        }}
      />
    </section>
  );
}

/* -------------------------------------------------------
   NORMAL PACKAGE CARD (first 3)
------------------------------------------------------- */
function PackageCard({ pkg, onQuote, onBrochure, onPreview, index }) {
  const isPopular = pkg.is_most_popular;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="group h-full"
      data-testid={`package-card-${pkg.slug}`}
    >
      <div
        className={`relative h-full flex flex-col overflow-hidden rounded-2xl border transition-all duration-500 hover:scale-[1.02] hover:-translate-y-0.5 ${
          isPopular
            ? "bg-gradient-to-br from-[#000F1B] via-[#0B1E30] to-[#000F1B] border-white/10 text-white shadow-xl hover:shadow-[0_20px_50px_rgba(255,90,0,0.2)] hover:border-[#FF5A00]/40"
            : "bg-white border-black/5 text-[#000F1B] shadow-md hover:shadow-xl hover:border-[#FF5A00]/30"
        }`}
      >
        {/* Shine sweep */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
          {isPopular && (
            <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-[#FF5A00]/20 blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700" />
          )}
        </div>

        {isPopular && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 px-3 py-1 bg-[#FF5A00] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-b-xl shadow-lg">
            Most Popular
          </div>
        )}

        <div className="relative z-10 flex flex-col h-full p-4 sm:p-5 md:p-6">
          <div
            className={`text-[10px] sm:text-xs font-semibold tracking-widest uppercase ${
              isPopular ? "text-[#FF8A4C]" : "text-[#FF5A00]"
            }`}
          >
            {pkg.name}
          </div>

          <div className="mt-2 sm:mt-3 flex items-baseline gap-1 flex-wrap">
            <div
              className={`font-bold text-2xl sm:text-3xl md:text-[34px] leading-none ${
                isPopular ? "text-white" : "text-[#000F1B]"
              }`}
            >
              {pkg.price_display}
            </div>
            {pkg.price_unit && (
              <div
                className={`text-[11px] sm:text-sm ${
                  isPopular ? "text-white/60" : "text-[#000F1B]/50"
                }`}
              >
                {pkg.price_unit}
              </div>
            )}
          </div>

          <div
            className={`mt-1.5 text-xs sm:text-sm font-semibold ${
              isPopular ? "text-white" : "text-[#000F1B]"
            }`}
          >
            {pkg.tagline}
          </div>
          <div
            className={`mt-1 text-[10px] sm:text-xs leading-relaxed line-clamp-2 ${
              isPopular ? "text-white/60" : "text-[#000F1B]/55"
            }`}
          >
            {pkg.description}
          </div>

          <ul className="mt-4 space-y-1.5 sm:space-y-2 flex-1">
            {(pkg.highlights || []).slice(0, 5).map((h, i) => (
              <li
                key={`${pkg.slug}-hl-${i}`}
                className={`text-[11px] sm:text-sm flex items-start gap-1.5 sm:gap-2 ${
                  isPopular ? "text-white/90" : "text-[#000F1B]/85"
                }`}
              >
                <Check
                  className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                    isPopular ? "text-[#FF8A4C]" : "text-[#FF5A00]"
                  }`}
                />
                <span className="line-clamp-2">{h}</span>
              </li>
            ))}
          </ul>

          {/* Accent line */}
          <div className="mt-4 w-8 h-0.5 rounded-full bg-[#FF5A00] group-hover:w-14 transition-all duration-500" />

          {/* Buttons */}
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onPreview}
                className={`flex-1 rounded-full px-2 py-2 text-[11px] sm:text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition ${
                  isPopular
                    ? "text-white/90 hover:bg-white/10"
                    : "text-[#000F1B]/75 hover:bg-[#000F1B]/5"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
              <span className={`w-px h-4 ${isPopular ? "bg-white/20" : "bg-black/10"}`} />
              <button
                type="button"
                onClick={onBrochure}
                data-testid={`package-brochure-${pkg.slug}`}
                className={`flex-1 rounded-full px-2 py-2 text-[11px] sm:text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition ${
                  isPopular
                    ? "text-[#FF8A4C] hover:bg-white/10"
                    : "text-[#FF5A00] hover:bg-[#FF5A00]/8"
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>

            <Link
              to={`/packages/${pkg.slug}`}
              data-testid={`package-view-details-${pkg.slug}`}
              className={`w-full rounded-full px-4 py-2.5 text-xs sm:text-sm font-semibold transition inline-flex items-center justify-center gap-1.5 ${
                isPopular
                  ? "bg-[#FF5A00] text-white hover:bg-[#E04F00]"
                  : "bg-[#000F1B] text-white hover:bg-[#0B1E30]"
              }`}
            >
              View Details <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------
   CUSTOM / PREMIUM — LONG FULL-WIDTH CARD
------------------------------------------------------- */
function CustomPackageCard({ pkg, onQuote, onBrochure, onPreview, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      data-testid={`package-card-${pkg.slug}`}
    >
      <div className="group relative overflow-hidden rounded-2xl border border-[#FF5A00]/20 bg-gradient-to-r from-[#000F1B] via-[#0B1E30] to-[#000F1B] text-white shadow-xl hover:shadow-[0_20px_50px_rgba(255,90,0,0.18)] hover:border-[#FF5A00]/40 transition-all duration-500">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 right-10 w-64 h-64 rounded-full bg-[#FF5A00]/15 blur-3xl" />
          <div className="absolute -bottom-20 left-20 w-48 h-48 rounded-full bg-[#FF5A00]/10 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
        </div>

        <div className="relative z-10 grid md:grid-cols-[1fr_auto] gap-6 p-6 sm:p-8 md:p-10 items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-[#FF8A4C]">
                {pkg.name}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF5A00] text-white text-[9px] font-bold uppercase tracking-widest">
                Custom
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2 flex-wrap">
              <div className="font-bold text-3xl sm:text-4xl md:text-5xl leading-none text-white">
                {pkg.price_display}
              </div>
              {pkg.price_unit && (
                <div className="text-sm text-white/60">{pkg.price_unit}</div>
              )}
            </div>

            <div className="mt-2 text-base sm:text-lg font-semibold text-white">
              {pkg.tagline}
            </div>
            <p className="mt-1.5 text-sm text-white/60 max-w-xl leading-relaxed">
              {pkg.description}
            </p>

            <ul className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-2">
              {(pkg.highlights || []).slice(0, 6).map((h, i) => (
                <li
                  key={`${pkg.slug}-hl-${i}`}
                  className="text-sm flex items-start gap-2 text-white/90"
                >
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#FF8A4C]" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-2.5 w-full md:w-[220px] shrink-0">
            <div className="flex items-center rounded-full bg-white/5 overflow-hidden">
              <button
                type="button"
                onClick={onPreview}
                className="flex-1 px-3 py-2.5 text-xs font-semibold text-white/90 hover:bg-white/10 inline-flex items-center justify-center gap-1.5 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
              <span className="w-px h-5 bg-white/15" />
              <button
                type="button"
                onClick={onBrochure}
                data-testid={`package-brochure-${pkg.slug}`}
                className="flex-1 px-3 py-2.5 text-xs font-semibold text-[#FF8A4C] hover:bg-white/10 inline-flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>

            <Link
              to={`/packages/${pkg.slug}`}
              data-testid={`package-view-details-${pkg.slug}`}
              className="w-full rounded-full px-5 py-2.5 text-sm font-semibold bg-white text-[#000F1B] hover:bg-white/90 transition inline-flex items-center justify-center gap-1.5"
            >
              View Details <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={onQuote}
              className="w-full rounded-full px-5 py-3 text-sm font-semibold bg-[#FF5A00] text-white hover:bg-[#E04F00] shadow-[0_8px_24px_rgba(255,90,0,0.3)] transition inline-flex items-center justify-center gap-1.5"
            >
              Get Custom Quote <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------
   QUICK PREVIEW MODAL
------------------------------------------------------- */
function PreviewModal({ pkg, onClose, onBrochure, onQuote }) {
  if (!pkg) return null;

  const sections = (pkg.spec_categories || pkg.sections || []).slice(0, 6);

  return (
    <AnimatePresence>
      {pkg && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-[#000F1B]/80 backdrop-blur-md font-['Poppins',sans-serif]"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl max-h-[88vh] overflow-hidden rounded-2xl bg-white border border-black/5 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 bg-[#F7F7F7] shrink-0">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FF5A00]">
                  {pkg.name} Package
                </div>
                <div className="mt-0.5 text-lg font-bold text-[#000F1B]">
                  {pkg.price_display}
                  {pkg.price_unit && (
                    <span className="ml-1 text-sm font-medium text-[#000F1B]/50">
                      {pkg.price_unit}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close preview"
                className="w-9 h-9 rounded-full grid place-items-center bg-black/5 hover:bg-black/10 text-[#000F1B] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 sm:p-6">
              {pkg.tagline && (
                <p className="text-sm font-semibold text-[#000F1B]">{pkg.tagline}</p>
              )}
              {pkg.description && (
                <p className="mt-1 text-sm text-[#000F1B]/60 leading-relaxed">
                  {pkg.description}
                </p>
              )}

              {pkg.highlights?.length > 0 && (
                <div className="mt-5">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-[#FF5A00]">
                    Highlights
                  </div>
                  <ul className="mt-2.5 space-y-2">
                    {pkg.highlights.map((h, i) => (
                      <li
                        key={`pv-hl-${i}`}
                        className="text-sm flex items-start gap-2 text-[#000F1B]/85"
                      >
                        <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#FF5A00]" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {sections.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-[#FF5A00]">
                    Specifications
                  </div>
                  {sections.map((sec, i) => (
                    <div key={`pv-sec-${i}`}>
                      <div className="text-xs font-bold text-[#000F1B]">
                        {sec.name || sec.title}
                      </div>
                      <ul className="mt-1.5 space-y-1">
                        {(sec.items || []).slice(0, 4).map((it, j) => (
                          <li
                            key={`pv-item-${i}-${j}`}
                            className="text-xs flex items-start gap-1.5 text-[#000F1B]/70"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#FF5A00]" />
                            <span>
                              {typeof it === "string"
                                ? it
                                : `${it.spec}${it.value ? `: ${it.value}` : ""}`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="shrink-0 px-5 py-4 border-t border-black/5 bg-[#F7F7F7] flex flex-col sm:flex-row gap-2">
              <div className="flex flex-1 rounded-full bg-white border border-black/5 overflow-hidden">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-3 py-2.5 text-xs font-semibold text-[#000F1B]/70 hover:bg-black/5 inline-flex items-center justify-center gap-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5" /> Close
                </button>
                <span className="w-px bg-black/10" />
                <button
                  type="button"
                  onClick={onBrochure}
                  className="flex-1 px-3 py-2.5 text-xs font-semibold text-[#FF5A00] hover:bg-[#FF5A00]/5 inline-flex items-center justify-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>

              <Link
                to={`/packages/${pkg.slug}`}
                onClick={onClose}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#000F1B] text-white font-semibold text-sm px-4 py-2.5 hover:bg-[#0B1E30] transition"
              >
                View Details <ArrowRight className="w-4 h-4" />
              </Link>

              {(pkg.tier === "premium" || pkg.tier === "custom") && (
                <button
                  type="button"
                  onClick={onQuote}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#FF5A00] text-white font-semibold text-sm px-4 py-2.5 hover:bg-[#E04F00] transition"
                >
                  Get Custom Quote
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
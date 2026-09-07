import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Bed, Bath, Layers, Ruler } from "lucide-react";
import { FadeIn } from "@/components/site/Primitives";
import DiagonalCarousel from "@/components/site/DiagonalCarousel";

export default function HomeCollection({ homes = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!homes || homes.length === 0) return null;

  const safeIndex = activeIndex >= homes.length ? 0 : activeIndex;
  const activeHome = homes[safeIndex] || homes[0];

  const carouselItems = homes.map((h) => ({
    id: h.id || h.slug,
    src: h.cover_image,
    title: h.name,
    alt: h.name,
    data: h,
  }));

  const formatFloors = (floors) => {
    if (floors === undefined || floors === null) return "G+1";
    if (typeof floors === "string") return floors;
    return floors === 0 ? "G" : `G+${floors}`;
  };

  return (
    <section
      id="home-collection"
      data-testid="home-collection-section"
      className="relative overflow-hidden py-16 md:py-20 lg:py-24 font-['Poppins',sans-serif] selection:bg-[#FF5A00] selection:text-white"
    >
      {/* Section Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/images/bg/homecollection.webp"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1360px] px-5 sm:px-8 md:px-10 lg:px-12 xl:px-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(300px,400px)_1fr] lg:gap-10 xl:gap-14 items-stretch">
          
          {/* -------------------------------------------------
              LEFT — EDITORIAL PANEL
          -------------------------------------------------- */}
          <FadeIn className="h-full">
            <div className="relative flex h-full min-h-[520px] flex-col justify-between overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
              
              <div className="absolute inset-0 z-0">
                <img
                  src="/images/bg/homecollection.webp"
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#000F1B]/95 via-[#000F1B]/90 to-[#000F1B]/80" />
                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[#FF5A00]/20 blur-3xl pointer-events-none" />
                <div
                  className="absolute inset-0 opacity-[0.06] pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                    backgroundSize: "36px 36px",
                  }}
                />
              </div>

              {/* Header */}
              <div className="relative z-10 p-7 sm:p-8 md:p-10">
                <div className="flex items-center gap-3">
                  <span className="h-[2px] w-9 bg-[#FF5A00]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                    02 — Home Collection
                  </span>
                </div>

                <h2 className="mt-5 text-2xl font-bold leading-[1.1] text-white sm:text-3xl md:text-[34px] lg:text-[36px]">
                  Ready-to-Build{" "}
                  <span className="text-[#FF5A00]">Home Designs.</span>
                </h2>

                <p className="mt-4 max-w-md text-[13px] leading-relaxed text-white/70 sm:text-sm font-normal">
                  Choose from our expertly designed homes with complete structural plans,
                  material specifications, and 3D walkthroughs — built to bring your vision to life.
                </p>
              </div>

              {/* Active Home Specs */}
              <div className="relative z-10 p-7 sm:p-8 md:p-10 pt-0">
                <AnimatePresence mode="wait">
                  {activeHome && (
                    <motion.div
                      key={activeHome.id || safeIndex}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="rounded-xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-md shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          {activeHome.style && (
                            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FF5A00]">
                              {activeHome.style}
                            </span>
                          )}
                          <h3 className="mt-1 text-lg font-bold text-white tracking-tight">
                            {activeHome.name}
                          </h3>
                        </div>

                        {activeHome.estimated_cost && (
                          <div className="text-right shrink-0">
                            <span className="block text-[10px] uppercase tracking-[0.15em] text-white/50">
                              Estimated
                            </span>
                            <span className="text-sm font-bold text-white">
                              {activeHome.estimated_cost}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/10 pt-3 text-[11px] font-medium text-white/80">
                        {(activeHome.dimensions || activeHome.area_sqft) && (
                          <span className="inline-flex items-center gap-1.5">
                            <Ruler className="h-3.5 w-3.5 text-[#FF5A00]" />
                            {activeHome.dimensions || `${activeHome.area_sqft} sq.ft`}
                          </span>
                        )}

                        {activeHome.bedrooms && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-white/30" />
                            <span className="inline-flex items-center gap-1.5">
                              <Bed className="h-3.5 w-3.5 text-[#FF5A00]" />
                              {activeHome.bedrooms} BHK
                            </span>
                          </>
                        )}

                        {activeHome.bathrooms && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-white/30" />
                            <span className="inline-flex items-center gap-1.5">
                              <Bath className="h-3.5 w-3.5 text-[#FF5A00]" />
                              {activeHome.bathrooms} Bath
                            </span>
                          </>
                        )}

                        <span className="h-1 w-1 rounded-full bg-white/30" />
                        <span className="inline-flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-[#FF5A00]" />
                          {formatFloors(activeHome.floors)}
                        </span>
                      </div>

                      <Link
                        to={`/homes/${activeHome.slug}`}
                        className="group mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#FF5A00] transition-all hover:gap-3"
                      >
                        View Details
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-5">
                  <Link
                    to="/homes"
                    className="group inline-flex min-h-[46px] w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-[#FF5A00] px-6 py-3 text-[13px] font-semibold text-white transition-all duration-300 hover:bg-[#E04F00] hover:shadow-[0_10px_28px_rgba(255,90,0,0.35)] active:scale-[0.98]"
                  >
                    Explore All Designs
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

            </div>
          </FadeIn>

          {/* -------------------------------------------------
              RIGHT — CONTINUOUS DIAGONAL CAROUSEL
          -------------------------------------------------- */}
          <div className="relative min-h-[520px] lg:min-h-[580px] w-full overflow-hidden rounded-2xl bg-transparent border border-white/20 shadow-2xl backdrop-blur-sm">
            
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute inset-0 opacity-25">
                <div className="absolute -top-20 left-1/4 h-[800px] w-[1px] rotate-[15deg] bg-gradient-to-b from-transparent via-[#FF5A00]/60 to-transparent" />
                <div className="absolute -top-20 left-1/2 h-[800px] w-[1px] rotate-[15deg] bg-gradient-to-b from-transparent via-white/40 to-transparent" />
                <div className="absolute -top-20 left-3/4 h-[800px] w-[1px] rotate-[15deg] bg-gradient-to-b from-transparent via-[#FF5A00]/40 to-transparent" />
              </div>

              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                  backgroundSize: "44px 44px",
                }}
              />

              <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[#FF5A00]/15 blur-3xl" />
              <div className="absolute top-0 left-0 h-48 w-48 rounded-full bg-[#FF5A00]/10 blur-3xl" />
            </div>

            {/* Inventory Badge */}
            <div className="absolute left-5 top-5 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1.5 backdrop-blur-md">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF5A00]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90">
                {homes.length} Designs Available
              </span>
            </div>

            {/* Carousel */}
            <div className="relative z-10 h-full w-full">
              <DiagonalCarousel
                items={carouselItems}
                activeIndex={safeIndex}
                onActiveIndexChange={setActiveIndex}
                autoPlay={true}
                autoPlayInterval={3500}
                slideSize={220}
                slideAspect={0.72}
                rotationStep={20}
                verticalStep={78}
                inactiveScale={0.58}
                labelClassName="text-white"
              />
            </div>
          </div>

        </div>

        {/* Mobile Thumbnail Strip */}
        <div className="mt-6 flex gap-2.5 overflow-x-auto pb-2 scrollbar-none lg:hidden">
          {homes.map((h, idx) => (
            <button
              type="button"
              key={h.id || idx}
              onClick={() => setActiveIndex(idx)}
              className={`shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                idx === safeIndex
                  ? "border-[#FF5A00] scale-105 shadow-md"
                  : "border-transparent opacity-50 hover:opacity-80"
              }`}
            >
              <img
                src={h.cover_image}
                alt={h.name}
                className="h-20 w-16 object-cover"
              />
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
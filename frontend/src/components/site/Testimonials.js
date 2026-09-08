"use client";

import React from "react";
import { Star, Quote } from "lucide-react";
import { FadeIn, SectionLabel } from "@/components/site/Primitives";

export default function Testimonials({ items = [] }) {
  if (!items.length) return null;

  const loop = [...items, ...items];

  const avg =
    items.reduce((s, t) => s + (t.rating || 5), 0) / Math.max(items.length, 1);

  return (
    <section
      id="testimonials"
      data-testid="testimonials-section"
      className="relative py-16 md:py-24 lg:py-28 scroll-mt-20 bg-[#F7F7F7] overflow-hidden font-['Poppins',sans-serif] selection:bg-[#FF5A00] selection:text-white"
    >
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-[#FF5A00]/[0.06] blur-3xl" />

      <div className="container-wide relative z-10">
        <div className="grid lg:grid-cols-[minmax(260px,320px)_1fr] gap-8 lg:gap-12 items-end mb-8 md:mb-10">
          <FadeIn>
            <SectionLabel number={9} eyebrow="Testimonials" />
            <h2 className="mt-3 text-[#000F1B] font-bold text-3xl sm:text-4xl md:text-[40px] leading-[1.1] tracking-tight">
              Happy Families.{" "}
              <span className="text-[#FF5A00]">Happy Homes.</span>
            </h2>
            <p className="mt-3 text-[#000F1B]/55 max-w-md text-sm leading-relaxed">
              Real families. Real homes. Real stories of transparent construction
              with ConstructONS.
            </p>

            <div className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-[#000F1B] text-white px-4 py-3.5 shadow-[0_16px_40px_rgba(0,15,27,0.2)]">
              <div>
                <div className="text-3xl font-extrabold leading-none">
                  {avg.toFixed(1)}
                  <span className="text-[#FF5A00] text-xl">/5</span>
                </div>
                <div className="text-[10px] text-white/50 mt-1 uppercase tracking-wider">
                  Customer Rating
                </div>
              </div>
              <div className="h-10 w-px bg-white/15" />
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-[#FF5A00] fill-[#FF5A00]"
                  />
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Marquee */}
          <div className="relative overflow-hidden -mx-4 sm:mx-0">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-16 bg-gradient-to-r from-[#F7F7F7] to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-16 bg-gradient-to-l from-[#F7F7F7] to-transparent z-10" />

            <div className="marquee-track flex gap-4" style={{ width: "max-content" }}>
              {loop.map((t, i) => (
                <TestimonialCard
                  t={t}
                  key={`${t.id || t.customer_name || "t"}-${i}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .marquee-track {
          animation: constructons-marquee 40s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes constructons-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

function TestimonialCard({ t }) {
  return (
    <div className="group w-[300px] sm:w-[340px] shrink-0 bg-white rounded-2xl border border-black/5 shadow-md hover:shadow-[0_16px_40px_rgba(255,90,0,0.12)] hover:border-[#FF5A00]/25 p-5 transition-all duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={t.avatar}
            alt={t.customer_name}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-[#FF5A00]/15"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80";
            }}
          />
          <div className="min-w-0">
            <div className="font-semibold text-[#000F1B] text-sm truncate">
              {t.customer_name}
            </div>
            <div className="text-[11px] text-[#000F1B]/50 truncate">
              {t.location}
              {t.home_purchased ? ` · ${t.home_purchased}` : ""}
            </div>
          </div>
        </div>
        <Quote className="w-5 h-5 text-[#FF5A00]/30 shrink-0" />
      </div>

      <div className="mt-3 flex items-center gap-0.5">
        {Array.from({ length: t.rating || 5 }).map((_, i) => (
          <Star
            key={i}
            className="w-3.5 h-3.5 text-[#FF5A00] fill-[#FF5A00]"
          />
        ))}
      </div>

      <p className="mt-3 text-sm text-[#000F1B]/75 leading-relaxed line-clamp-4">
        “{t.quote}”
      </p>
    </div>
  );
}
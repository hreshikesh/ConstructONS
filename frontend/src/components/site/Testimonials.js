import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { FadeIn, SectionLabel } from "@/components/site/Primitives";

export default function Testimonials({ items = [] }) {
  if (!items.length) return null;
  const loop = [...items, ...items];
  return (
    <section id="testimonials" data-testid="testimonials-section" className="py-24 md:py-32 bg-brand-bg overflow-hidden">
      <div className="container-wide">
        <div className="grid lg:grid-cols-[minmax(280px,340px)_1fr] gap-10 items-end mb-10">
          <FadeIn>
            <SectionLabel number={9} eyebrow="Testimonials" />
            <h2 className="mt-4 text-brand-navy font-bold">Happy Families<br /> Happy Homes</h2>
            <p className="mt-4 text-brand-navy/60 max-w-md leading-relaxed">
              Real families. Real homes. Real stories of transparent construction with ConstructONS.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-navy text-white px-4 py-3">
              <div>
                <div className="text-3xl font-extrabold leading-none">4.9<span className="text-brand-orange">/5</span></div>
                <div className="text-xs text-white/60 mt-1">Customer Rating</div>
              </div>
              <div className="h-10 w-px bg-white/15 mx-2" />
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={`hdr-star-${i}`} className="w-4 h-4 text-brand-orange fill-brand-orange" />
                ))}
              </div>
            </div>
          </FadeIn>

          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-brand-bg to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-brand-bg to-transparent z-10" />
            <div className="marquee-track flex gap-4" style={{ width: "max-content" }}>
              {loop.map((t, i) => (
                <TestimonialCard t={t} key={`${t.id || t.customer_name || "t"}-${i}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ t }) {
  return (
    <div className="w-[320px] md:w-[360px] shrink-0 bg-white rounded-2xl border border-black/5 shadow-soft p-5">
      <div className="flex items-center gap-3">
        <img src={t.avatar} alt={t.customer_name} className="w-11 h-11 rounded-full object-cover" />
        <div>
          <div className="font-semibold text-brand-navy text-sm">{t.customer_name}</div>
          <div className="text-xs text-brand-navy/60">{t.location}{t.home_purchased ? ` • ${t.home_purchased}` : ""}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-0.5">
        {Array.from({ length: t.rating || 5 }).map((_, i) => (
          <Star key={`${t.id || t.customer_name}-star-${i}`} className="w-3.5 h-3.5 text-brand-orange fill-brand-orange" />
        ))}
      </div>
      <p className="mt-3 text-sm text-brand-navy/75 leading-relaxed">“{t.quote}”</p>
    </div>
  );
}

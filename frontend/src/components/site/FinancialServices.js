import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import LucideIcon from "@/components/site/LucideIcon";
import { FadeIn, SectionLabel } from "@/components/site/Primitives";

export default function FinancialServices({ items = [] }) {
  return (
    <section id="financial" data-testid="financial-section" className="py-24 md:py-32 bg-white">
      <div className="container-wide">
        <div className="grid lg:grid-cols-[minmax(280px,340px)_1fr] gap-10 items-end mb-8">
          <FadeIn>
            <SectionLabel number={6} eyebrow="Financial Services" />
            <h2 className="mt-4 text-brand-navy font-bold">Flexible Financial<br /> Solutions</h2>
            <p className="mt-4 text-brand-navy/60 max-w-md leading-relaxed">
              Making your dream home more affordable with easy payment options.
            </p>
          </FadeIn>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {items.map((s, i) => (
            <motion.div
              key={s.id}
              data-testid={`finserv-${s.slug}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              className="relative rounded-3xl border border-black/5 bg-white p-6 shadow-soft hover:shadow-premium hover:-translate-y-0.5 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-brand-orange/10 text-brand-orange grid place-items-center">
                <LucideIcon name={s.icon || "CreditCard"} className="w-5 h-5" />
              </div>
              <div className="mt-4 font-bold text-brand-navy">{s.name}</div>
              <div className="text-sm text-brand-navy/60 mt-1">{s.tagline}</div>
              <ul className="mt-4 space-y-1.5">
                {s.features?.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-brand-navy/80">
                    <Check className="w-3.5 h-3.5 text-brand-orange mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              {s.coming_soon && (
                <div className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest bg-brand-navy text-white px-2 py-1 rounded-full">Coming Soon</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

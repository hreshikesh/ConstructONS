import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import LucideIcon from "@/components/site/LucideIcon";
import { FadeIn, SectionLabel } from "@/components/site/Primitives";

export default function Marketplace({ items = [] }) {
  return (
    <section id="marketplace" data-testid="marketplace-section" className="py-24 md:py-32 bg-brand-bg">
      <div className="container-wide">
        <div className="grid lg:grid-cols-[minmax(280px,340px)_1fr] gap-10 items-end mb-8">
          <FadeIn>
            <SectionLabel number={5} eyebrow="Marketplace" />
            <h2 className="mt-4 text-brand-navy font-bold">Everything You Need<br /> to Build</h2>
            <p className="mt-4 text-brand-navy/60 max-w-md leading-relaxed">
              One stop marketplace for materials, equipment, contractors & professionals.
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((it, i) => (
            <MarketCard key={it.id} item={it} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MarketCard({ item, index }) {
  return (
    <motion.a
      href="#"
      onClick={(e) => e.preventDefault()}
      data-testid={`marketplace-${item.slug}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay: index * 0.04 }}
      className="group relative rounded-2xl overflow-hidden bg-white border border-black/5 shadow-soft hover:shadow-premium transition-all hover:-translate-y-0.5"
    >
      <div className="aspect-[5/4] overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      </div>
      {item.coming_soon && (
        <div className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest bg-brand-navy text-white px-2 py-1 rounded-full">Coming Soon</div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              {item.icon && (
                <div className="w-7 h-7 rounded-lg bg-brand-orange/10 text-brand-orange grid place-items-center">
                  <LucideIcon name={item.icon} className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="font-semibold text-brand-navy text-sm">{item.name}</div>
            </div>
            <div className="mt-1 text-[11px] text-brand-navy/60 leading-relaxed">{item.description}</div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-brand-navy/40 group-hover:text-brand-orange transition" />
        </div>
      </div>
    </motion.a>
  );
}

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import LucideIcon from "@/components/site/LucideIcon";
import { FadeIn, SectionLabel } from "@/components/site/Primitives";

export default function CustomerJourney({ steps = [] }) {
  return (
    <section id="journey" data-testid="journey-section" className="py-24 md:py-32 bg-white">
      <div className="container-wide">
        <FadeIn>
          <SectionLabel number={8} eyebrow="Customer Journey" />
          <h2 className="mt-4 text-brand-navy font-bold">Your Journey<br /> with ConstructONS</h2>
        </FadeIn>

        <div className="mt-12 relative">
          <div className="absolute top-8 left-0 right-0 h-px bg-brand-navy/10 hidden md:block" />
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "left" }}
            className="absolute top-8 left-0 right-0 h-px bg-brand-orange hidden md:block"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="relative flex flex-col items-center text-center"
                data-testid={`journey-step-${s.step_no}`}
              >
                <div className="relative w-16 h-16 rounded-2xl bg-white border-2 border-brand-orange/20 grid place-items-center shadow-soft group hover:border-brand-orange hover:shadow-glow transition-all">
                  <LucideIcon name={s.icon || "Check"} className="w-6 h-6 text-brand-orange" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-orange text-white text-[10px] font-bold grid place-items-center border-2 border-white">
                    {String(s.step_no).padStart(2, "0")}
                  </div>
                </div>
                <div className="mt-3 font-semibold text-brand-navy text-sm">{s.name}</div>
                <div className="mt-1 text-[10px] text-brand-navy/60 leading-relaxed max-w-[140px]">{s.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

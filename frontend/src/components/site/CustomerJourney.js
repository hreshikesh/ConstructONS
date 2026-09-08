"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import LucideIcon from "@/components/site/LucideIcon";
import { FadeIn, SectionLabel } from "@/components/site/Primitives";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

export default function CustomerJourney({ steps = [] }) {
  const sectionRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"],
  });

  const progressHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  if (!steps.length) return null;

  return (
    <section
      ref={sectionRef}
      id="journey"
      data-testid="journey-section"
      className="relative bg-white font-['Poppins',sans-serif] selection:bg-[#FF5A00] selection:text-white scroll-mt-20"
    >
      {/* INTRO — compact */}
      <div className="container-wide pt-12 md:pt-16 lg:pt-20 pb-6 md:pb-8">
        <FadeIn>
          <SectionLabel number={8} eyebrow="Customer Journey" />
          <h2 className="mt-3 text-[#000F1B] font-bold text-2xl sm:text-3xl md:text-[36px] leading-[1.15] tracking-tight max-w-2xl">
            From First Idea.{" "}
            <span className="text-[#FF5A00]">To Your Front Door.</span>
          </h2>
          <p className="mt-2 max-w-lg text-[#000F1B]/55 text-sm leading-relaxed">
            A guided construction experience — informed, involved and confident
            at every stage.
          </p>
        </FadeIn>
      </div>

      {/* TIMELINE */}
      <div className="container-wide pb-12 md:pb-16">
        <div className="relative">
          {/* Rail */}
          <div className="absolute left-[18px] md:left-1/2 md:-translate-x-1/2 top-3 bottom-3 w-px bg-[#000F1B]/10" />
          <motion.div
            style={{ height: progressHeight }}
            className="absolute left-[18px] md:left-1/2 md:-translate-x-1/2 top-3 w-[2px] bg-[#FF5A00] origin-top"
          />

          <div className="space-y-8 md:space-y-10">
            {steps.map((step, index) => (
              <JourneyItem
                key={step.id || step.step_no || index}
                step={step}
                index={index}
                total={steps.length}
                setActiveStep={setActiveStep}
                isLeft={index % 2 === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function JourneyItem({ step, index, total, setActiveStep, isLeft }) {
  return (
    <motion.article
      id={`journey-step-${step.step_no}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onViewportEnter={() => setActiveStep(index)}
      className="relative z-10"
    >
      {/* Desktop center node */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-4 z-20">
        <StepNode step={step} />
      </div>

      {/* Mobile left node */}
      <div className="md:hidden absolute left-0 top-0 z-20">
        <StepNode step={step} compact />
      </div>

      <div className="pl-12 md:pl-0 md:grid md:grid-cols-2 md:gap-8 lg:gap-12 md:items-center">
        {isLeft ? (
          <>
            <StepContent step={step} align="right" />
            <StepImage step={step} total={total} />
          </>
        ) : (
          <>
            <div className="md:order-2">
              <StepContent step={step} align="left" />
            </div>
            <div className="md:order-1">
              <StepImage step={step} total={total} />
            </div>
          </>
        )}
      </div>
    </motion.article>
  );
}

function StepNode({ step, compact = false }) {
  return (
    <div
      className={`relative rounded-full bg-white border-2 border-[#FF5A00]/40 shadow-sm flex items-center justify-center shrink-0 ${
        compact ? "w-9 h-9" : "w-12 h-12"
      }`}
    >
      <div
        className={`rounded-full bg-[#000F1B] flex items-center justify-center ${
          compact ? "w-6 h-6" : "w-8 h-8"
        }`}
      >
        <LucideIcon
          name={step.icon || "Check"}
          className={`text-white ${compact ? "w-3 h-3" : "w-3.5 h-3.5"}`}
        />
      </div>
      <span
        className={`absolute -top-1 -right-1 rounded-full bg-[#FF5A00] text-white font-bold flex items-center justify-center border-2 border-white ${
          compact ? "w-4 h-4 text-[7px]" : "w-5 h-5 text-[8px]"
        }`}
      >
        {String(step.step_no ?? "").padStart(2, "0")}
      </span>
    </div>
  );
}

function StepContent({ step, align = "right" }) {
  const alignClasses =
    align === "right"
      ? "md:text-right md:pr-8 lg:pr-12 md:items-end"
      : "md:text-left md:pl-8 lg:pl-12 md:items-start";

  return (
    <div className={`flex flex-col ${alignClasses}`}>
      <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#FF5A00]">
        Step {String(step.step_no ?? "").padStart(2, "0")}
      </div>

      <h3 className="mt-1 text-lg sm:text-xl md:text-2xl font-bold text-[#000F1B] leading-tight">
        {step.name}
      </h3>

      <p className="mt-1.5 text-[#000F1B]/60 leading-relaxed text-xs sm:text-sm max-w-sm">
        {step.description}
      </p>

      <div
        className={`mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-[#000F1B]/40 ${
          align === "right" ? "md:flex-row-reverse" : ""
        }`}
      >
        <span>{String(step.step_no ?? "").padStart(2, "0")}</span>
        <ArrowRight
          className={`w-3 h-3 text-[#FF5A00] ${
            align === "right" ? "md:rotate-180" : ""
          }`}
        />
        <span>
          {Number(step.step_no) === 8
            ? "Your home is ready"
            : "Continue"}
        </span>
      </div>
    </div>
  );
}

function StepImage({ step, total }) {
  const src = step.image || step.cover_image || FALLBACK_IMG;

  return (
    <div className="relative overflow-hidden rounded-2xl aspect-[16/10] bg-[#E8EEF2] shadow-md mt-3 md:mt-0">
      {/* Always-visible image — no clip-path that can hide it */}
      <img
        src={src}
        alt={step.name || "Journey step"}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          if (e.currentTarget.src !== FALLBACK_IMG) {
            e.currentTarget.src = FALLBACK_IMG;
          }
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#000F1B]/50 via-transparent to-transparent pointer-events-none" />

      <div className="absolute left-3 bottom-3">
        <div className="px-2.5 py-1 rounded-full bg-white/95 text-[#000F1B] text-[10px] font-semibold shadow-sm">
          {step.name}
        </div>
      </div>

      <div className="absolute top-3 right-3">
        <div className="px-2 py-0.5 rounded bg-black/45 text-white text-[9px] font-bold tracking-wider">
          {String(step.step_no ?? "").padStart(2, "0")} /{" "}
          {String(total).padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}
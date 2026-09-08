import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useLeadModal } from "@/components/site/LeadModalProvider";

export default function Hero() {
  const { open: openLead } = useLeadModal();
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      // Smooth looping
      if (video.duration && video.currentTime >= video.duration - 0.15) {
        video.currentTime = 0;
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);



  return (
    <section
      id="top"
      data-testid="hero-section"
      className="relative min-h-[100svh] w-full overflow-hidden bg-[#000F1B]"
    >
      {/* -------------------------------------------------
          BACKGROUND VIDEO & SMART OVERLAYS
      -------------------------------------------------- */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover scale-[1.02]"
        >
          <source src="/videos/constructons-hero.mp4" type="video/mp4" />
        </video>

        {/* 1. Base light darkening to ensure general contrast */}
        <div className="absolute inset-0 bg-[#000F1B]/20" />

        {/* 2. Text Protection Gradient (Dark on left, transparent on right) 
            This allows the video to shine on the right side! */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#000F1B]/95 via-[#000F1B]/70 to-transparent w-full md:w-[85%]" />

        {/* 3. Bottom fade to blend seamlessly into the next section */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#000F1B] to-transparent" />
      </div>

      {/* -------------------------------------------------
          HERO CONTENT
      -------------------------------------------------- */}
      <div className="relative z-10 flex min-h-[100svh] items-center">
        <div className="mx-auto w-full max-w-[1536px] px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24 pt-28 md:pt-32 pb-20">
          <div className="max-w-4xl">
            
            {/* Tagline / Kicker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6 flex items-center gap-4"
            >
              <span className="h-[2px] w-12 bg-[#FF5A00]" />
              <span className="font-[Poppins] text-sm font-semibold tracking-[0.15em] text-white uppercase">
                ConstructONS™
              </span>
            </motion.div>

            {/* Main Premium Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-[Poppins] text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-bold leading-[1.15] text-white tracking-tight"
            >
              Your trusted partner for <br className="hidden lg:block" />
              every stage of <span className="text-[#FF5A00]">home construction.</span>
            </motion.h1>

            {/* Subtext (Exact copy from Welcome Guide Page 2) */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 max-w-2xl font-[Poppins] text-base md:text-lg text-white/80 leading-relaxed font-light"
            >
              From the first blueprint to the final handover, we make your dream home a reality with transparency, quality and trust.
            </motion.p>

            {/* Premium CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              {/* Primary Button */}
              <a
              href="/about"
                type="button"
                className="group flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#FF5A00] px-8 py-3 font-[Poppins] text-base font-medium text-white transition-all duration-300 hover:bg-[#FF2D00] hover:shadow-[0_8px_25px_rgba(255,90,0,0.3)] w-full sm:w-auto"
              >
                Explore Our Ecosystem
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>

              {/* Secondary Button */}
              <button
                type="button"
                onClick={() => openLead({ source: "hero" })}
                className="flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-white/20 bg-transparent px-8 py-3 font-[Poppins] text-base font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-[#FF5A00] hover:bg-[#FF5A00]/10 hover:text-[#FF5A00] w-full sm:w-auto"
              >
                Talk to an Expert
              </button>
            </motion.div>
          </div>
        </div>
      </div>

     
    </section>
  );
}
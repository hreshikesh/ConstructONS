import React from "react";
import LogoMark from "@/components/site/LogoMark";

/**
 * ConstructONS Brand Lockup
 *
 * Matches the brand reference exactly:
 *   [ORANGE CIRCLE C]  ConstructONS™
 *                      EVERYTHING CONSTRUCTION. ALWAYS ON.
 *
 * @param {"light"|"dark"} tone  — light = for white surfaces, dark = for dark surfaces
 * @param {string} size          — 'sm' | 'md' | 'lg'
 */
export default function BrandLockup({ tone = "light", size = "md", className = "" }) {
  const isDark = tone === "dark";

  const sizes = {
    sm: { mark: "w-7 h-7", word: "text-[15px]", tm: "text-[8px]", tag: "text-[7.5px]" },
    md: { mark: "w-9 h-9", word: "text-[19px]", tm: "text-[9px]", tag: "text-[8.5px]" },
    lg: { mark: "w-11 h-11", word: "text-[24px]", tm: "text-[11px]", tag: "text-[10px]" },
  }[size] || {};

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className={sizes.mark} />
      <div className="leading-none">
        <div className="flex items-start">
          <span
            className={`font-extrabold tracking-tight ${sizes.word} ${
              isDark ? "text-white" : "text-brand-navy"
            }`}
            style={{ letterSpacing: "-0.015em" }}
          >
            <span className="font-semibold">Construct</span>
            <span className="font-extrabold">ONS</span>
          </span>
          <span
            className={`ml-0.5 mt-0.5 font-semibold ${sizes.tm} ${
              isDark ? "text-white/70" : "text-brand-navy/60"
            }`}
          >
            ™
          </span>
        </div>
        <div
          className={`mt-1 font-semibold uppercase ${sizes.tag} ${
            isDark ? "text-white/60" : "text-brand-navy/55"
          }`}
          style={{ letterSpacing: "0.14em" }}
        >
          Everything Construction. Always On.
        </div>
      </div>
    </div>
  );
}

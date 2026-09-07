import React from "react";
import LogoMark from "@/components/site/LogoMark";

/**
 * ConstructONS Brand Lockup
 * Matches brand guidelines exactly:
 * [ORANGE C LOGO] ConstructONS™
 *                 EVERYTHING CONSTRUCTION. ALWAYS ON.
 */
export default function BrandLockup({
  tone = "light",
  size = "md",
  className = "",
  responsive = false,
}) {
  const isDark = tone === "dark";

  const sizes =
    {
      sm: { mark: "w-7 h-7", word: "text-[15px]", tm: "text-[8px]", tag: "text-[7.5px]" },
      md: { mark: "w-9 h-9", word: "text-[19px]", tm: "text-[9px]", tag: "text-[8.5px]" },
      lg: { mark: "w-11 h-11", word: "text-[24px]", tm: "text-[11px]", tag: "text-[10px]" },
    }[size] || {};

  return (
    <div className={`flex items-center gap-2.5 min-w-0 ${className}`}>
      <div className="shrink-0">
        <LogoMark className={sizes.mark} />
      </div>
      <div className="leading-none min-w-0 truncate">
        <div className="flex items-start">
          <span
            className={`font-extrabold tracking-tight ${sizes.word} ${
              isDark ? "text-white" : "text-[#000F1B]"
            }`}
            style={{ letterSpacing: "-0.015em" }}
          >
            <span className="font-semibold">Construct</span>
            <span className="font-extrabold text-[#FF5A00]">ONS</span>
          </span>
          <span
            className={`ml-0.5 mt-0.5 font-semibold ${sizes.tm} ${
              isDark ? "text-white/70" : "text-[#000F1B]/60"
            }`}
          >
            ™
          </span>
        </div>
        <div
          className={`mt-1 font-semibold uppercase truncate ${sizes.tag} ${
            responsive ? "hidden sm:block" : ""
          } ${isDark ? "text-white/70" : "text-[#000F1B]/60"}`}
          style={{ letterSpacing: "0.14em" }}
        >
          Everything Construction. Always On.
        </div>
      </div>
    </div>
  );
}
import React from "react";

export default function LogoMark({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#FF5A00" />
          <stop offset="100%" stopColor="#FF9040" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#lg1)" />
      <path d="M18 40 L32 20 L46 40 Z" fill="white" opacity=".95" />
      <rect x="27" y="32" width="10" height="12" fill="#0B1220" opacity=".85" />
      <circle cx="32" cy="32" r="3" fill="#FF5A00" />
    </svg>
  );
}

import React from "react";
import { Phone, MessageCircle } from "lucide-react";

export default function FloatingActions({ phone, whatsapp }) {
  const wa = (whatsapp || "").replace(/\D/g, "");
  return (
    <div className="fixed right-4 md:right-5 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
      {phone && (
        <a href={`tel:${phone}`} data-testid="float-call" aria-label="Call" className="w-11 h-11 rounded-full bg-white shadow-premium border border-black/5 grid place-items-center text-brand-orange hover:bg-brand-orange hover:text-white transition">
          <Phone className="w-5 h-5" />
        </a>
      )}
      {wa && (
        <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" data-testid="float-whatsapp" aria-label="WhatsApp" className="w-11 h-11 rounded-full bg-white shadow-premium border border-black/5 grid place-items-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition">
          <MessageCircle className="w-5 h-5" />
        </a>
      )}
    </div>
  );
}

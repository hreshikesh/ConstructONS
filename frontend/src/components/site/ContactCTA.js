"use client";

import React from "react";
import {
  Phone,
  MessageCircle,
  Mail,
  ArrowRight,
  MapPin,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { FadeIn, SectionLabel } from "@/components/site/Primitives";
import { useLeadModal } from "@/components/site/LeadModalProvider";

export default function ContactCTA({ settings = {} }) {
  const { open } = useLeadModal();

  const phone = settings.phone || "+91 98765 43210";
  const whatsapp = settings.whatsapp || phone;
  const email = settings.email || "hello@constructons.in";
  const address =
    settings.address || "12th Floor, Prestige Tower, MG Road, Bangalore";
  const waNumber = String(whatsapp).replace(/\D/g, "");
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    "Hi ConstructONS, I'd like a free consultation for my home construction."
  )}`;
  // WhatsApp click-to-chat QR (works without extra API key)
  const waQr = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(
    waLink
  )}`;

  return (
    <section
      id="contact"
      data-testid="contact-section"
      className="relative py-16 md:py-24 lg:py-28 bg-white font-['Poppins',sans-serif] selection:bg-[#FF5A00] selection:text-white overflow-hidden"
    >
      <div className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-[#FF5A00]/[0.05] blur-3xl" />

      <div className="container-wide relative z-10">
        {/* Header */}
        <div className="mb-10 md:mb-12 max-w-2xl">
          <FadeIn>
            <SectionLabel number={10} eyebrow="Get In Touch" />
            <h2 className="mt-3 text-[#000F1B] font-bold text-3xl sm:text-4xl md:text-[42px] leading-[1.1] tracking-tight">
              Let&rsquo;s Build Your{" "}
              <span className="text-[#FF5A00]">Dream Home</span> Together
            </h2>
            <p className="mt-3 text-[#000F1B]/55 text-sm md:text-[15px] leading-relaxed max-w-lg">
              Talk to our team — free, no obligation. We&rsquo;ll help you pick the
              right home and package.
            </p>
          </FadeIn>
        </div>

        {/* Main contact grid */}
        <div className="grid lg:grid-cols-[1fr_auto] gap-6 lg:gap-8 items-stretch">
          {/* Left — channels + CTA */}
          <div className="rounded-[28px] border border-black/5 bg-[#F7F7F7] p-2 md:p-3">
            <div className="rounded-[22px] bg-white p-5 sm:p-6 md:p-8 h-full flex flex-col">
              <div className="grid sm:grid-cols-3 gap-4">
                <ContactItem
                  icon={Phone}
                  label="Call Us"
                  value={phone}
                  href={`tel:${phone}`}
                  testId="contact-call"
                />
                <ContactItem
                  icon={MessageCircle}
                  label="WhatsApp"
                  value={whatsapp}
                  href={waLink}
                  testId="contact-whatsapp"
                />
                <ContactItem
                  icon={Mail}
                  label="Email Us"
                  value={email}
                  href={`mailto:${email}`}
                  testId="contact-email"
                />
              </div>

              <div className="mt-6 pt-6 border-t border-black/5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div className="flex items-start gap-3 text-sm text-[#000F1B]/60">
                  <Clock className="w-4 h-4 mt-0.5 text-[#FF5A00] shrink-0" />
                  <div>
                    <div className="font-semibold text-[#000F1B] text-sm">
                      Mon – Sat · 9:00 AM – 7:00 PM
                    </div>
                    <div className="text-xs mt-0.5">Average response under 30 mins</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => open({ source: "contact" })}
                  data-testid="contact-cta"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF5A00] hover:bg-[#E04F00] text-white font-semibold text-sm px-6 py-3.5 shadow-[0_12px_30px_rgba(255,90,0,0.3)] transition w-full sm:w-auto"
                >
                  Get Free Consultation
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 text-[11px] text-[#000F1B]/40 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Free &amp; no obligation · Your data stays private
              </div>
            </div>
          </div>

          {/* Right — Phone mock + WhatsApp QR */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-5 lg:w-[220px]">
            {/* Phone device */}
            <div className="phoneContainer relative shrink-0">
              <div className="screen overflow-hidden flex flex-col">
                <div className="camera" />
                {/* Status bar */}
                <div className="mt-7 px-3 flex items-center justify-between text-[8px] font-semibold text-white/90">
                  <span>9:41</span>
                  <span className="flex gap-0.5">
                    <span className="w-2.5 h-1.5 rounded-[1px] bg-white/80" />
                    <span className="w-1 h-1.5 rounded-[1px] bg-white/80" />
                  </span>
                </div>

                {/* App content */}
                <div className="flex-1 px-3 pt-3 pb-2 flex flex-col">
                  <div className="text-center">
                    <div className="mx-auto w-10 h-10 rounded-xl bg-white/20 backdrop-blur grid place-items-center text-white font-black text-sm border border-white/30">
                      C
                    </div>
                    <div className="mt-1.5 text-white font-bold text-[11px] drop-shadow">
                      ConstructONS
                    </div>
                    <div className="text-white/80 text-[8px]">Always On</div>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <a
                      href={`tel:${phone}`}
                      className="flex items-center gap-2 rounded-lg bg-white/95 px-2 py-1.5 shadow-sm"
                    >
                      <span className="w-6 h-6 rounded-md bg-[#FF5A00]/15 grid place-items-center text-[#FF5A00]">
                        <Phone className="w-3 h-3" />
                      </span>
                      <span className="text-[9px] font-bold text-[#000F1B] truncate">
                        Call team
                      </span>
                    </a>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-white/95 px-2 py-1.5 shadow-sm"
                    >
                      <span className="w-6 h-6 rounded-md bg-emerald-500/15 grid place-items-center text-emerald-600">
                        <MessageCircle className="w-3 h-3" />
                      </span>
                      <span className="text-[9px] font-bold text-[#000F1B] truncate">
                        WhatsApp us
                      </span>
                    </a>
                    <button
                      type="button"
                      onClick={() => open({ source: "contact-phone-mock" })}
                      className="w-full flex items-center gap-2 rounded-lg bg-[#000F1B] px-2 py-1.5"
                    >
                      <span className="w-6 h-6 rounded-md bg-[#FF5A00] grid place-items-center text-white">
                        <ArrowRight className="w-3 h-3" />
                      </span>
                      <span className="text-[9px] font-bold text-white truncate">
                        Free consult
                      </span>
                    </button>
                  </div>

                  <div className="mt-auto pt-2">
                    <div className="rounded-xl bg-white/15 backdrop-blur border border-white/20 p-1.5 flex justify-center">
                      <img
                        src={waQr}
                        alt="WhatsApp QR"
                        className="w-[72px] h-[72px] rounded-md bg-white p-1"
                      />
                    </div>
                    <div className="mt-1 text-center text-white/85 text-[7px] font-semibold uppercase tracking-wider">
                      Scan for WhatsApp
                    </div>
                  </div>
                </div>

                {/* Home bar */}
                <div className="pb-2 flex justify-center">
                  <div className="w-10 h-1 rounded-full bg-white/50" />
                </div>
              </div>
            </div>

            {/* Desktop / large QR card */}
            <div className="w-full max-w-[200px] rounded-2xl border border-black/5 bg-[#F7F7F7] p-4 text-center">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#000F1B]/45">
                WhatsApp QR
              </div>
              <div className="mt-2 mx-auto w-[120px] h-[120px] rounded-xl bg-white p-2 border border-black/5 shadow-sm">
                <img
                  src={waQr}
                  alt="Scan to chat on WhatsApp"
                  className="w-full h-full object-contain"
                />
              </div>
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center justify-center gap-1.5 w-full rounded-full bg-[#25D366] hover:bg-[#1ebe57] text-white text-xs font-bold py-2.5 transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Open WhatsApp
              </a>
              <p className="mt-2 text-[10px] text-[#000F1B]/45 leading-snug">
                Scan with your phone camera to start a chat
              </p>
            </div>
          </div>
        </div>

        {/* Map + office — improved mobile stack */}
        {(settings.google_maps_embed || address) && (
          <FadeIn className="mt-8 md:mt-10">
            <div className="grid lg:grid-cols-[1.35fr_1fr] gap-4 md:gap-5">
              {/* Map */}
              <div className="rounded-[24px] overflow-hidden border border-black/5 bg-[#E8EEF2] min-h-[220px] sm:min-h-[280px] lg:min-h-[340px] relative">
                {settings.google_maps_embed ? (
                  <iframe
                    title="ConstructONS Office"
                    src={settings.google_maps_embed}
                    className="absolute inset-0 w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-[#000F1B]/40 text-sm">
                    Map coming soon
                  </div>
                )}
                {/* Mobile floating pin card */}
                <div className="lg:hidden absolute left-3 right-3 bottom-3 rounded-xl bg-white/95 backdrop-blur-md border border-black/5 p-3 shadow-lg flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#FF5A00] mt-0.5 shrink-0" />
                  <div className="text-xs text-[#000F1B] font-medium leading-snug">
                    {address}
                  </div>
                </div>
              </div>

              {/* Office card */}
              <div className="rounded-[24px] bg-[#000F1B] text-white p-6 md:p-8 flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF8A4C]">
                    Head Office
                  </div>
                  <div className="mt-3 flex items-start gap-2.5 text-white/85 text-sm leading-relaxed">
                    <MapPin className="w-5 h-5 mt-0.5 text-[#FF5A00] shrink-0" />
                    <span>{address}</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
                  <a
                    href={`tel:${phone}`}
                    className="rounded-xl bg-white/10 hover:bg-white/15 transition px-4 py-3 border border-white/5"
                  >
                    <div className="text-[10px] uppercase tracking-widest text-white/50">
                      Call
                    </div>
                    <div className="text-sm font-semibold mt-0.5">{phone}</div>
                  </a>
                  <a
                    href={`mailto:${email}`}
                    className="rounded-xl bg-white/10 hover:bg-white/15 transition px-4 py-3 border border-white/5"
                  >
                    <div className="text-[10px] uppercase tracking-widest text-white/50">
                      Email
                    </div>
                    <div className="text-sm font-semibold mt-0.5 break-all">
                      {email}
                    </div>
                  </a>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="sm:col-span-2 lg:col-span-1 rounded-xl bg-[#25D366] hover:bg-[#1ebe57] transition px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-white/80">
                        WhatsApp
                      </div>
                      <div className="text-sm font-semibold mt-0.5">
                        Chat instantly
                      </div>
                    </div>
                    <MessageCircle className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>
        )}
      </div>

      {/* Phone mock CSS (your structure, ConstructONS theme) */}
      <style>{`
        .phoneContainer {
          width: 168px;
          height: 320px;
          background-color: #0a0a0a;
          border-radius: 28px;
          position: relative;
          box-shadow:
            0 20px 50px rgba(0, 15, 27, 0.35),
            inset 0 0 0 2px #222;
        }
        .screen {
          width: calc(100% - 8px);
          height: calc(100% - 8px);
          background: linear-gradient(
            165deg,
            #FF5A00 0%,
            #FF2D00 18%,
            #0B1E30 42%,
            #000F1B 70%,
            #062a1a 100%
          );
          border-radius: 24px;
          position: absolute;
          top: 4px;
          left: 4px;
          box-sizing: border-box;
          overflow: hidden;
        }
        .camera {
          width: 72px;
          background-color: #0a0a0a;
          position: absolute;
          height: 18px;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          border-radius: 20px;
          z-index: 5;
          animation: callTransition 2.2s ease infinite alternate;
        }
        .camera::before {
          content: "";
          width: 10px;
          height: 10px;
          background-color: #1a1a2e;
          position: absolute;
          border-radius: 50%;
          left: 8px;
          top: 4px;
          box-shadow: inset 0 0 0 2px #0a0a0a;
        }
        .camera::after {
          content: "";
          width: 5px;
          height: 5px;
          background-color: #22c55e;
          position: absolute;
          border-radius: 50%;
          right: 10px;
          top: 6.5px;
          box-shadow: 0 0 6px #22c55e;
        }
        @keyframes callTransition {
          0% { width: 56px; }
          100% { width: 88px; }
        }
        @media (min-width: 640px) {
          .phoneContainer {
            width: 180px;
            height: 340px;
          }
        }
      `}</style>
    </section>
  );
}

function ContactItem({ icon: Icon, label, value, href, testId }) {
  return (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noreferrer" : undefined}
      className="flex items-center gap-3 group rounded-xl p-2 -m-2 hover:bg-[#F7F7F7] transition"
      data-testid={testId}
    >
      <div className="w-11 h-11 rounded-full bg-[#FF5A00]/10 grid place-items-center group-hover:bg-[#FF5A00] group-hover:text-white text-[#FF5A00] transition-colors shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-[#000F1B]/45 uppercase tracking-widest font-semibold">
          {label}
        </div>
        <div className="text-sm font-semibold text-[#000F1B] truncate">
          {value}
        </div>
      </div>
    </a>
  );
}
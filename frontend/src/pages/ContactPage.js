"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  ExternalLink,
  Building2,
  Navigation,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";

import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import BrandLockup from "@/components/site/BrandLockup";
import { publicApi } from "@/lib/api";

// Claymorphic shadow style for social links
const customSocialCardStyle = {
  background: "rgb(223, 225, 235)",
  borderRadius: "32px",
  boxShadow:
    "rgba(0, 0, 0, 0.17) 0px -15px 20px 0px inset, rgba(0, 0, 0, 0.15) 0px -25px 25px 0px inset, rgba(0, 0, 0, 0.1) 0px -50px 30px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px",
};

export default function ContactPage() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    publicApi.getSiteSettings().then(setSettings).catch(() => setSettings(null));
  }, []);

  // Settings & Fallbacks
  const phone = settings?.phone || "+91 98765 43210";
  const whatsapp = settings?.whatsapp || phone;
  const email = settings?.email || "hello@constructons.in";
  const address =
    settings?.address ||
    "12th Floor, Prestige Tower, MG Road, Bengaluru, Karnataka 560001";

  // Google Maps Embed URL
  const mapEmbed =
    settings?.google_maps_embed ||
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.989269527717!2d77.607000!3d12.971600!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzE3LjgiTiA3N8KwMzYnMjUuMiJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin";

  const waNumber = String(whatsapp).replace(/\D/g, "");
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    "Hi ConstructONS, I'd like a consultation for my construction project."
  )}`;
  const waQr = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&data=${encodeURIComponent(
    waLink
  )}`;

  // Social Links with Brand Colors
  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      url: settings?.social_instagram || "https://instagram.com",
      brandBg: "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600",
      textColor: "text-[#E4405F]",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: settings?.social_linkedin || "https://linkedin.com",
      brandBg: "bg-[#0A66C2]",
      textColor: "text-[#0A66C2]",
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: settings?.social_facebook || "https://facebook.com",
      brandBg: "bg-[#1877F2]",
      textColor: "text-[#1877F2]",
    },
    {
      name: "Twitter / X",
      icon: Twitter,
      url: settings?.social_twitter || "https://twitter.com",
      brandBg: "bg-black",
      textColor: "text-black",
    },
    {
      name: "YouTube",
      icon: Youtube,
      url: settings?.social_youtube || "https://youtube.com",
      brandBg: "bg-[#FF0000]",
      textColor: "text-[#FF0000]",
    },
  ];

  return (
    <div className="bg-white font-['Poppins',sans-serif] selection:bg-[#FF5A00] selection:text-white min-h-screen">
      <Header />

      <main className="pt-0">
        
        {/* ================= HERO SECTION ================= */}
        <section
          className="relative pt-28 md:pt-36 pb-16 md:pb-24 bg-cover bg-center bg-no-repeat overflow-hidden border-b border-black/10"
          style={{ backgroundImage: "url('/images/contact/contacthero.webp')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#000F1B]/90 via-[#000F1B]/80 to-[#000F1B]/95 backdrop-blur-[2px]" />

          <div className="container-wide relative z-10">
            <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl shadow-xl"
              >
                <BrandLockup tone="dark" size="md" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight"
              >
                Let&rsquo;s Connect &amp; Build <br className="hidden sm:inline" />
                <span className="text-[#FF5A00]">Your Dream Space</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-4 text-white/75 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl"
              >
                Reach out directly via phone, WhatsApp, or email. Visit our headquarters or scan the QR code to chat directly with our engineering team.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 flex flex-wrap items-center justify-center gap-2.5 text-xs font-semibold text-white/90"
              >
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/15 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Free Consultation</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/15 shadow-sm">
                  <Building2 className="w-3.5 h-3.5 text-[#FF5A00]" />
                  <span>Bengaluru HQ</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ================= SKEWED BRUTALIST CONTACT CARDS (BALANCED SPACING) ================= */}
        <section className="py-16 md:py-24 bg-white overflow-hidden">
          <div className="container-wide">
            
            {/* Calculated Distance Grid for 3 Cards */}
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 max-w-6xl mx-auto py-4">
              
              {/* Card 1: Phone */}
              <a
                href={`tel:${phone}`}
                className="relative rounded-lg -skew-x-6 -translate-y-2 hover:-translate-y-1 hover:-translate-x-0 hover:skew-x-0 duration-500 w-72 h-44 p-2 bg-neutral-900 transition-all [box-shadow:12px_12px_0px_#000F1B] hover:[box-shadow:4px_4px_0px_#000F1B] block group border border-white/10"
              >
                <figure className="w-full h-full relative overflow-hidden rounded-lg">
                  <img
                    src="https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&w=600&q=80"
                    alt="Call ConstructONS"
                    className="w-full h-full object-cover rounded-lg brightness-50 group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FF5A00] text-white grid place-items-center shadow-md">
                    <Phone className="w-4 h-4" />
                  </div>
                </figure>
                <div className="absolute text-neutral-50 bottom-4 left-0 px-5 z-10">
                  <span className="font-bold text-base block tracking-wide text-white">Call Us Directly</span>
                  <p className="text-xs text-white/80 line-clamp-2 mt-0.5 font-mono">
                    {phone} • Mon - Sat 9am to 7pm
                  </p>
                </div>
              </a>

              {/* Card 2: WhatsApp */}
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="relative rounded-lg -skew-x-6 -translate-y-2 hover:-translate-y-1 hover:-translate-x-0 hover:skew-x-0 duration-500 w-72 h-44 p-2 bg-neutral-900 transition-all [box-shadow:12px_12px_0px_#10B981] hover:[box-shadow:4px_4px_0px_#10B981] block group border border-white/10"
              >
                <figure className="w-full h-full relative overflow-hidden rounded-lg">
                  <img
                    src="https://images.unsplash.com/photo-1611746872915-64382b5c76da?auto=format&fit=crop&w=600&q=80"
                    alt="WhatsApp Consultation"
                    className="w-full h-full object-cover rounded-lg brightness-50 group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-emerald-500 text-white grid place-items-center shadow-md">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                </figure>
                <div className="absolute text-neutral-50 bottom-4 left-0 px-5 z-10">
                  <span className="font-bold text-base block tracking-wide text-white">WhatsApp Chat</span>
                  <p className="text-xs text-white/80 line-clamp-2 mt-0.5">
                    Send plot dimensions & get instant cost estimation.
                  </p>
                </div>
              </a>

              {/* Card 3: Email */}
              <a
                href={`mailto:${email}`}
                className="relative rounded-lg -skew-x-6 -translate-y-2 hover:-translate-y-1 hover:-translate-x-0 hover:skew-x-0 duration-500 w-72 h-44 p-2 bg-neutral-900 transition-all [box-shadow:12px_12px_0px_#FF5A00] hover:[box-shadow:4px_4px_0px_#FF5A00] block group border border-white/10"
              >
                <figure className="w-full h-full relative overflow-hidden rounded-lg">
                  <img
                    src="https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&w=600&q=80"
                    alt="Email ConstructONS"
                    className="w-full h-full object-cover rounded-lg brightness-50 group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FF5A00] text-white grid place-items-center shadow-md">
                    <Mail className="w-4 h-4" />
                  </div>
                </figure>
                <div className="absolute text-neutral-50 bottom-4 left-0 px-5 z-10">
                  <span className="font-bold text-base block tracking-wide text-white">Email Proposals</span>
                  <p className="text-xs text-white/80 line-clamp-2 mt-0.5 font-mono">
                    {email}
                  </p>
                </div>
              </a>

            </div>

            {/* Scan WhatsApp Banner */}
            <div className="mt-12 rounded-3xl border border-black/10 bg-slate-900/[0.02] backdrop-blur-md p-5 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white p-2 rounded-2xl border border-black/10 shadow-md shrink-0">
                  <img
                    src={waQr}
                    alt="WhatsApp QR Code"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-500/10 px-3 py-1 rounded-full inline-block mb-2">
                    Quick Connect
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#000F1B]">
                    Scan QR code to start a WhatsApp chat
                  </h3>
                  <p className="text-xs text-[#000F1B]/60 max-w-md mt-1 leading-relaxed">
                    Point your camera at the screen to start chatting instantly without saving contact details.
                  </p>
                </div>
              </div>

              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3.5 shadow-lg shadow-emerald-600/20 transition-all shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open WhatsApp</span>
              </a>
            </div>

          </div>
        </section>

        {/* ================= SOCIAL LINKS SECTION WITH BRAND COLORS ================= */}
        <section className="py-14 bg-slate-50 border-t border-black/5">
          <div className="container-wide">
            <div className="text-center max-w-xl mx-auto mb-10">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#FF5A00] mb-1">
                Social Channels
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#000F1B] tracking-tight">
                Follow ConstructONS Online
              </h2>
              <p className="text-xs text-[#000F1B]/60 mt-1">
                Stay updated with our ongoing site construction photos, design trends, and architectural updates.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    style={customSocialCardStyle}
                    className="w-[145px] h-[175px] p-4 flex flex-col justify-center items-center text-center transition-all hover:-translate-y-2 duration-300 group"
                  >
                    {/* Icon container with brand color badge */}
                    <div
                      className={`w-12 h-12 rounded-2xl ${social.brandBg} text-white grid place-items-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    
                    <span className={`text-xs font-black ${social.textColor}`}>
                      {social.name}
                    </span>
                    
                    <span className="text-[10px] font-semibold text-[#000F1B]/50 mt-1 flex items-center gap-1 group-hover:text-[#000F1B] transition-colors">
                      <span>Follow</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= GOOGLE MAP IFRAME SECTION ================= */}
        <section className="py-12 md:py-20 bg-[#F7F7F7] border-t border-black/5">
          <div className="container-wide">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-[#FF5A00] mb-2">
                  Head Office &amp; Studio
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-[#000F1B] tracking-tight">
                  Visit Us in Person
                </h2>
              </div>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF5A00] hover:underline"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Directions</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-black/10 shadow-md bg-slate-200 min-h-[380px] lg:min-h-[480px]">
              <iframe
                title="ConstructONS Office Location Map"
                src={mapEmbed}
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />

              <div className="absolute left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md bottom-6 rounded-2xl bg-white/90 backdrop-blur-md border border-white/50 p-5 shadow-2xl">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FF5A00] text-white grid place-items-center shrink-0 shadow-md">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#FF5A00]">
                      Headquarters
                    </div>
                    <div className="text-sm font-bold text-[#000F1B] leading-snug mt-0.5">
                      {address}
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-[#000F1B]/60 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#FF5A00]" />
                      <span>Mon &ndash; Sat · 9:00 AM &ndash; 7:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
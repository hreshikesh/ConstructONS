import React from "react";
import { Phone, MessageCircle, Mail, ArrowRight, MapPin } from "lucide-react";
import { FadeIn, SectionLabel } from "@/components/site/Primitives";
import { useLeadModal } from "@/components/site/LeadModalProvider";

export default function ContactCTA({ settings }) {
  const { open } = useLeadModal();
  if (!settings) settings = {};
  return (
    <section id="contact" data-testid="contact-section" className="py-24 md:py-32 bg-white">
      <div className="container-wide">
        <div className="grid lg:grid-cols-[minmax(280px,340px)_1fr] gap-10 items-end mb-10">
          <FadeIn>
            <SectionLabel number={10} eyebrow="Get In Touch" />
            <h2 className="mt-4 text-brand-navy font-bold">Let&rsquo;s Build Your<br /> Dream Home Together</h2>
            <p className="mt-4 text-brand-navy/60 max-w-md leading-relaxed">
              Talk to our team — free, no obligation. We&rsquo;ll help you pick the right home and package.
            </p>
          </FadeIn>
        </div>

        <div className="rounded-3xl bg-brand-bg p-2 md:p-3">
          <div className="rounded-2xl bg-white p-6 md:p-8 grid md:grid-cols-4 gap-5 items-center">
            <ContactItem icon={Phone} label="Call Us" value={settings.phone} href={`tel:${settings.phone}`} testId="contact-call" />
            <ContactItem icon={MessageCircle} label="WhatsApp" value={settings.whatsapp} href={`https://wa.me/${(settings.whatsapp || "").replace(/\D/g, "")}`} testId="contact-whatsapp" />
            <ContactItem icon={Mail} label="Email Us" value={settings.email} href={`mailto:${settings.email}`} testId="contact-email" />
            <div className="text-right md:text-right">
              <button
                onClick={() => open({ source: "contact" })}
                data-testid="contact-cta"
                className="btn-primary w-full md:w-auto"
              >
                Get Free Consultation
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="text-[11px] text-brand-navy/50 mt-2">It&rsquo;s Free & No Obligation</div>
            </div>
          </div>
        </div>

        {settings.google_maps_embed && (
          <FadeIn className="mt-8">
            <div className="grid md:grid-cols-[1.2fr_1fr] gap-4">
              <div className="rounded-3xl overflow-hidden border border-black/5 aspect-[16/9] bg-brand-bg">
                <iframe
                  title="ConstructONS Office"
                  src={settings.google_maps_embed}
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="rounded-3xl bg-brand-navy text-white p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className="section-eyebrow text-brand-orangeLight">Head Office</div>
                  <div className="mt-3 flex items-start gap-2 text-white/85">
                    <MapPin className="w-5 h-5 mt-0.5 text-brand-orange" />
                    <div>{settings.address}</div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <a href={`tel:${settings.phone}`} className="rounded-xl bg-white/10 hover:bg-white/15 transition px-4 py-3">
                    <div className="text-[10px] uppercase tracking-widest text-white/60">Call</div>
                    <div className="text-sm font-semibold">{settings.phone}</div>
                  </a>
                  <a href={`mailto:${settings.email}`} className="rounded-xl bg-white/10 hover:bg-white/15 transition px-4 py-3">
                    <div className="text-[10px] uppercase tracking-widest text-white/60">Email</div>
                    <div className="text-sm font-semibold">{settings.email}</div>
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}

function ContactItem({ icon: Icon, label, value, href, testId }) {
  return (
    <a href={href} className="flex items-center gap-3 group" data-testid={testId}>
      <div className="w-11 h-11 rounded-full bg-brand-orange/10 grid place-items-center group-hover:bg-brand-orange group-hover:text-white text-brand-orange transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-[10px] text-brand-navy/50 uppercase tracking-widest">{label}</div>
        <div className="text-sm font-semibold text-brand-navy">{value}</div>
      </div>
    </a>
  );
}

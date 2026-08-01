import React, { useEffect, useState } from "react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import ContactCTA from "@/components/site/ContactCTA";
import { publicApi } from "@/lib/api";

export default function ContactPage() {
  const [settings, setSettings] = useState(null);
  useEffect(() => { publicApi.getSiteSettings().then(setSettings); }, []);
  return (
    <>
      <Header />
      <main className="pt-28">
        <div className="container-wide">
          <div className="section-eyebrow">Contact</div>
          <h1 className="mt-2 text-brand-navy font-bold">Let&rsquo;s talk about your dream home</h1>
          <p className="mt-3 text-brand-navy/60 max-w-2xl">Our consultants are online and ready to help. Free, no obligation.</p>
        </div>
        <ContactCTA settings={settings} />
      </main>
      <Footer settings={settings} />
    </>
  );
}

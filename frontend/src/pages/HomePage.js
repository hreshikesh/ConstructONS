import React, { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Hero from "@/components/site/Hero";
import HomeCollection from "@/components/site/HomeCollection";
import Packages from "@/components/site/Packages";
import AIPlatform from "@/components/site/AIPlatform";
import Marketplace from "@/components/site/Marketplace";
import FinancialServices from "@/components/site/FinancialServices";
import WhyConstructONS from "@/components/site/WhyConstructONS";
import CustomerJourney from "@/components/site/CustomerJourney";
import Testimonials from "@/components/site/Testimonials";
import ContactCTA from "@/components/site/ContactCTA";
import FloatingActions from "@/components/site/FloatingActions";

export default function HomePage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    publicApi.bootstrap().then(setData).catch((e) => setError(e.message || "Error"));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center text-red-500">Failed to load: {error}</div>
    );
  }
  if (!data) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-orange border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main>
        <Hero hero={data.hero} />
        <HomeCollection homes={data.homes} />
        <Packages packages={data.packages} />
        <AIPlatform modules={data.ai_modules} />
        <Marketplace items={data.marketplace} />
        <FinancialServices items={data.financial_services} />
        <WhyConstructONS rows={data.comparison} stats={data.stats} />
        <CustomerJourney steps={data.journey} />
        <Testimonials items={data.testimonials} />
        <ContactCTA settings={data.site_settings} />
      </main>
      <Footer settings={data.site_settings} />
      <FloatingActions phone={data.site_settings?.phone} whatsapp={data.site_settings?.whatsapp} />
    </>
  );
}

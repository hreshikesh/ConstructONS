import React, { useCallback, useEffect, useState } from "react";
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
import { RefreshCw, AlertTriangle } from "lucide-react";

export default function HomePage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  const load = useCallback(() => {
    setError(null);
    setRetrying(true);
    publicApi
      .bootstrap()
      .then((d) => {
        setData(d);
        setRetrying(false);
      })
      .catch((e) => {
        setError(e?.message || "Network Error");
        setRetrying(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const hardReload = () => {
    // Bypass browser cache — helps users stuck on a stale JS bundle from an
    // earlier deploy that references a dead backend URL.
    try {
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
    } catch (_) {
      /* best-effort */
    }
    // Cache-bust reload
    const url = new URL(window.location.href);
    url.searchParams.set("_r", Date.now().toString());
    window.location.replace(url.toString());
  };

  if (error) {
    return (
      <div className="min-h-screen bg-brand-bg grid place-items-center px-6" data-testid="bootstrap-error">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto w-14 h-14 rounded-full grid place-items-center bg-red-50 text-red-500 mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h1 className="text-brand-navy font-bold text-xl">We couldn't reach our servers</h1>
          <p className="mt-2 text-sm text-brand-navy/60">
            This is usually a stale cache from a previous version. Try again — if it keeps happening, do a hard refresh
            (<kbd className="px-1.5 py-0.5 rounded bg-black/5 text-xs">⌘⇧R</kbd> on Mac, <kbd className="px-1.5 py-0.5 rounded bg-black/5 text-xs">Ctrl+Shift+R</kbd> on Windows).
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={load}
              disabled={retrying}
              data-testid="bootstrap-retry"
              className="btn-primary text-sm py-2.5 px-5"
            >
              <RefreshCw className={`w-4 h-4 ${retrying ? "animate-spin" : ""}`} /> Try again
            </button>
            <button
              onClick={hardReload}
              data-testid="bootstrap-hard-reload"
              className="btn-ghost text-sm py-2.5 px-5"
            >
              Clear cache & reload
            </button>
          </div>
          <div className="mt-6 text-[10px] uppercase tracking-widest text-brand-navy/40">
            Error: {error}
          </div>
        </div>
      </div>
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

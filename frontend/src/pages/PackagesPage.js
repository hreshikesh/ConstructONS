import React, { useEffect, useState } from "react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Packages from "@/components/site/Packages";
import { publicApi } from "@/lib/api";

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    publicApi.getPackages().then(setPackages);
    publicApi.getSiteSettings().then(setSettings);
  }, []);

  return (
    <>
      <Header />
      <main className="pt-24">
        <div className="container-wide pt-8 pb-4">
          <div className="section-eyebrow">Packages</div>
          <h1 className="mt-2 text-brand-navy font-bold">Choose your build package</h1>
          <p className="text-brand-navy/60 mt-3 max-w-2xl">Transparent ₹/Sq.ft pricing with everything included. Upgrade at any time.</p>
        </div>
        <Packages packages={packages} />
      </main>
      <Footer settings={settings} />
    </>
  );
}

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
     
       
        <Packages packages={packages} />

      <Footer settings={settings} />
    </>
  );
}

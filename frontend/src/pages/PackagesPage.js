import React, { useEffect, useState } from "react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Packages from "@/components/site/Packages";
import { publicApi } from "@/lib/api";
import SEO from "@/components/site/SEO";

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    publicApi.getPackages().then(setPackages);
    publicApi.getSiteSettings().then(setSettings);
  }, []);

  // Combined Schema: Breadcrumb + FAQ Schema (Powerful for pricing searches)
  const packagesSchema = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://constructons.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Packages",
          item: "https://constructons.com/packages",
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is the house construction cost per sq ft in Bangalore?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "House construction cost in Bangalore starts from ₹1,499 per sq ft for essential packages, going up to ₹2,299+ per sq ft for premium luxury specifications.",
          },
        },
        {
          "@type": "Question",
          name: "How much does it cost to build a 2000 sq ft house in Bangalore?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Building a 2000 sq ft house in Bangalore costs between ₹30 Lakhs to ₹45 Lakhs depending on the chosen package, materials, and custom specifications.",
          },
        },
        {
          "@type": "Question",
          name: "Are there any hidden costs in ConstructONS construction packages?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No, all ConstructONS packages offer 100% transparent itemized agreements with zero hidden costs and price lock guarantees.",
          },
        },
      ],
    },
  ];

  return (
    <>
      <SEO
        title="House Construction Packages & Cost per Sq Ft in Bangalore"
        description="Explore house construction packages in Bangalore starting from ₹1,499/sq ft. Compare basic, premium, and luxury specs with 100% transparent pricing and zero hidden costs."
        canonical="/packages"
        keywords="house construction cost Bangalore, construction cost per sq ft Bangalore, 2000 sq ft house construction cost, home construction packages, turnkey construction rates Bangalore"
        image="/og-packages.jpg" /* Put og-packages.jpg in public/ folder */
        structuredData={packagesSchema}
      />

      <Header />
      <main>
        <Packages packages={packages} />
      </main>
      <Footer settings={settings} />
    </>
  );
}
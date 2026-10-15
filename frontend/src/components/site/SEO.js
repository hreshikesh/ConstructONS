import React from "react";
import { Helmet } from "react-helmet-async";

const SITE_URL = "https://constructons.com";
const DEFAULT_TITLE = "ConstructONS | AI-Powered Home Construction Platform in India";
const DEFAULT_DESC =
  "ConstructONS is India's leading AI-powered home construction platform. Get transparent pricing from ₹1,499/sqft, real-time live site tracking, and 3D design tools.";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

export default function SEO({
  title,
  description,
  canonical,       // e.g. "/contact" or "/packages"
  image,
  type = "website",
  noindex = false,
  keywords = "",
  structuredData,
  children,
}) {
  const fullTitle = title ? `${title} | ConstructONS` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESC;
  const ogImage = image || DEFAULT_IMAGE;

  // ✅ FIX 1: Build canonical from prop OR current browser URL
  // ✅ FIX 2: Never render canonical on noindex pages
  let canonicalUrl = null;
  if (!noindex) {
    if (canonical) {
      canonicalUrl = `${SITE_URL}${canonical.startsWith("/") ? canonical : `/${canonical}`}`;
    } else if (typeof window !== "undefined") {
      // Auto-detect from current URL if no canonical prop passed
      canonicalUrl = `${SITE_URL}${window.location.pathname}`;
    }
  }

  return (
    <Helmet>
      {/* Primary Meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Robots: noindex for admin/portal, index for public */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
      )}

      {/* ✅ Canonical: only on indexable pages, never on noindex */}
      {!noindex && canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="ConstructONS" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {canonicalUrl && <meta name="twitter:url" content={canonicalUrl} />}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {children}
    </Helmet>
  );
}

export const constructionBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: "ConstructONS",
  url: "https://constructons.com",
  logo: "https://constructons.com/logo.webp",
  image: "https://constructons.com/og-image.png",
  description: DEFAULT_DESC,
  priceRange: "₹1,499/sqft - ₹3,500/sqft",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bengaluru",
    addressRegion: "Karnataka",
    postalCode: "560092",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 13.063165220577533,
    longitude: 77.59103013329107,
  },
  areaServed: [
    { "@type": "City", name: "Bengaluru" },
    { "@type": "City", name: "Hyderabad" },
    { "@type": "City", name: "Pune" },
    { "@type": "City", name: "Chennai" },
    { "@type": "City", name: "Mumbai" },
  ],
};
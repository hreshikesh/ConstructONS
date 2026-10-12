import React from "react";
import { Helmet } from "react-helmet-async";

const SITE_URL = "https://constructons.com";
const DEFAULT_TITLE = "ConstructONS | Home Construction Company in Bangalore";
const DEFAULT_DESC =
  "ConstructONS is a leading home construction company in Bangalore offering turnkey house construction from ₹1,499/sqft. AI live site tracking & zero hidden costs.";
const DEFAULT_IMAGE = `${SITE_URL}/icon.svg`;

export default function SEO({
  title,
  description,
  canonical = "",
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
  const canonicalUrl = canonical
    ? `${SITE_URL}${canonical.startsWith("/") ? canonical : `/${canonical}`}`
    : SITE_URL;

  return (
    <Helmet>
      {/* Primary Meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large" />
      )}

      {/* Open Graph / Facebook / WhatsApp Preview */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="ConstructONS" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {children}
    </Helmet>
  );
}

// Local Construction Business Schema for Home & Local Pages
export const constructionBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ConstructionBusiness",
  name: "ConstructONS",
  url: "https://constructons.com",
  logo: "https://constructons.com/icon.svg",
  image: "https://constructons.com/icon.svg",
  description: DEFAULT_DESC,
  priceRange: "₹₹",
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
    longitude:  77.59103013329107,
  },
  areaServed: [
    { "@type": "City", name: "Bengaluru" },
    { "@type": "City", name: "Hyderabad" },
    { "@type": "City", name: "Pune" },
    { "@type": "City", name: "Chennai" },
    { "@type": "City", name: "Mumbai" }
  ]
};
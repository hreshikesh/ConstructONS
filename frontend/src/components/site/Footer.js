import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Youtube, MessageSquare } from "lucide-react";
import BrandLockup from "@/components/site/BrandLockup";

const COLUMNS = [
  {
    title: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Careers", to: "/about#careers" },
      { label: "Blog", to: "/blog" },
      { label: "Media", to: "/about#media" },
      { label: "Contact Us", to: "/contact" },
    ],
  },
  {
    title: "Packages",
    links: [
      { label: "Basic Package", to: "/packages/basic" },
      { label: "Essential Package", to: "/packages/essential" },
      { label: "Standard Package", to: "/packages/standard" },
      { label: "Premium Package", to: "/packages/premium" },
    ],
  },
  {
    title: "AI Platform",
    links: [
      { label: "AI Workspace", to: "/#ai-platform" },
      { label: "Project Management", to: "/#ai-platform" },
      { label: "Site Management", to: "/#ai-platform" },
      { label: "Documents", to: "/#ai-platform" },
      { label: "Finance", to: "/#ai-platform" },
      { label: "CRM", to: "/#ai-platform" },
      { label: "Enterprise", to: "/#ai-platform" },
    ],
  },
  {
    title: "Marketplace",
    links: [
      { label: "Materials", to: "/marketplace/materials" },
      { label: "Equipment", to: "/marketplace/equipment" },
      { label: "Contractors", to: "/marketplace/contractors" },
      { label: "Architects", to: "/marketplace/architects" },
      { label: "Engineers", to: "/marketplace/engineers" },
      { label: "Interiors", to: "/marketplace/interior" },
      { label: "Smart Home", to: "/marketplace/smart-home" },
      { label: "Landscaping", to: "/marketplace/landscaping" },
    ],
  },
  {
    title: "Financial Services",
    links: [
      { label: "PayLater", to: "/#financial" },
      { label: "Loans", to: "/#financial" },
      { label: "Insurance", to: "/#financial" },
      { label: "Payment Gateway", to: "/#financial" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", to: "/contact" },
      { label: "FAQ", to: "/#faq" },
      { label: "Terms & Conditions", to: "/about#terms" },
      { label: "Privacy Policy", to: "/about#privacy" },
    ],
  },
];

// Icon map for keys stored in site_settings.social_links
const SOCIAL_ICON_MAP = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  reddit: MessageSquare,
  // optional aliases admins might type
  fb: Facebook,
  ig: Instagram,
  li: Linkedin,
  yt: Youtube,
};

function normalizeSocialLinks(raw) {
  // Accept object { facebook: "https://...", reddit: "..." }
  // or array [{ platform, url }] / [{ key, link }]
  if (!raw) return {};
  if (Array.isArray(raw)) {
    const out = {};
    raw.forEach((item) => {
      if (!item || typeof item !== "object") return;
      const key = String(item.platform || item.key || item.name || "").toLowerCase().trim();
      const url = String(item.url || item.link || item.href || "").trim();
      if (key && url) out[key] = url;
    });
    return out;
  }
  if (typeof raw === "object") {
    const out = {};
    Object.entries(raw).forEach(([k, v]) => {
      const key = String(k || "").toLowerCase().trim();
      const url = String(v || "").trim();
      if (key && url) out[key] = url;
    });
    return out;
  }
  return {};
}

export default function Footer({ settings }) {
  const s = settings || {};
  // ★ Social links ONLY from backend site settings
  const socialLinks = normalizeSocialLinks(s.social_links);

  // Stable display order when present
  const preferredOrder = ["facebook", "instagram", "linkedin", "youtube", "reddit"];
  const socialEntries = [
    ...preferredOrder
      .filter((k) => socialLinks[k])
      .map((k) => [k, socialLinks[k]]),
    ...Object.entries(socialLinks).filter(([k]) => !preferredOrder.includes(k)),
  ];

  return (
    <footer className="bg-brand-navy text-white" data-testid="site-footer">
      <div className="container-wide py-16">
        <div className="grid lg:grid-cols-[1.3fr_repeat(6,minmax(0,1fr))] gap-8">
          <div>
            <BrandLockup tone="dark" size="md" />
            <p className="mt-4 text-white/60 text-sm max-w-xs">
              India&rsquo;s most intelligent construction platform for premium home owners.
            </p>

            {socialEntries.length > 0 && (
              <div className="mt-6 flex items-center gap-2 flex-wrap">
                {socialEntries.map(([key, href]) => {
                  const Icon = SOCIAL_ICON_MAP[key] || MessageSquare;
                  const title = key.charAt(0).toUpperCase() + key.slice(1);
                  return (
                    <SocialLink key={key} href={href} icon={Icon} title={title} />
                  );
                })}
              </div>
            )}
          </div>

          {COLUMNS.map((c) => (
            <div key={c.title}>
              <div className="text-[10px] uppercase tracking-widest text-white/50 mb-4">{c.title}</div>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-white/85 hover:text-brand-orange transition">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <div>© {new Date().getFullYear()} ConstructONS. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>{s.footer_note || "Made with love in India"}</span>
            <span className="text-white/25">·</span>
            <Link
              to="/admin/login"
              data-testid="footer-admin-link"
              className="text-white/50 hover:text-brand-orange transition"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon: Icon, title }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={title}
      className="w-9 h-9 rounded-full grid place-items-center bg-white/5 transition hover:bg-brand-orange cursor-pointer"
    >
      <Icon className="w-4 h-4" />
    </a>
  );
}
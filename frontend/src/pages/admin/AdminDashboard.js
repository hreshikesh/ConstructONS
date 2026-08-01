import React, { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Link } from "react-router-dom";
import { Home, Package, Star, Newspaper, Inbox, ArrowRight } from "lucide-react";

const QUICK = [
  { label: "Homes", icon: Home, path: "homes" },
  { label: "Packages", icon: Package, path: "packages" },
  { label: "Testimonials", icon: Star, path: "testimonials" },
  { label: "Blogs", icon: Newspaper, path: "blogs" },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState({});
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    (async () => {
      const [homes, packages, blogs, testimonials, leadsList] = await Promise.all([
        adminApi.list("homes"), adminApi.list("packages"), adminApi.list("blogs"), adminApi.list("testimonials"), adminApi.listLeads(),
      ]);
      setCounts({ homes: homes.length, packages: packages.length, blogs: blogs.length, testimonials: testimonials.length, leads: leadsList.length });
      setLeads(leadsList.slice(0, 5));
    })();
  }, []);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div>
          <div className="section-eyebrow">Overview</div>
          <h1 className="mt-2 text-brand-navy font-bold">Dashboard</h1>
        </div>
        <Link to="/" className="text-sm text-brand-navy/60 hover:text-brand-orange">View public site →</Link>
      </div>

      <div className="mt-6 grid md:grid-cols-5 gap-4">
        {[
          { label: "Homes", value: counts.homes, path: "homes", icon: Home },
          { label: "Packages", value: counts.packages, path: "packages", icon: Package },
          { label: "Blogs", value: counts.blogs, path: "blogs", icon: Newspaper },
          { label: "Testimonials", value: counts.testimonials, path: "testimonials", icon: Star },
          { label: "Leads", value: counts.leads, path: "leads", icon: Inbox },
        ].map((s) => (
          <Link to={`/admin/${s.path}`} key={s.label} className="rounded-2xl bg-white border border-black/5 shadow-soft p-4 hover:shadow-premium transition">
            <s.icon className="w-5 h-5 text-brand-orange" />
            <div className="mt-2 text-2xl font-bold text-brand-navy">{s.value ?? "–"}</div>
            <div className="text-xs text-brand-navy/60">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-white border border-black/5 shadow-soft">
        <div className="p-4 flex items-center justify-between border-b border-black/5">
          <div className="font-semibold text-brand-navy">Recent leads</div>
          <Link to="/admin/leads" className="text-sm text-brand-orange inline-flex items-center gap-1">All leads <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="divide-y divide-black/5">
          {leads.length === 0 && <div className="p-6 text-sm text-brand-navy/60">No leads yet.</div>}
          {leads.map((l) => (
            <div key={l.id} className="p-4 flex items-center justify-between text-sm">
              <div>
                <div className="font-semibold text-brand-navy">{l.name} <span className="text-brand-navy/50">· {l.phone}</span></div>
                <div className="text-xs text-brand-navy/60">{l.message || l.interested_home || l.interested_package || "General enquiry"}</div>
              </div>
              <div className="text-xs text-brand-navy/50">{new Date(l.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

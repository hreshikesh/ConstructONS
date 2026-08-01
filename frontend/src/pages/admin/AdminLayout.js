import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { adminApi } from "@/lib/api";
import LogoMark from "@/components/site/LogoMark";
import BrandLockup from "@/components/site/BrandLockup";
import { Home, Package, MessageSquare, HelpCircle, Newspaper, ShoppingBag, Landmark, Users, Sparkles, Route, ImageIcon, LayoutDashboard, Settings, LogOut, Star, Inbox, GitCompareArrows, BarChart3 } from "lucide-react";

const NAV = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Leads Inbox", to: "/admin/leads", icon: Inbox },
  { label: "Homes", to: "/admin/homes", icon: Home },
  { label: "Packages", to: "/admin/packages", icon: Package },
  { label: "AI Modules", to: "/admin/ai-modules", icon: Sparkles },
  { label: "Marketplace", to: "/admin/marketplace-categories", icon: ShoppingBag },
  { label: "Financial Services", to: "/admin/financial-services", icon: Landmark },
  { label: "Testimonials", to: "/admin/testimonials", icon: Star },
  { label: "FAQs", to: "/admin/faqs", icon: HelpCircle },
  { label: "Blogs", to: "/admin/blogs", icon: Newspaper },
  { label: "Team", to: "/admin/team", icon: Users },
  { label: "Journey Steps", to: "/admin/journey-steps", icon: Route },
  { label: "Hero Sections", to: "/admin/hero-sections", icon: ImageIcon },
  { label: "Comparison", to: "/admin/comparison", icon: GitCompareArrows },
  { label: "Stats", to: "/admin/stats", icon: BarChart3 },
  { label: "Media", to: "/admin/media", icon: ImageIcon },
  { label: "Site Settings", to: "/admin/site-settings", icon: Settings },
];

export default function AdminLayout() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("cons_admin_token");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    adminApi.me().then(setMe).catch(() => {
      localStorage.removeItem("cons_admin_token");
      navigate("/admin/login");
    }).finally(() => setLoading(false));
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("cons_admin_token");
    navigate("/admin/login");
  };

  if (loading) return <div className="min-h-screen grid place-items-center"><div className="w-8 h-8 rounded-full border-2 border-brand-orange border-t-transparent animate-spin" /></div>;
  if (!me) return null;

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <aside className="w-64 shrink-0 bg-brand-navy text-white flex flex-col fixed inset-y-0 left-0 overflow-y-auto">
        <div className="p-5">
          <BrandLockup tone="dark" size="sm" />
          <div className="mt-2 text-[9px] tracking-widest uppercase text-white/40">Admin CMS</div>
        </div>
        <nav className="flex-1 px-3 pb-4 space-y-0.5">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                  isActive ? "bg-brand-orange text-white" : "text-white/75 hover:bg-white/5"
                }`
              }
            >
              <n.icon className="w-4 h-4" />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2 text-xs text-white/60">Signed in as</div>
          <div className="px-3 pb-2 text-sm font-medium truncate">{me.email || me.sub}</div>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/5">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-64">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { adminApi } from "@/lib/api";
import LogoMark from "@/components/site/LogoMark";
import BrandLockup from "@/components/site/BrandLockup";
import {
  Home, Package, HelpCircle, Newspaper, ShoppingBag, Landmark, Users, Sparkles,
  Route, ImageIcon, LayoutDashboard, Settings, LogOut, Star, Inbox, GitCompareArrows,
  BarChart3, ClipboardList, Menu, X
} from "lucide-react";

const NAV = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Leads Inbox", to: "/admin/leads", icon: Inbox },
  { label: "Quiz Submissions", to: "/admin/quiz-submissions", icon: ClipboardList },
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

const CURRENT_LABEL = (path) => {
  const found = NAV.find((n) => (n.end ? path === n.to : path.startsWith(n.to)));
  return found?.label || "Admin";
};

export default function AdminLayout() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  // Close drawer on navigation
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  // Lock body scroll while drawer is open on mobile
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const logout = () => {
    localStorage.removeItem("cons_admin_token");
    navigate("/admin/login");
  };

  if (loading)
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-orange border-t-transparent animate-spin" />
      </div>
    );
  if (!me) return null;

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-black/5 shadow-soft">
        <div className="flex items-center justify-between px-3 py-2.5">
          <button
            onClick={() => setDrawerOpen(true)}
            data-testid="admin-mobile-menu-btn"
            aria-label="Open menu"
            className="w-10 h-10 rounded-full grid place-items-center border border-black/10 bg-white"
          >
            <Menu className="w-5 h-5 text-brand-navy" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <LogoMark className="w-6 h-6" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-brand-navy/50 leading-none">Admin</div>
              <div className="font-bold text-brand-navy text-sm truncate">{CURRENT_LABEL(location.pathname)}</div>
            </div>
          </div>
          <button
            onClick={logout}
            aria-label="Logout"
            className="w-10 h-10 rounded-full grid place-items-center border border-black/10 bg-white"
          >
            <LogOut className="w-4 h-4 text-brand-navy" />
          </button>
        </div>
      </div>

      {/* Sidebar — desktop fixed, mobile drawer */}
      <aside
        data-testid="admin-sidebar"
        className={`fixed inset-y-0 left-0 w-64 bg-brand-navy text-white flex flex-col overflow-y-auto z-50 transition-transform duration-300 ease-out
          ${drawerOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="p-5 flex items-center justify-between">
          <BrandLockup tone="dark" size="sm" />
          <button
            onClick={() => setDrawerOpen(false)}
            className="lg:hidden w-8 h-8 rounded-full grid place-items-center bg-white/10 hover:bg-white/15"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 pb-2 text-[9px] tracking-widest uppercase text-white/40">Admin CMS</div>
        <nav className="flex-1 px-3 pb-4 space-y-0.5">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition ${
                  isActive ? "bg-brand-orange text-white" : "text-white/75 hover:bg-white/5"
                }`
              }
            >
              <n.icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2 text-xs text-white/60">Signed in as</div>
          <div className="px-3 pb-2 text-sm font-medium truncate">{me.email || me.sub}</div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/5"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu overlay"
            className="lg:hidden fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="lg:ml-64 pt-[58px] lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

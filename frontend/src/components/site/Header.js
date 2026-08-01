import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { useLeadModal } from "@/components/site/LeadModalProvider";
import LogoMark from "@/components/site/LogoMark";

const NAV = [
  { label: "Home", to: "/", hash: "#top" },
  { label: "Home Collection", to: "/#home-collection" },
  { label: "Packages", to: "/#packages" },
  { label: "AI Platform", to: "/#ai-platform" },
  { label: "Marketplace", to: "/#marketplace" },
  { label: "Financial Services", to: "/#financial" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { open: openLead } = useLeadModal();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="container-wide">
        <div
          className={`flex items-center justify-between rounded-full px-4 md:px-5 transition-all ${
            scrolled
              ? "bg-white/85 backdrop-blur-xl border border-black/5 shadow-soft py-2"
              : "bg-white/60 backdrop-blur-md border border-white/50 py-2"
          }`}
        >
          <Link to="/" className="flex items-center gap-2 shrink-0" data-testid="header-logo">
            <LogoMark className="w-8 h-8 text-brand-orange" />
            <div className="leading-tight">
              <div className="font-bold text-brand-navy text-lg tracking-tight">ConstructONS</div>
              <div className="text-[9px] tracking-[0.2em] uppercase text-brand-navy/50 -mt-0.5">Everything Construction. Always On.</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((n) => (
              <NavItem key={n.label} to={n.to} label={n.label} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openLead({ source: "header" })}
              data-testid="header-cta"
              className="hidden md:inline-flex btn-primary text-sm py-2.5 px-5"
            >
              Get Free Consultation
            </button>
            <button
              onClick={() => setOpen((s) => !s)}
              className="lg:hidden w-10 h-10 rounded-full grid place-items-center border border-black/10 bg-white"
              aria-label="Menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="lg:hidden mt-2 bg-white rounded-2xl shadow-premium border border-black/5 overflow-hidden"
            >
              <div className="flex flex-col p-2">
                {NAV.map((n) => (
                  <MobileNavItem key={n.label} to={n.to} label={n.label} onClick={() => setOpen(false)} />
                ))}
                <button
                  onClick={() => { setOpen(false); openLead({ source: "header" }); }}
                  className="btn-primary w-full mt-2 text-sm"
                >
                  Get Free Consultation
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

function NavItem({ to, label }) {
  const isHash = to.includes("#");
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (e) => {
    if (isHash && to.startsWith("/#")) {
      e.preventDefault();
      const id = to.split("#")[1];
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      className="px-3 py-2 text-sm font-medium text-brand-navy/80 hover:text-brand-orange transition-colors rounded-full hover:bg-brand-navy/5"
    >
      {label}
    </a>
  );
}

function MobileNavItem({ to, label, onClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const handle = (e) => {
    e.preventDefault();
    onClick && onClick();
    if (to.startsWith("/#")) {
      const id = to.split("#")[1];
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 150);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(to);
    }
  };
  return (
    <a href={to} onClick={handle} className="px-4 py-3 text-brand-navy/80 hover:bg-brand-navy/5 rounded-xl flex items-center justify-between">
      {label}
      <ChevronDown className="w-4 h-4 -rotate-90 opacity-40" />
    </a>
  );
}

/**
 * PortalHome — Customer portal main surface.
 *
 * Sprint A: Shell with auth + a placeholder chat panel.
 * Sprints B/C will add streaming chat, tool calls, quote linkage, and the
 * project milestone tracker.
 *
 * REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
 */
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Loader2, LogOut, Sparkles, MessageSquare, Home, Building2, ClipboardList } from "lucide-react";
import { toast, Toaster } from "sonner";

const API_BASE = process.env.REACT_APP_BACKEND_URL + "/api";

export default function PortalHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. If we just landed from Google Auth with #session_id=... — exchange it once.
  useEffect(() => {
    const hash = location.hash || "";
    if (hash.includes("session_id=")) {
      const sessionId = new URLSearchParams(hash.replace(/^#/, "")).get("session_id");
      if (sessionId) {
        (async () => {
          try {
            const res = await axios.post(
              `${API_BASE}/customer/auth/session`,
              { session_id: sessionId },
              { withCredentials: true },
            );
            setUser(res.data);
            // strip the hash cleanly
            window.history.replaceState(null, "", "/portal");
          } catch (e) {
            toast.error("Sign-in failed. Please try again.");
            navigate("/portal/login", { replace: true });
          } finally {
            setLoading(false);
          }
        })();
        return;
      }
    }
    // 2. Normal path: check existing session
    axios.get(`${API_BASE}/customer/me`, { withCredentials: true })
      .then((r) => setUser(r.data))
      .catch(() => navigate("/portal/login", { replace: true }))
      .finally(() => setLoading(false));
  }, [location.hash, navigate]);

  const logout = async () => {
    try {
      await axios.post(`${API_BASE}/customer/logout`, {}, { withCredentials: true });
    } catch {}
    navigate("/portal/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-brand-bg">
        <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-brand-bg" data-testid="portal-home">
      <Toaster richColors position="top-right" />
      {/* Top bar */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-orange grid place-items-center text-white font-bold">C</div>
            <div>
              <div className="font-bold text-brand-navy leading-none">ConstructONS</div>
              <div className="text-[10px] uppercase tracking-widest text-brand-navy/50">Customer Portal</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user.picture && (
              <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-black/10" />
            )}
            <div className="hidden sm:block text-sm text-brand-navy leading-tight">
              <div className="font-semibold">{user.name}</div>
              <div className="text-xs text-brand-navy/50">{user.email}</div>
            </div>
            <button
              onClick={logout}
              data-testid="portal-logout"
              className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-brand-navy hover:bg-brand-bg"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-6xl mx-auto px-5 md:px-8 py-8">
        <div className="section-eyebrow">Welcome</div>
        <h1 className="mt-1 text-2xl md:text-3xl font-bold text-brand-navy">
          Hi {user.name?.split(" ")[0] || "there"}, ready to build your home?
        </h1>
        <p className="mt-2 text-sm text-brand-navy/60 max-w-xl">
          Chat with our AI concierge, explore our 4 signature packages, generate a personalised quote and track every stage of your project.
        </p>

        {/* Feature stubs — Sprint B/C wire real functionality */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureCard
            icon={MessageSquare}
            title="AI Concierge Chat"
            desc="Ask about packages, materials, floor plans, timelines \u2014 anything."
            cta="Coming next"
            testId="portal-feature-chat"
          />
          <FeatureCard
            icon={Home}
            title="Compare Packages"
            desc="See Basic, Essential, Standard and Premium side-by-side."
            cta="Explore packages"
            onClick={() => window.open("/packages/compare", "_blank")}
            testId="portal-feature-packages"
          />
          <FeatureCard
            icon={Building2}
            title="Project Tracker"
            desc="Follow every milestone from design to handover with photos and docs."
            cta="Coming after booking"
            testId="portal-feature-project"
          />
        </div>

        {/* Placeholder chat window */}
        <div className="mt-10 rounded-3xl bg-white border border-black/5 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-black/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-orange/15 grid place-items-center text-brand-orange">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-brand-navy leading-tight">AI Concierge (preview)</div>
              <div className="text-xs text-brand-navy/50">Streaming chat, package cards, quote generation and image gen ship in the next update.</div>
            </div>
          </div>
          <div className="h-80 grid place-items-center text-center px-6">
            <div>
              <div className="section-eyebrow">Sprint B</div>
              <div className="mt-2 font-semibold text-brand-navy">The chat lands next.</div>
              <p className="text-sm text-brand-navy/60 mt-1 max-w-md">
                Your account, session and profile are all set up. In the next sprint you'll be able to chat with our concierge, get recommendations, and generate a quote in a single conversation.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, cta, onClick, testId }) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      data-testid={testId}
      className="text-left rounded-2xl bg-white border border-black/5 shadow-soft p-5 hover:border-brand-orange transition disabled:opacity-90 disabled:cursor-not-allowed"
    >
      <div className="w-9 h-9 rounded-lg bg-brand-orange/10 grid place-items-center text-brand-orange">
        <Icon className="w-4 h-4" />
      </div>
      <div className="mt-3 font-bold text-brand-navy">{title}</div>
      <p className="mt-1 text-xs text-brand-navy/60">{desc}</p>
      <div className="mt-3 text-xs font-semibold text-brand-orange">{cta} →</div>
    </button>
  );
}

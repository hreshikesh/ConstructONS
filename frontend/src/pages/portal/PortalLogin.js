/**
 * PortalLogin — Customer portal login page.
 *
 * REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Building2, Home, MessageSquare, Shield } from "lucide-react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_BACKEND_URL + "/api";

export default function PortalLogin() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // If already logged in, jump straight to /portal
    axios.get(`${API_BASE}/customer/me`, { withCredentials: true })
      .then(() => navigate("/portal", { replace: true }))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [navigate]);

  const signInWithGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/portal";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-brand-bg">
        <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg grid md:grid-cols-2" data-testid="portal-login">
      {/* Left hero */}
      <div className="hidden md:flex bg-brand-navy text-white flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-brand-orange" />
        <div>
          <div className="section-eyebrow text-brand-orangeLight">Customer Portal</div>
          <h1 className="mt-3 text-4xl font-bold leading-tight">Everything about your home build,<br/>in one conversation.</h1>
          <p className="mt-4 text-white/70 max-w-md">
            Chat with our AI concierge to compare packages, get personalised quotes, upload references,
            and follow your project from design to handover.
          </p>
        </div>
        <div className="space-y-3 max-w-md">
          {[
            [Home, "Compare all 4 packages side-by-side, right in chat."],
            [MessageSquare, "Ask anything — material choices, floor plans, budget tweaks."],
            [Building2, "Track every construction milestone with photos & documents."],
            [Shield, "Secure Google sign-in — no passwords to remember."],
          ].map(([Icon, text], i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 grid place-items-center shrink-0">
                <Icon className="w-4 h-4 text-brand-orangeLight" />
              </div>
              <div className="text-sm text-white/80 pt-1">{text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right sign-in card */}
      <div className="grid place-items-center p-6">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-soft border border-black/5 p-8">
          <div className="section-eyebrow">ConstructONS</div>
          <h2 className="mt-1 text-2xl font-bold text-brand-navy">Sign in to your portal</h2>
          <p className="mt-2 text-sm text-brand-navy/60">
            Continue with Google. New here? An account is created automatically.
          </p>

          <button
            onClick={signInWithGoogle}
            data-testid="portal-google-signin"
            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-brand-navy hover:bg-brand-bg transition"
          >
            <GoogleG /> Continue with Google
          </button>

          <div className="mt-6 text-[11px] text-brand-navy/50 leading-relaxed">
            By signing in you agree to our terms and privacy policy. Your Google email is used only to identify you — nothing is posted to your account.
          </div>

          <div className="mt-6 pt-6 border-t border-black/5 text-xs text-brand-navy/60">
            Are you an admin? <a href="/admin/login" className="text-brand-orange font-semibold hover:underline">Admin login</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 5.1 29.3 3 24 3 15.7 3 8.6 7.5 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.6-5.3l-6.3-5.3c-2 1.4-4.6 2.3-7.3 2.3-5.3 0-9.7-3.4-11.3-8l-6.5 5C8.5 40.4 15.7 45 24 45z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.3 5.3C40 34.9 45 30 45 24c0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Loader2, 
  ArrowLeft, 
  Smartphone, 
  FileText, 
  Clock, 
  ShieldCheck 
} from "lucide-react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_BACKEND_URL + "/api";

export default function PortalLogin() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE}/customer/me`, { withCredentials: true })
      .then(() => navigate("/portal", { replace: true }))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [navigate]);

  const signInWithGoogle = () => {
    const redirectUrl = window.location.origin + "/portal";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(
      redirectUrl
    )}`;
  };

  if (checking) {
    return (
      <div 
        className="min-h-screen grid place-items-center bg-[#F2F2F2]" 
        role="status" 
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5A00]" />
          <span className="text-sm font-medium text-[#111111]/70 font-['Poppins']">
            Checking session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-[#F2F2F2] flex flex-col md:grid md:grid-cols-2 font-['Poppins'] relative selection:bg-[#FF5A00]/20 selection:text-[#000F1B]"
      data-testid="portal-login"
    >
      {/* 📱 Mobile Top App Bar (UX: Gives mobile users an immediate exit back to homepage) */}
      <header className="md:hidden bg-[#000F1B] border-b border-white/10 px-4 py-3 flex items-center justify-between z-10">
        <Link
          to="/"
          aria-label="Back to ConstructONS Home"
          className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium transition-colors py-2 px-3 -ml-2 rounded-lg active:bg-white/10 min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="w-4 h-4 text-[#FF5A00]" aria-hidden="true" />
          <span>Home</span>
        </Link>
        <span className="text-white font-bold text-base tracking-tight">
          Construct<span className="text-[#FF5A00]">ONS™</span>
        </span>
      </header>

      {/* 💻 Left Hero Column: Brand Ecosystem Showcase (Desktop Only) */}
      <div className="hidden md:flex bg-[#000F1B] text-white flex-col justify-between p-10 lg:p-14 xl:p-16 relative overflow-hidden">
        {/* Top Accent Stripe */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#FF5A00]" />

        {/* Top: Desktop "Back to Home" Button */}
        <div>
          <Link
            to="/"
            aria-label="Back to ConstructONS Home"
            className="inline-flex items-center gap-2.5 text-white/80 hover:text-white text-sm font-medium transition-all py-2 px-3.5 -ml-3 rounded-xl hover:bg-white/10 min-h-[44px] group focus:outline-none focus:ring-2 focus:ring-[#FF5A00]"
          >
            <ArrowLeft className="w-4 h-4 text-[#FF5A00] transition-transform duration-200 group-hover:-translate-x-1" aria-hidden="true" />
            <span>Back to Home</span>
          </Link>

          {/* Heading & Positioning */}
          <div className="mt-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF5A00]/10 border border-[#FF5A00]/20 rounded-full text-xs font-semibold text-[#FF5A00] tracking-wider uppercase">
              Customer Portal
            </div>
            <h1 className="mt-4 text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-white">
              Everything Construction. <br />
              <span className="text-[#FF5A00]">Always On.</span>
            </h1>
            <p className="mt-3.5 text-white/70 text-sm lg:text-base leading-relaxed max-w-md">
              Your trusted partner for every stage of home construction. Access live updates, documents, and quality milestones in real time.
            </p>
          </div>
        </div>

        {/* Feature List (Directly from Welcome Guide Technology Pillars) */}
        <div className="space-y-4 max-w-md my-8">
          {[
            {
              Icon: Smartphone,
              title: "Live Site Updates",
              desc: "Daily milestone progress with verified site photos.",
            },
            {
              Icon: FileText,
              title: "Digital Documents & Legal",
              desc: "Architectural drawings, agreements, and approvals stored securely.",
            },
            {
              Icon: Clock,
              title: "Project Timeline & Payments",
              desc: "Transparent milestone tracking with stage-linked payment schedules.",
            },
            {
              Icon: ShieldCheck,
              title: "100+ Quality Checks",
              desc: "Dedicated site engineers conducting standardized quality inspections.",
            },
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 grid place-items-center shrink-0 mt-0.5">
                <item.Icon className="w-4 h-4 text-[#FF5A00]" strokeWidth={2} aria-hidden="true" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{item.title}</div>
                <div className="text-xs text-white/60 leading-relaxed mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Brand Marker */}
        <div className="text-xs text-white/40 border-t border-white/10 pt-4">
          India's First Integrated Construction Ecosystem
        </div>
      </div>

      {/* 🔐 Right Sign-In Card */}
      <div className="flex-1 grid place-items-center p-6 sm:p-10 lg:p-12">
        <main className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-black/5 p-8 sm:p-10">
          <div className="text-xs font-semibold text-[#FF5A00] tracking-wider uppercase">
            ConstructONS™
          </div>
          <h2 className="mt-2 text-2xl font-bold text-[#000F1B] tracking-tight">
            Sign in to your portal
          </h2>
          <p className="mt-2 text-sm text-[#111111]/70 leading-relaxed">
            Sign in with your Google account to access your live home construction project.
          </p>

          {/* Google Sign-in Button */}
          <button
            type="button"
            onClick={signInWithGoogle}
            data-testid="portal-google-signin"
            className="mt-8 w-full inline-flex items-center justify-center gap-3 rounded-xl border border-[#A6A6A6]/40 bg-white px-5 py-3.5 text-sm font-semibold text-[#000F1B] hover:bg-[#F2F2F2] hover:border-[#111111]/30 active:scale-[0.99] transition duration-200 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[#FF5A00] focus:ring-offset-2"
          >
            <GoogleG />
            <span>Continue with Google</span>
          </button>

          {/* Security & Privacy Notice */}
          <div className="mt-6 text-[12px] text-[#111111]/60 leading-relaxed bg-[#F2F2F2] p-3.5 rounded-xl border border-black/5">
            By signing in, you access ConstructONS™ secure project management. Your Google account is used only for verified authentication.
          </div>

          {/* Admin & Staff Fallback */}
          <div className="mt-8 pt-6 border-t border-black/5 flex items-center justify-between text-xs text-[#111111]/70">
            <span>Admin or Site Engineer?</span>
            <Link
              to="/admin/login"
              className="text-[#FF5A00] font-semibold hover:underline focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded px-1 py-0.5"
            >
              Staff Login &rarr;
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

function GoogleG() {
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 48 48" 
      aria-hidden="true" 
      className="shrink-0"
    >
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 5.1 29.3 3 24 3 15.7 3 8.6 7.5 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 45c5.2 0 10-2 13.6-5.3l-6.3-5.3c-2 1.4-4.6 2.3-7.3 2.3-5.3 0-9.7-3.4-11.3-8l-6.5 5C8.5 40.4 15.7 45 24 45z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.3 5.3C40 34.9 45 30 45 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import LogoMark from "@/components/site/LogoMark";
import BrandLockup from "@/components/site/BrandLockup";
import { Loader2, Lock, User } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@constructons.in");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminApi.login(email, password);
      localStorage.setItem("cons_admin_token", res.token);
      toast.success("Welcome back!");
      navigate("/admin");
    } catch (err) {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-brand-bg p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-3xl shadow-premium border border-black/5 p-8">
        <div className="flex items-center">
          <BrandLockup tone="light" size="md" />
        </div>
        <h1 className="mt-8 text-2xl font-bold text-brand-navy">Sign in</h1>
        <p className="text-sm text-brand-navy/60">Enter your credentials to access the CMS.</p>

        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2.5">
            <User className="w-4 h-4 text-brand-navy/50" />
            <input
              data-testid="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              placeholder="Email"
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2.5">
            <Lock className="w-4 h-4 text-brand-navy/50" />
            <input
              data-testid="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <button data-testid="admin-login-submit" type="submit" disabled={loading} className="btn-primary w-full mt-6">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <div className="mt-4 text-xs text-brand-navy/60 text-center">
          Default: admin@constructons.in / admin123 <span className="opacity-60">(dev)</span>
        </div>
      </form>
    </div>
  );
}

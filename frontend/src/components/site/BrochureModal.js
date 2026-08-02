import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, User, Phone, Mail, MapPin, ShieldCheck, Loader2, CheckCircle2, FileText } from "lucide-react";
import { publicApi } from "@/lib/api";
import { toast } from "sonner";

export default function BrochureModal({ isOpen, onClose, slug, packageName }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null); // { quoteRef, filename }

  React.useEffect(() => {
    if (isOpen) { setDone(null); }
  }, [isOpen]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("Please enter your name and phone number.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await publicApi.personalizedBrochure(slug, {
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        city: form.city || undefined,
      });
      // Trigger download
      const url = window.URL.createObjectURL(res.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename || `ConstructONS-${slug}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setDone({ quoteRef: res.quoteRef, filename: res.filename });
      toast.success("Your personalised brochure is ready!");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            data-testid="brochure-modal"
            initial={{ scale: 0.96, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 10, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-premium overflow-hidden"
          >
            <div className="relative p-6 pb-4 bg-gradient-to-br from-brand-navy to-brand-navySoft text-white">
              <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center transition" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-orangeLight" />
                <div className="section-eyebrow text-brand-orangeLight">Personalise Your Brochure</div>
              </div>
              <h3 className="mt-2 text-2xl font-bold">Get the {packageName || "Package"} brochure — tailored for you</h3>
              <p className="text-white/70 text-sm mt-1">
                We’ll add your name & a unique quote reference to the PDF cover so it feels like it was made just for you.
              </p>
            </div>

            {!done ? (
              <form onSubmit={submit} className="p-6 space-y-3">
                <Field icon={User} placeholder="Full name*" value={form.name} onChange={(v) => setForm({ ...form, name: v })} testId="brochure-name" />
                <Field icon={Phone} placeholder="Phone number*" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} testId="brochure-phone" />
                <Field icon={Mail} type="email" placeholder="Email (optional)" value={form.email} onChange={(v) => setForm({ ...form, email: v })} testId="brochure-email" />
                <Field icon={MapPin} placeholder="City (optional)" value={form.city} onChange={(v) => setForm({ ...form, city: v })} testId="brochure-city" />
                <button type="submit" disabled={submitting} data-testid="brochure-submit" className="btn-primary w-full mt-2 disabled:opacity-70">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {submitting ? "Preparing your brochure…" : "Download Personalised Brochure"}
                </button>
                <p className="text-[11px] text-brand-navy/50 text-center pt-1 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Your details are safe. No spam — ever.
                </p>
              </form>
            ) : (
              <div className="p-6">
                <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white grid place-items-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-emerald-800">Downloaded successfully</div>
                    <div className="text-xs text-emerald-700">Your quote reference: <b>{done.quoteRef || "—"}</b></div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-brand-navy/70 leading-relaxed">
                  Our team will reach out to you within a few working hours to discuss your dream home.
                  If you don’t see the download, <a href="#" onClick={(e) => { e.preventDefault(); setDone(null); }} className="text-brand-orange font-semibold">try again</a>.
                </p>
                <button onClick={onClose} className="btn-ghost w-full mt-5">Close</button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ icon: Icon, placeholder, value, onChange, type = "text", testId }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2.5 focus-within:border-brand-orange transition">
      <Icon className="w-4 h-4 text-brand-navy/50" />
      <input
        data-testid={testId}
        type={type}
        className="flex-1 bg-transparent outline-none text-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

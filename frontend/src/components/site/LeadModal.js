import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, User, Mail, MapPin, MessageSquare, ShieldCheck, Loader2 } from "lucide-react";
import { publicApi } from "@/lib/api";
import { toast } from "sonner";

export default function LeadModal({ isOpen, onClose, context = {} }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("Please enter your name and phone number.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await publicApi.submitLead({
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        city: form.city || undefined,
        message: form.message || undefined,
        interested_home: context.home || undefined,
        interested_package: context.package || undefined,
        source: context.source || "consultation",
        quiz_submission_id: context.quiz_submission_id || undefined,
      });
      toast.success(res.message || "Thanks! Our team will call you shortly.");
      setForm({ name: "", phone: "", email: "", city: "", message: "" });
      onClose();
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            data-testid="lead-modal"
            initial={{ scale: 0.96, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 10, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-premium overflow-hidden"
          >
            <div className="relative p-6 pb-4 bg-gradient-to-br from-brand-navy to-brand-navySoft text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="section-eyebrow text-brand-orangeLight">Get Free Consultation</div>
              <h3 className="mt-2 text-2xl font-bold">Build your dream home with ConstructONS</h3>
              <p className="text-white/70 text-sm mt-1">
                Talk to our AI-powered consultants. It’s free & no obligation.
              </p>
              {(context.home || context.package) && (
                <div className="mt-3 inline-flex items-center gap-2 text-xs bg-white/10 px-3 py-1.5 rounded-full">
                  {context.home && <span>Home: <b>{context.home}</b></span>}
                  {context.package && <span>Package: <b>{context.package}</b></span>}
                </div>
              )}
            </div>
            <form onSubmit={submit} className="p-6 space-y-3">
              <Field icon={User} placeholder="Full name*" value={form.name} onChange={(v) => setForm({ ...form, name: v })} testId="lead-name" />
              <Field icon={Phone} placeholder="Phone number*" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} testId="lead-phone" />
              <Field icon={Mail} placeholder="Email (optional)" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} testId="lead-email" />
              <Field icon={MapPin} placeholder="City (optional)" value={form.city} onChange={(v) => setForm({ ...form, city: v })} testId="lead-city" />
              <Field icon={MessageSquare} placeholder="Message (optional)" value={form.message} onChange={(v) => setForm({ ...form, message: v })} isTextarea testId="lead-message" />

              <button
                type="submit"
                disabled={submitting}
                data-testid="lead-submit"
                className="btn-primary w-full mt-2 disabled:opacity-70"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {submitting ? "Submitting..." : "Request Free Consultation"}
              </button>
              <p className="text-[11px] text-brand-navy/50 text-center pt-1">
                By submitting, you agree to be contacted by ConstructONS. No spam, ever.
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ icon: Icon, placeholder, value, onChange, type = "text", isTextarea, testId }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-black/10 bg-white px-3 py-2.5 focus-within:border-brand-orange transition">
      <Icon className="w-4 h-4 text-brand-navy/50 mt-1" />
      {isTextarea ? (
        <textarea
          data-testid={testId}
          className="flex-1 bg-transparent outline-none text-sm resize-none min-h-[60px]"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          data-testid={testId}
          type={type}
          className="flex-1 bg-transparent outline-none text-sm"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

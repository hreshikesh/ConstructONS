import React, { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function AdminSiteSettings() {
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // site-settings is a singleton doc — the public endpoint is the source of truth.
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/site-settings`)
      .then((r) => r.json())
      .then(setS)
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn("[AdminSiteSettings] failed to load settings", err);
      });
  }, []);

  if (!s) return <div>Loading…</div>;

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateSiteSettings(s);
      toast.success("Saved");
    } catch (e) { toast.error("Failed to save"); }
    setSaving(false);
  };

  const update = (k, v) => setS({ ...s, [k]: v });
  const updateSocial = (k, v) => setS({ ...s, social_links: { ...(s.social_links || {}), [k]: v } });

  return (
    <div>
      <div className="section-eyebrow">CMS</div>
      <h1 className="mt-2 text-brand-navy font-bold">Site Settings</h1>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <Field label="Company name" value={s.company_name} onChange={(v) => update("company_name", v)} />
        <Field label="Tagline" value={s.tagline} onChange={(v) => update("tagline", v)} />
        <Field label="Phone" value={s.phone} onChange={(v) => update("phone", v)} />
        <Field label="WhatsApp" value={s.whatsapp} onChange={(v) => update("whatsapp", v)} />
        <Field label="Email" value={s.email} onChange={(v) => update("email", v)} />
        <Field label="Address" value={s.address} onChange={(v) => update("address", v)} />
        <Field className="md:col-span-2" label="Google Maps Embed URL" value={s.google_maps_embed || ""} onChange={(v) => update("google_maps_embed", v)} />
        <Field label="Footer note" value={s.footer_note} onChange={(v) => update("footer_note", v)} />

        <div className="md:col-span-2 rounded-2xl bg-white border border-black/5 shadow-soft p-4">
          <div className="font-semibold text-brand-navy mb-3">Social Links</div>
          <div className="grid md:grid-cols-2 gap-3">
            {["facebook","instagram","twitter","linkedin","youtube"].map((k) => (
              <Field key={k} label={k[0].toUpperCase()+k.slice(1)} value={s.social_links?.[k] || ""} onChange={(v) => updateSocial(k, v)} />
            ))}
          </div>
        </div>
      </div>
      <button onClick={save} disabled={saving} className="btn-primary mt-6"><Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}</button>
    </div>
  );
}

function Field({ label, value, onChange, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <div className="text-[11px] uppercase tracking-widest text-brand-navy/50 mb-1">{label}</div>
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 outline-none focus:border-brand-orange text-sm" />
    </label>
  );
}

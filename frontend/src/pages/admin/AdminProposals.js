/**
 * AdminProposals — create / edit / list client proposals.
 *
 * Every proposal:
 *   - Pulls scope, exclusions, payment schedule, price/sqft from the linked package
 *   - Auto-calculates Base = area × rate, Subtotal, GST 18%, Grand Total
 *   - Supports discount, custom notes, custom terms
 *   - Downloads a branded 7-page PDF
 *   - "Send via WhatsApp" opens wa.me with a pre-filled message
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi, publicApi, API_BASE } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Save, X, Pencil, RefreshCw, FileDown, Send, Users,
  IndianRupee,
} from "lucide-react";

const rupees = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

const emptyProposal = () => ({
  status: "draft",
  valid_days: 30,
  client_name: "",
  client_phone: "",
  client_email: "",
  client_address: "",
  site_address: "",
  plot_area: "",
  floors: "G+1",
  built_up_area: 1200,
  package_slug: "",
  addons_selected: [],
  discount_amount: 0,
  discount_label: "",
  gst_percent: 18,
  intro_note: "",
  scope_of_work: [],
  exclusions: [],
  payment_schedule: [],
  terms: "",
});

export default function AdminProposals() {
  const [items, setItems] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, pkgs] = await Promise.all([
        adminApi.list("proposals"),
        publicApi.getPackages(),
      ]);
      setItems(list);
      setPackages(pkgs);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[AdminProposals] load failed", e);
      toast.error("Failed to load proposals");
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const selectedPkg = useMemo(
    () => packages.find((p) => p.slug === editing?.package_slug),
    [editing?.package_slug, packages]
  );

  // Live pricing calculation
  const pricing = useMemo(() => {
    const area = Number(editing?.built_up_area || 0);
    const rate = Number(selectedPkg?.price_per_sqft || 0);
    const base = area * rate;
    const addonTotal = (editing?.addons_selected || []).reduce(
      (s, a) => s + Number(a.price || 0), 0
    );
    const subtotal = base + addonTotal;
    const discount = Number(editing?.discount_amount || 0);
    const net = Math.max(0, subtotal - discount);
    const gstPct = Number(editing?.gst_percent ?? 18);
    const gst = net * gstPct / 100;
    const grand = net + gst;
    return { area, rate, base, addonTotal, subtotal, discount, net, gst, gstPct, grand };
  }, [editing, selectedPkg]);

  const startNew = () => {
    const p = emptyProposal();
    if (packages[0]) p.package_slug = packages[0].slug;
    setEditing(p);
  };
  const startEdit = (p) => setEditing({ ...emptyProposal(), ...p });
  const close = () => setEditing(null);

  const setField = (patch) => setEditing((e) => ({ ...e, ...patch }));

  const toggleAddon = (addon) => {
    const list = editing.addons_selected || [];
    const idx = list.findIndex((a) => a.name === addon.name);
    let next;
    if (idx >= 0) {
      next = list.filter((_, i) => i !== idx);
    } else {
      const priceNum = Number(String(addon.price || "").replace(/[^\d.]/g, "")) || 0;
      next = [...list, {
        name: addon.name,
        price: priceNum,
        unit: addon.unit || "",
        description: addon.description || "",
      }];
    }
    setField({ addons_selected: next });
  };

  const save = async () => {
    if (!editing.client_name || !editing.client_phone) {
      toast.error("Client name and phone are required");
      return;
    }
    if (!editing.package_slug) {
      toast.error("Please pick a package");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...editing,
        // ensure numeric coercion
        built_up_area: Number(editing.built_up_area || 0),
        plot_area: editing.plot_area ? Number(editing.plot_area) : null,
        discount_amount: Number(editing.discount_amount || 0),
        gst_percent: Number(editing.gst_percent || 18),
      };
      let saved;
      if (editing.id) {
        saved = await adminApi.update("proposals", editing.id, payload);
      } else {
        saved = await adminApi.create("proposals", payload);
      }
      toast.success(`Proposal ${saved.ref_number || ""} saved`);
      setEditing(saved);
      await load();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[AdminProposals] save failed", e);
      toast.error(e?.response?.data?.detail || "Save failed");
    }
    setSaving(false);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this proposal? This cannot be undone.")) return;
    try {
      await adminApi.remove("proposals", id);
      toast.success("Deleted");
      await load();
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const downloadPdf = async (p) => {
    if (!p?.id) {
      toast.error("Please save the proposal first");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/proposals/${p.id}/pdf`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${p.ref_number || "proposal"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error("PDF download failed");
    }
  };

  const sendWhatsApp = (p) => {
    if (!p?.id) {
      toast.error("Save the proposal first");
      return;
    }
    const rawPhone = (p.client_phone || "").replace(/[^\d+]/g, "");
    // Default to +91 if a 10-digit Indian number is entered without country code
    const phone = rawPhone.startsWith("+")
      ? rawPhone.replace("+", "")
      : (rawPhone.length === 10 ? `91${rawPhone}` : rawPhone);
    if (!phone) {
      toast.error("Client phone missing");
      return;
    }
    const msg = [
      `Hi ${p.client_name || "there"},`,
      "",
      `Here's your ConstructONS home construction proposal (${p.ref_number || ""}).`,
      p.package_name ? `Package: ${p.package_name}` : "",
      `Built-up Area: ${(p.built_up_area || 0).toLocaleString("en-IN")} sq.ft`,
      "",
      "Please find the attached PDF. Reach out to discuss any details.",
      "",
      "Thanks,",
      "ConstructONS Team",
    ].filter(Boolean).join("\n");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("WhatsApp opened. Attach the downloaded PDF to send.");
  };

  return (
    <div data-testid="admin-proposals-root">
      <div className="flex items-baseline justify-between flex-wrap gap-3">
        <div>
          <div className="section-eyebrow">Sales</div>
          <h1 className="mt-2 text-brand-navy font-bold">Client Proposals</h1>
          <p className="text-sm text-brand-navy/60 mt-1">
            Build personalised home-construction proposals with live pricing, branded PDF, and one-tap WhatsApp send.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="btn-ghost text-sm py-2 px-4" data-testid="proposals-refresh">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={startNew} className="btn-primary text-sm py-2 px-5" data-testid="proposals-new">
            <Plus className="w-4 h-4" /> New Proposal
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="mt-6 grid gap-3">
        {loading ? (
          <div className="text-sm text-brand-navy/60">Loading proposals…</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl bg-white border border-black/5 shadow-soft p-8 text-center">
            <Users className="w-8 h-8 text-brand-navy/30 mx-auto mb-2" />
            <div className="text-brand-navy font-semibold">No proposals yet</div>
            <div className="text-sm text-brand-navy/60 mt-1">Click "New Proposal" to prepare your first customised quote.</div>
          </div>
        ) : (
          items.map((p) => (
            <div
              key={p.id}
              data-testid={`proposal-row-${p.id}`}
              className="rounded-2xl bg-white border border-black/5 shadow-soft p-4 flex flex-col md:flex-row md:items-center gap-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-brand-orange font-bold">{p.ref_number || "DRAFT"}</span>
                  <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                    p.status === "accepted" ? "bg-emerald-500/10 text-emerald-600"
                      : p.status === "sent" ? "bg-blue-500/10 text-blue-600"
                        : "bg-black/5 text-brand-navy/60"
                  }`}>{p.status}</span>
                </div>
                <div className="mt-1 font-semibold text-brand-navy">{p.client_name}</div>
                <div className="text-xs text-brand-navy/60">
                  {p.package_name || p.package_slug} · {Number(p.built_up_area || 0).toLocaleString("en-IN")} sq.ft · {p.client_phone}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(p)} className="btn-primary text-xs py-1.5 px-3" data-testid={`proposal-edit-${p.id}`}>
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => downloadPdf(p)} className="btn-ghost text-xs py-1.5 px-3" title="Download PDF">
                  <FileDown className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => sendWhatsApp(p)} className="btn-ghost text-xs py-1.5 px-3 text-emerald-600" title="Send via WhatsApp">
                  <Send className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => remove(p.id)} className="btn-ghost text-xs py-1.5 px-3 text-red-500 hover:bg-red-50" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DRAWER */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            data-testid="proposal-drawer"
          >
            <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm" onClick={close} />
            <motion.div
              initial={{ x: 700 }} animate={{ x: 0 }} exit={{ x: 700 }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="absolute top-0 right-0 h-full w-full max-w-3xl bg-white shadow-premium flex flex-col"
            >
              <div className="p-5 border-b border-black/5 flex items-center justify-between shrink-0">
                <div>
                  <div className="section-eyebrow">{editing.id ? `${editing.ref_number || "Edit"}` : "New Proposal"}</div>
                  <div className="font-semibold text-brand-navy">{editing.client_name || "Untitled proposal"}</div>
                </div>
                <button onClick={close} className="w-9 h-9 rounded-full grid place-items-center hover:bg-brand-navy/5"><X className="w-4 h-4" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Client details */}
                <Section title="Client">
                  <Two>
                    <Field label="Full name *"><Input value={editing.client_name} onChange={(v) => setField({ client_name: v })} testId="p-client-name" /></Field>
                    <Field label="Phone *"><Input value={editing.client_phone} onChange={(v) => setField({ client_phone: v })} placeholder="+91 98xxxxxxxx" testId="p-client-phone" /></Field>
                    <Field label="Email"><Input value={editing.client_email} onChange={(v) => setField({ client_email: v })} /></Field>
                    <Field label="Address"><Input value={editing.client_address} onChange={(v) => setField({ client_address: v })} /></Field>
                  </Two>
                </Section>

                {/* Site */}
                <Section title="Site & Project">
                  <Two>
                    <Field label="Site address"><Input value={editing.site_address} onChange={(v) => setField({ site_address: v })} /></Field>
                    <Field label="Plot area (sq.ft)"><Input type="number" value={editing.plot_area} onChange={(v) => setField({ plot_area: v })} /></Field>
                    <Field label="Floors"><Input value={editing.floors} onChange={(v) => setField({ floors: v })} placeholder="G+1" /></Field>
                    <Field label="Built-up area (sq.ft) *"><Input type="number" value={editing.built_up_area} onChange={(v) => setField({ built_up_area: v })} testId="p-area" /></Field>
                    <Field label="Expected start"><Input value={editing.expected_start} onChange={(v) => setField({ expected_start: v })} placeholder="e.g. Jan 2027" /></Field>
                    <Field label="Expected completion"><Input value={editing.expected_completion} onChange={(v) => setField({ expected_completion: v })} placeholder="e.g. Dec 2027" /></Field>
                  </Two>
                </Section>

                {/* Package */}
                <Section title="Package">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {packages.map((p) => {
                      const active = editing.package_slug === p.slug;
                      return (
                        <button
                          key={p.slug}
                          type="button"
                          onClick={() => setField({ package_slug: p.slug, addons_selected: [] })}
                          data-testid={`p-pick-${p.slug}`}
                          className={`rounded-xl border p-3 text-left transition ${active ? "border-brand-orange bg-brand-orange/5 shadow-soft" : "border-black/10 hover:border-brand-orange/50"}`}
                        >
                          <div className="text-[10px] uppercase tracking-widest text-brand-navy/50">{p.tier}</div>
                          <div className="text-sm font-semibold text-brand-navy mt-0.5">{p.name}</div>
                          <div className="text-xs text-brand-orange font-bold mt-1">₹{p.price_per_sqft}/sq.ft</div>
                        </button>
                      );
                    })}
                  </div>
                </Section>

                {/* Add-ons */}
                {selectedPkg?.addons?.length > 0 && (
                  <Section title="Add-ons">
                    <div className="grid md:grid-cols-2 gap-2">
                      {selectedPkg.addons.map((a) => {
                        const active = editing.addons_selected?.some((x) => x.name === a.name);
                        return (
                          <button
                            key={a.name}
                            type="button"
                            onClick={() => toggleAddon(a)}
                            className={`rounded-xl border p-3 text-left text-sm transition ${active ? "border-brand-orange bg-brand-orange/5" : "border-black/10 hover:border-brand-orange/50"}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-brand-navy">{a.name}</span>
                              <span className="text-brand-orange font-bold">{a.price}</span>
                            </div>
                            {a.description && <div className="text-xs text-brand-navy/60 mt-1 line-clamp-2">{a.description}</div>}
                          </button>
                        );
                      })}
                    </div>
                  </Section>
                )}

                {/* Pricing */}
                <Section title="Pricing summary">
                  <div className="rounded-2xl bg-brand-bg p-4 space-y-1.5 text-sm">
                    <Row label={`${pricing.area.toLocaleString("en-IN")} sq.ft × ${rupees(pricing.rate)}`} value={rupees(pricing.base)} />
                    {editing.addons_selected?.length > 0 && (
                      <Row label={`Add-ons (${editing.addons_selected.length})`} value={rupees(pricing.addonTotal)} />
                    )}
                    <Row label="Subtotal" value={rupees(pricing.subtotal)} bold />
                    <div className="grid grid-cols-[1fr_auto_120px] items-center gap-2">
                      <input
                        value={editing.discount_label || ""}
                        onChange={(e) => setField({ discount_label: e.target.value })}
                        placeholder="Discount label (e.g. Diwali offer)"
                        className="rounded-lg border border-black/10 bg-white px-2 py-1.5 outline-none focus:border-brand-orange text-xs"
                      />
                      <span className="text-brand-navy/60 text-xs">− ₹</span>
                      <input
                        type="number"
                        value={editing.discount_amount || 0}
                        onChange={(e) => setField({ discount_amount: Number(e.target.value || 0) })}
                        className="rounded-lg border border-black/10 bg-white px-2 py-1.5 outline-none focus:border-brand-orange text-xs text-right"
                      />
                    </div>
                    <Row label={`GST @ ${pricing.gstPct}%`} value={rupees(pricing.gst)} />
                    <div className="mt-2 pt-2 border-t border-black/10">
                      <Row label="Grand Total" value={rupees(pricing.grand)} big />
                    </div>
                  </div>
                </Section>

                {/* Notes / Terms */}
                <Section title="Personal note (optional)">
                  <textarea
                    rows={3}
                    value={editing.intro_note || ""}
                    onChange={(e) => setField({ intro_note: e.target.value })}
                    placeholder="Dear Mr Ramesh, thank you for choosing ConstructONS..."
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 outline-none focus:border-brand-orange text-sm resize-y"
                  />
                </Section>
                <Section title="Custom terms (leave empty for defaults)">
                  <textarea
                    rows={4}
                    value={editing.terms || ""}
                    onChange={(e) => setField({ terms: e.target.value })}
                    placeholder="Leave blank to use the standard 7-point terms."
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 outline-none focus:border-brand-orange text-sm resize-y"
                  />
                </Section>

                <Section title="Status">
                  <select
                    value={editing.status}
                    onChange={(e) => setField({ status: e.target.value })}
                    className="rounded-xl border border-black/10 bg-white px-3 py-2 outline-none focus:border-brand-orange text-sm"
                    data-testid="p-status"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </Section>
              </div>

              <div className="p-4 border-t border-black/5 flex items-center justify-between shrink-0 bg-white">
                <div className="text-[11px] text-brand-navy/50 flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" /> Grand total <b className="ml-1 text-brand-navy">{rupees(pricing.grand)}</b>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={close} className="btn-ghost text-sm py-2 px-4">Cancel</button>
                  <button onClick={() => downloadPdf(editing)} disabled={!editing.id} className="btn-ghost text-sm py-2 px-4 disabled:opacity-50" data-testid="p-pdf-btn">
                    <FileDown className="w-4 h-4" /> Download PDF
                  </button>
                  <button onClick={() => sendWhatsApp(editing)} disabled={!editing.id} className="btn-ghost text-sm py-2 px-4 disabled:opacity-50 text-emerald-600" data-testid="p-whatsapp-btn">
                    <Send className="w-4 h-4" /> Send via WhatsApp
                  </button>
                  <button onClick={save} disabled={saving} className="btn-primary text-sm py-2 px-5 disabled:opacity-60" data-testid="p-save-btn">
                    <Save className={`w-4 h-4 ${saving ? "animate-pulse" : ""}`} />
                    {saving ? "Saving…" : "Save proposal"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Small internal helpers */
function Section({ title, children }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-brand-navy/60 font-semibold mb-2">{title}</div>
      {children}
    </div>
  );
}
function Two({ children }) { return <div className="grid md:grid-cols-2 gap-3">{children}</div>; }
function Field({ label, children }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-brand-navy/50 mb-1">{label}</div>
      {children}
    </div>
  );
}
function Input({ value, onChange, placeholder, type = "text", testId }) {
  return (
    <input
      type={type}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => onChange(type === "number" ? e.target.value : e.target.value)}
      data-testid={testId}
      className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 outline-none focus:border-brand-orange text-sm"
    />
  );
}
function Row({ label, value, bold, big }) {
  return (
    <div className={`flex items-center justify-between ${big ? "text-lg" : ""}`}>
      <span className={`text-brand-navy/70 ${bold || big ? "font-semibold" : ""}`}>{label}</span>
      <span className={`text-brand-navy ${bold ? "font-semibold" : ""} ${big ? "font-bold text-brand-orange" : ""}`}>{value}</span>
    </div>
  );
}

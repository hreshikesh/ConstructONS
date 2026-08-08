/**
 * AdminQuoteTemplates — list, edit, delete reusable quote templates.
 *
 * Templates are created by clicking "Save as Template" on any Custom Quote.
 * They can also be edited here (name, description, tags) — the underlying
 * specs/pricing edits live in Custom Quotes.
 */
import React, { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Trash2, RefreshCw, Save, X, Pencil, Copy as CopyIcon, Plus,
  Loader2, Tag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const rupees = (n) =>
  `\u20b9${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

export default function AdminQuoteTemplates() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await adminApi.quoteTemplates.list();
      setItems(list);
    } catch {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (row) => {
    if (!window.confirm(`Delete template "${row.name}"?`)) return;
    try {
      await adminApi.quoteTemplates.remove(row.id);
      toast.success("Template deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const createFromTemplate = async (row) => {
    try {
      const quote = await adminApi.customQuotes.fromTemplate({
        template_id: row.id,
        client_name: "New Client",
      });
      toast.success(`New draft quote ${quote.ref_number} created from template`);
      navigate("/admin/custom-quotes");
    } catch (e) {
      toast.error("Failed to create quote from template");
    }
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.name?.trim()) {
      toast.error("Template name is required");
      return;
    }
    setSaving(true);
    try {
      await adminApi.quoteTemplates.update(editing.id, editing);
      toast.success("Template updated");
      setEditing(null);
      load();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto" data-testid="admin-quote-templates">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <div className="section-eyebrow">Sales · Templates</div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-navy mt-1">Quote Templates</h1>
          <p className="text-sm text-brand-navy/60 mt-1">
            Save any Custom Quote as a template and spin up new client drafts in one click.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="btn-ghost text-sm py-2 px-4">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-white border border-black/5 shadow-soft p-10 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-brand-orange/10 grid place-items-center">
            <BookOpen className="w-7 h-7 text-brand-orange" />
          </div>
          <div className="mt-4 font-semibold text-brand-navy">No templates yet</div>
          <p className="text-sm text-brand-navy/60 mt-1 max-w-md mx-auto">
            Open a Custom Quote, fill it in, then click "Save as Template" to reuse it for new clients.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl bg-white border border-black/5 shadow-soft p-5 flex flex-col"
              data-testid={`qt-card-${t.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-brand-navy">{t.name}</div>
                  {t.description && (
                    <div className="text-sm text-brand-navy/60 mt-1 line-clamp-2">{t.description}</div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-brand-navy/50">Rate</div>
                  <div className="font-bold text-brand-orange">{rupees(t.price_per_sqft)}/sqft</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-brand-navy/60">
                <span>{(t.spec_categories || []).length} categories</span>
                <span>{(t.addons || []).length} addons</span>
                <span>{(t.payment_schedule || []).length} milestones</span>
              </div>
              {(t.tags || []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-brand-bg text-brand-navy/70 text-[10px] px-2 py-0.5">
                      <Tag className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-black/5 flex items-center gap-2">
                <button
                  onClick={() => createFromTemplate(t)}
                  data-testid={`qt-use-${t.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-orange text-white px-3.5 py-1.5 text-xs font-semibold hover:brightness-95"
                >
                  <CopyIcon className="w-3.5 h-3.5" /> Use Template
                </button>
                <button
                  onClick={() => setEditing({ ...t })}
                  data-testid={`qt-edit-${t.id}`}
                  className="w-8 h-8 rounded-full grid place-items-center hover:bg-brand-bg text-brand-navy/70"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => remove(t)}
                  data-testid={`qt-del-${t.id}`}
                  className="w-8 h-8 rounded-full grid place-items-center hover:bg-red-50 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Meta editor drawer */}
      <AnimatePresence>
        {editing && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditing(null)}
              className="fixed inset-0 bg-brand-navy/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 right-0 w-full max-w-lg bg-brand-bg z-50 overflow-y-auto"
              data-testid="qt-editor-drawer"
            >
              <div className="sticky top-0 bg-white border-b border-black/5 px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="section-eyebrow">Edit Template</div>
                  <div className="font-bold text-brand-navy">{editing.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={save}
                    disabled={saving}
                    data-testid="qt-save-btn"
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange text-white px-4 py-2 text-sm font-semibold"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                  </button>
                  <button onClick={() => setEditing(null)} className="w-9 h-9 rounded-full grid place-items-center hover:bg-brand-bg text-brand-navy">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="px-6 py-6 space-y-4">
                <label className="block">
                  <div className="text-xs font-semibold uppercase tracking-wider text-brand-navy/60 mb-1.5">Name</div>
                  <input
                    value={editing.name || ""}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                    data-testid="qt-field-name"
                  />
                </label>
                <label className="block">
                  <div className="text-xs font-semibold uppercase tracking-wider text-brand-navy/60 mb-1.5">Description</div>
                  <textarea
                    value={editing.description || ""}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm resize-y"
                  />
                </label>
                <label className="block">
                  <div className="text-xs font-semibold uppercase tracking-wider text-brand-navy/60 mb-1.5">Tags (comma separated)</div>
                  <input
                    value={(editing.tags || []).join(", ")}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                      })
                    }
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                    placeholder="e.g. villa, premium, 3bhk"
                  />
                </label>
                <div className="pt-3 text-xs text-brand-navy/50">
                  This template contains {(editing.spec_categories || []).length} spec categories,
                  {" "}{(editing.addons || []).length} addons and
                  {" "}{(editing.payment_schedule || []).length} milestones.
                  To edit specs/pricing, open a Custom Quote built from this template and re-save.
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

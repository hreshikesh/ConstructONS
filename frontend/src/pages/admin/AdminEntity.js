import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Save, ImageOff } from "lucide-react";

/**
 * Entity config: fields declared per entity for the admin form.
 * type: string | text | number | bool | image | tags | json | select
 */
const ENTITY_CONFIG = {
  homes: {
    title: "Homes",
    listCols: ["name", "style", "area_sqft", "estimated_cost", "sort_order", "is_published"],
    fields: [
      { name: "name", type: "string", required: true },
      { name: "slug", type: "string", required: true },
      { name: "style", type: "string" },
      { name: "tagline", type: "text" },
      { name: "description", type: "text" },
      { name: "area_sqft", type: "string" },
      { name: "dimensions", type: "string" },
      { name: "bedrooms", type: "number" },
      { name: "bathrooms", type: "number" },
      { name: "floors", type: "number" },
      { name: "parking", type: "number" },
      { name: "estimated_cost", type: "string" },
      { name: "package_compatibility", type: "tags" },
      { name: "cover_image", type: "image" },
      { name: "gallery", type: "tags", placeholder: "Comma-separated image URLs" },
      { name: "floorplan_image", type: "image" },
      { name: "floor_areas", type: "json", placeholder: '[{"label":"Living","area":"320 Sq.ft"}]' },
      { name: "features", type: "tags" },
      { name: "vastu_compliant", type: "bool" },
      { name: "sort_order", type: "number" },
      { name: "is_published", type: "bool" },
    ],
  },
  packages: {
    title: "Packages",
    listCols: ["name", "tier", "price_display", "is_most_popular", "sort_order"],
    fields: [
      { name: "name", type: "string", required: true },
      { name: "slug", type: "string", required: true },
      { name: "tier", type: "select", options: ["basic", "essential", "standard", "premium"] },
      { name: "price_display", type: "string" },
      { name: "price_unit", type: "string" },
      { name: "tagline", type: "string" },
      { name: "description", type: "text" },
      { name: "highlights", type: "tags" },
      { name: "sections", type: "json", placeholder: '[{"title":"Materials","items":["Item 1","Item 2"]}]' },
      { name: "is_most_popular", type: "bool" },
      { name: "accent_color", type: "string" },
      { name: "cta_label", type: "string" },
      { name: "sort_order", type: "number" },
      { name: "is_published", type: "bool" },
    ],
  },
  "ai-modules": {
    collection: "ai-modules",
    title: "AI Platform Modules",
    listCols: ["name", "slug", "sort_order"],
    fields: [
      { name: "name", type: "string", required: true },
      { name: "slug", type: "string", required: true },
      { name: "tagline", type: "string" },
      { name: "icon", type: "string", placeholder: "Lucide icon name (e.g. Sparkles)" },
      { name: "description", type: "text" },
      { name: "sort_order", type: "number" },
      { name: "is_published", type: "bool" },
    ],
  },
  "marketplace-categories": {
    collection: "marketplace-categories",
    title: "Marketplace Categories",
    listCols: ["name", "slug", "coming_soon", "sort_order"],
    fields: [
      { name: "name", type: "string", required: true },
      { name: "slug", type: "string", required: true },
      { name: "description", type: "text" },
      { name: "image", type: "image" },
      { name: "icon", type: "string" },
      { name: "coming_soon", type: "bool" },
      { name: "sort_order", type: "number" },
      { name: "is_published", type: "bool" },
    ],
  },
  "financial-services": {
    collection: "financial-services",
    title: "Financial Services",
    listCols: ["name", "slug", "coming_soon", "sort_order"],
    fields: [
      { name: "name", type: "string", required: true },
      { name: "slug", type: "string", required: true },
      { name: "tagline", type: "string" },
      { name: "description", type: "text" },
      { name: "icon", type: "string" },
      { name: "features", type: "tags" },
      { name: "coming_soon", type: "bool" },
      { name: "sort_order", type: "number" },
      { name: "is_published", type: "bool" },
    ],
  },
  testimonials: {
    title: "Testimonials",
    listCols: ["customer_name", "location", "rating", "home_purchased"],
    fields: [
      { name: "customer_name", type: "string", required: true },
      { name: "location", type: "string" },
      { name: "quote", type: "text", required: true },
      { name: "rating", type: "number" },
      { name: "avatar", type: "image" },
      { name: "video_url", type: "string" },
      { name: "home_purchased", type: "string" },
      { name: "sort_order", type: "number" },
      { name: "is_published", type: "bool" },
    ],
  },
  faqs: {
    title: "FAQs",
    listCols: ["question", "category", "sort_order"],
    fields: [
      { name: "question", type: "string", required: true },
      { name: "answer", type: "text", required: true },
      { name: "category", type: "string" },
      { name: "sort_order", type: "number" },
      { name: "is_published", type: "bool" },
    ],
  },
  blogs: {
    title: "Blogs",
    listCols: ["title", "author", "read_minutes", "sort_order"],
    fields: [
      { name: "title", type: "string", required: true },
      { name: "slug", type: "string", required: true },
      { name: "excerpt", type: "text" },
      { name: "cover_image", type: "image" },
      { name: "author", type: "string" },
      { name: "author_avatar", type: "image" },
      { name: "read_minutes", type: "number" },
      { name: "tags", type: "tags" },
      { name: "content_html", type: "text" },
      { name: "sort_order", type: "number" },
      { name: "is_published", type: "bool" },
    ],
  },
  team: {
    title: "Team Members",
    listCols: ["name", "role", "sort_order"],
    fields: [
      { name: "name", type: "string", required: true },
      { name: "role", type: "string" },
      { name: "photo", type: "image" },
      { name: "bio", type: "text" },
      { name: "linkedin", type: "string" },
      { name: "sort_order", type: "number" },
      { name: "is_published", type: "bool" },
    ],
  },
  "journey-steps": {
    collection: "journey-steps",
    title: "Journey Steps",
    listCols: ["step_no", "name", "sort_order"],
    fields: [
      { name: "step_no", type: "number", required: true },
      { name: "name", type: "string", required: true },
      { name: "description", type: "text" },
      { name: "icon", type: "string" },
      { name: "sort_order", type: "number" },
      { name: "is_published", type: "bool" },
    ],
  },
  "hero-sections": {
    collection: "hero-sections",
    title: "Hero Sections",
    listCols: ["key", "headline", "sort_order"],
    fields: [
      { name: "key", type: "string", required: true },
      { name: "eyebrow", type: "string" },
      { name: "headline", type: "string", required: true },
      { name: "headline_highlight", type: "string" },
      { name: "subheading", type: "text" },
      { name: "background_image", type: "image" },
      { name: "primary_cta_label", type: "string" },
      { name: "primary_cta_link", type: "string" },
      { name: "secondary_cta_label", type: "string" },
      { name: "secondary_cta_link", type: "string" },
      { name: "stats", type: "json", placeholder: '[{"label":"Homes","value":"250+"}]' },
      { name: "sort_order", type: "number" },
      { name: "is_published", type: "bool" },
    ],
  },
  comparison: {
    title: "Comparison Rows",
    listCols: ["feature", "traditional", "constructons", "sort_order"],
    fields: [
      { name: "feature", type: "string", required: true },
      { name: "traditional", type: "string" },
      { name: "constructons", type: "string" },
      { name: "traditional_positive", type: "bool" },
      { name: "constructons_positive", type: "bool" },
      { name: "sort_order", type: "number" },
      { name: "is_published", type: "bool" },
    ],
  },
  stats: {
    title: "Stats",
    listCols: ["label", "value", "sort_order"],
    fields: [
      { name: "label", type: "string", required: true },
      { name: "value", type: "string", required: true },
      { name: "icon", type: "string" },
      { name: "sort_order", type: "number" },
      { name: "is_published", type: "bool" },
    ],
  },
  media: {
    title: "Media Gallery",
    listCols: ["title", "category", "sort_order"],
    fields: [
      { name: "title", type: "string" },
      { name: "url", type: "image", required: true },
      { name: "category", type: "string" },
      { name: "alt", type: "string" },
      { name: "sort_order", type: "number" },
      { name: "is_published", type: "bool" },
    ],
  },
};

function emptyItem(fields) {
  const obj = {};
  fields.forEach((f) => {
    if (f.type === "bool") obj[f.name] = f.name === "is_published";
    else if (f.type === "number") obj[f.name] = 0;
    else if (f.type === "tags") obj[f.name] = [];
    else if (f.type === "json") obj[f.name] = [];
    else obj[f.name] = "";
  });
  return obj;
}

export default function AdminEntity() {
  const { entity } = useParams();
  const cfg = ENTITY_CONFIG[entity];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null=none, {} or item

  const collection = cfg?.collection || entity;

  const load = async () => {
    setLoading(true);
    try {
      const list = await adminApi.list(collection);
      setItems(list);
    } catch (e) { toast.error("Failed to load"); }
    setLoading(false);
  };

  useEffect(() => { setEditing(null); load(); /* eslint-disable-next-line */ }, [entity]);

  if (!cfg) return <div>Unknown entity: {entity}</div>;

  const startCreate = () => setEditing({ __isNew: true, ...emptyItem(cfg.fields) });
  const startEdit = (item) => setEditing({ ...item });
  const close = () => setEditing(null);

  const save = async () => {
    const item = { ...editing };
    const isNew = item.__isNew;
    delete item.__isNew;
    // parse tags/json
    cfg.fields.forEach((f) => {
      if (f.type === "tags" && typeof item[f.name] === "string") {
        item[f.name] = item[f.name].split(",").map((x) => x.trim()).filter(Boolean);
      }
      if (f.type === "json" && typeof item[f.name] === "string") {
        try { item[f.name] = JSON.parse(item[f.name]); } catch { toast.error(`Invalid JSON in ${f.name}`); throw new Error(); }
      }
      if (f.type === "number") item[f.name] = Number(item[f.name] || 0);
      if (f.type === "bool") item[f.name] = Boolean(item[f.name]);
    });
    try {
      if (isNew) await adminApi.create(collection, item);
      else await adminApi.update(collection, item.id, item);
      toast.success("Saved");
      close();
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to save");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await adminApi.remove(collection, id);
      toast.success("Deleted");
      load();
    } catch (e) { toast.error("Failed"); }
  };

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div>
          <div className="section-eyebrow">CMS</div>
          <h1 className="mt-2 text-brand-navy font-bold">{cfg.title}</h1>
          <p className="text-sm text-brand-navy/60 mt-1">Manage <b>{cfg.title.toLowerCase()}</b> shown on the public site.</p>
        </div>
        <button onClick={startCreate} className="btn-primary text-sm py-2.5 px-5" data-testid="admin-create-btn">
          <Plus className="w-4 h-4" /> Add new
        </button>
      </div>

      <div className="mt-6 rounded-2xl bg-white border border-black/5 shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-brand-navy/60">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm text-brand-navy/60">No items yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-brand-bg text-brand-navy/60">
                <tr>
                  {cfg.listCols.map((c) => (
                    <th key={c} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest">{c.replaceAll("_", " ")}</th>
                  ))}
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {items.map((it) => (
                  <tr key={it.id} className="hover:bg-brand-bg/50" data-testid={`admin-row-${it.id}`}>
                    {cfg.listCols.map((c) => (
                      <td key={c} className="px-4 py-3 text-brand-navy">
                        {typeof it[c] === "boolean" ? (
                          <span className={`inline-block w-2.5 h-2.5 rounded-full ${it[c] ? "bg-emerald-500" : "bg-slate-300"}`} />
                        ) : (
                          String(it[c] ?? "-").slice(0, 60)
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => startEdit(it)} className="w-8 h-8 rounded-full hover:bg-brand-navy/5 grid place-items-center"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => remove(it.id)} className="w-8 h-8 rounded-full hover:bg-red-50 text-red-500 grid place-items-center"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-stretch justify-end">
            <div className="absolute inset-0 bg-brand-navy/50" onClick={close} />
            <motion.div initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }} transition={{ type: "spring", damping: 24, stiffness: 260 }} className="relative w-full max-w-xl bg-white h-full overflow-y-auto shadow-premium">
              <div className="p-5 border-b border-black/5 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <div className="section-eyebrow">{editing.__isNew ? "Create" : "Edit"}</div>
                  <div className="font-semibold text-brand-navy">{cfg.title}</div>
                </div>
                <button onClick={close} className="w-9 h-9 rounded-full grid place-items-center hover:bg-brand-navy/5"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                {cfg.fields.map((f) => (
                  <FieldEditor key={f.name} field={f} value={editing[f.name]} onChange={(v) => setEditing({ ...editing, [f.name]: v })} />
                ))}
              </div>
              <div className="p-5 border-t border-black/5 sticky bottom-0 bg-white flex items-center justify-end gap-2">
                <button onClick={close} className="btn-ghost text-sm py-2 px-4">Cancel</button>
                <button onClick={save} className="btn-primary text-sm py-2 px-5" data-testid="admin-save-btn"><Save className="w-4 h-4" /> Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FieldEditor({ field, value, onChange }) {
  const label = <div className="text-[11px] uppercase tracking-widest text-brand-navy/50 mb-1">{field.name.replaceAll("_", " ")}{field.required ? " *" : ""}</div>;

  if (field.type === "bool") {
    return (
      <label className="flex items-center gap-3">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-orange-500" />
        <span className="text-sm text-brand-navy/80 capitalize">{field.name.replaceAll("_", " ")}</span>
      </label>
    );
  }
  if (field.type === "number") {
    return (
      <label className="block">{label}
        <input type="number" value={value ?? 0} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 outline-none focus:border-brand-orange text-sm" />
      </label>
    );
  }
  if (field.type === "text") {
    return (
      <label className="block">{label}
        <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={4} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 outline-none focus:border-brand-orange text-sm resize-y" />
      </label>
    );
  }
  if (field.type === "tags") {
    const val = Array.isArray(value) ? value.join(", ") : (value || "");
    return (
      <label className="block">{label}
        <input value={val} placeholder={field.placeholder || "Comma-separated"} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 outline-none focus:border-brand-orange text-sm" />
      </label>
    );
  }
  if (field.type === "json") {
    const val = typeof value === "string" ? value : JSON.stringify(value ?? [], null, 2);
    return (
      <label className="block">{label}
        <textarea value={val} onChange={(e) => onChange(e.target.value)} rows={5} placeholder={field.placeholder} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 outline-none focus:border-brand-orange text-xs font-mono resize-y" />
      </label>
    );
  }
  if (field.type === "select") {
    return (
      <label className="block">{label}
        <select value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 outline-none focus:border-brand-orange text-sm">
          <option value="">— select —</option>
          {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
    );
  }
  if (field.type === "image") {
    return (
      <label className="block">{label}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-brand-bg grid place-items-center border border-black/5">
            {value ? <img src={value} alt="" className="w-full h-full object-cover" /> : <ImageOff className="w-4 h-4 text-brand-navy/40" />}
          </div>
          <input value={value || ""} placeholder="Image URL" onChange={(e) => onChange(e.target.value)} className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 outline-none focus:border-brand-orange text-sm" />
        </div>
      </label>
    );
  }
  // default: string
  return (
    <label className="block">{label}
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 outline-none focus:border-brand-orange text-sm" />
    </label>
  );
}

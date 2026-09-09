import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Save, 
  ImageOff, 
  Loader2, 
  Database,
  ArrowRight,
  CheckCircle2,
  XCircle
} from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";

/**
 * Entity config: fields declared per entity for the admin form.
 * type: string | text | richtext | number | bool | image | tags | json | select
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
      { name: "price_per_sqft", type: "number" },
      { name: "tagline", type: "string" },
      { name: "description", type: "text" },
      { name: "hero_image", type: "image" },
      { name: "timeline_months", type: "string" },
      { name: "warranty_years", type: "number" },
      { name: "min_area_sqft", type: "number" },
      { name: "highlights", type: "tags" },
      { name: "sections", type: "json", placeholder: '[{"title":"Materials","items":["Item 1","Item 2"]}]' },
      { name: "spec_categories", type: "json", placeholder: '[{"name":"Structure","icon":"Building2","items":[{"spec":"Cement","value":"PPC 53","brand":"UltraTech","warranty":"5 Yr"}]}]' },
      { name: "scope_of_work", type: "tags" },
      { name: "exclusions", type: "tags" },
      { name: "addons", type: "json", placeholder: '[{"name":"Modular Kitchen","description":"…","price":"₹1,25,000","unit":"starting"}]' },
      { name: "payment_schedule", type: "json", placeholder: '[{"milestone":"Booking","percentage":10,"description":"On signing"}]' },
      { name: "package_faqs", type: "json", placeholder: '[{"question":"…","answer":"…"}]' },
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
      { name: "content_html", type: "richtext" },
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
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null); // null=none, {} or item

  const collection = cfg?.collection || entity;

  // Wrapped in useCallback to fix ESLint missing dependency cleanly
  const load = useCallback(async () => {
    if (!collection) return;
    setLoading(true);
    try {
      const list = await adminApi.list(collection);
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  }, [collection]);

  useEffect(() => {
    setEditing(null);
    load();
  }, [load]);

  if (!cfg) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-black/5 font-['Poppins']">
        <Database className="w-10 h-10 text-[#FF5A00] mx-auto mb-3" />
        <h2 className="text-xl font-bold text-[#000F1B]">Unknown Entity Schema</h2>
        <p className="text-sm text-[#111111]/60 mt-1">
          Entity collection <code className="text-[#FF5A00] bg-black/5 px-2 py-0.5 rounded">{entity}</code> is not declared in CMS configuration.
        </p>
      </div>
    );
  }

  const startCreate = () =>
    setEditing({ __isNew: true, ...emptyItem(cfg.fields) });

  const startEdit = (item) => setEditing({ ...item });
  const close = () => setEditing(null);

  const save = async () => {
    const item = { ...editing };
    const isNew = item.__isNew;
    delete item.__isNew;

    // parse tags & json safely
    for (const f of cfg.fields) {
      if (f.type === "tags" && typeof item[f.name] === "string") {
        item[f.name] = item[f.name]
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);
      }
      if (f.type === "json" && typeof item[f.name] === "string") {
        try {
          item[f.name] = JSON.parse(item[f.name]);
        } catch {
          toast.error(`Invalid JSON in field: ${f.name}`);
          return;
        }
      }
      if (f.type === "number") item[f.name] = Number(item[f.name] || 0);
      if (f.type === "bool") item[f.name] = Boolean(item[f.name]);
    }

    setSaving(true);
    try {
      if (isNew) {
        await adminApi.create(collection, item);
        toast.success("Record created successfully");
      } else {
        await adminApi.update(collection, item.id, item);
        toast.success("Changes saved successfully");
      }
      close();
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to save record");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this record?")) return;
    try {
      await adminApi.remove(collection, id);
      toast.success("Record deleted");
      load();
    } catch (e) {
      toast.error("Failed to delete record");
    }
  };

  return (
    <div className="font-['Poppins'] text-[#111111]">
      {/* CMS View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-[#FF5A00] tracking-wider uppercase">
            ConstructONS™ CMS
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-[#000F1B] tracking-tight">
            {cfg.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#111111]/60 mt-1">
            Manage live <b>{cfg.title.toLowerCase()}</b> content and parameters displayed on the ecosystem.
          </p>
        </div>

        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF5A00] hover:bg-[#FF2D00] text-white px-5 py-3 text-xs sm:text-sm font-semibold shadow-sm transition min-h-[44px]"
          data-testid="admin-create-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Entry</span>
        </button>
      </div>

      {/* Main Records Table Card */}
      <div className="mt-6 rounded-2xl bg-white border border-black/5 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-sm text-[#111111]/60">
            <Loader2 className="w-7 h-7 animate-spin text-[#FF5A00]" />
            <span>Fetching {cfg.title.toLowerCase()}...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#111111]/50">
            No records found for {cfg.title.toLowerCase()}. Click "Add New Entry" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#000F1B] text-white">
                <tr>
                  {cfg.listCols.map((col) => (
                    <th
                      key={col}
                      className="text-left px-5 py-3.5 text-[10px] uppercase tracking-widest font-semibold"
                    >
                      {col.replaceAll("_", " ")}
                    </th>
                  ))}
                  <th className="px-5 py-3.5 text-right text-[10px] uppercase tracking-widest font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {items.map((it, idx) => (
                  <tr
                    key={it.id || idx}
                    className="hover:bg-[#F2F2F2]/50 transition"
                    data-testid={`admin-row-${it.id}`}
                  >
                    {cfg.listCols.map((col) => (
                      <td key={col} className="px-5 py-3.5 text-[#000F1B]">
                        {typeof it[col] === "boolean" ? (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              it[col]
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-black/5 text-[#111111]/50 border border-black/5"
                            }`}
                          >
                            {it[col] ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Yes
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-slate-400" />
                                No
                              </>
                            )}
                          </span>
                        ) : (
                          <span className="font-medium">
                            {String(it[col] ?? "—").slice(0, 70)}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(it)}
                          className="w-9 h-9 rounded-xl hover:bg-[#F2F2F2] grid place-items-center text-[#000F1B] transition min-h-[36px]"
                          aria-label="Edit item"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(it.id)}
                          className="w-9 h-9 rounded-xl hover:bg-red-50 text-[#FF2D00] grid place-items-center transition min-h-[36px]"
                          aria-label="Delete item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Edit/Create Modal Drawer */}
      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 z-50 flex items-stretch justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#000F1B]/60 backdrop-blur-sm"
              onClick={close}
            />

            {/* Drawer Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="relative w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col z-10"
            >
              {/* Sticky Top Bar */}
              <div className="p-5 sm:p-6 border-b border-black/5 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
                <div>
                  <span className="text-[10px] font-bold text-[#FF5A00] uppercase tracking-wider">
                    {editing.__isNew ? "Create New" : "Edit Record"}
                  </span>
                  <div className="text-lg font-bold text-[#000F1B] mt-0.5">
                    {cfg.title}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="w-9 h-9 rounded-xl grid place-items-center hover:bg-[#F2F2F2] text-[#000F1B] transition min-h-[36px]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-5 sm:p-6 space-y-4 flex-1">
                {cfg.fields.map((f) => (
                  <FieldEditor
                    key={f.name}
                    field={f}
                    value={editing[f.name]}
                    onChange={(v) =>
                      setEditing((prev) => ({ ...prev, [f.name]: v }))
                    }
                  />
                ))}
              </div>

              {/* Sticky Action Footer */}
              <div className="p-5 sm:p-6 border-t border-black/5 sticky bottom-0 bg-[#F2F2F2] flex items-center justify-end gap-3 z-10">
                <button
                  type="button"
                  onClick={close}
                  disabled={saving}
                  className="rounded-xl border border-black/15 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#000F1B] hover:bg-black/5 transition min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FF5A00] hover:bg-[#FF2D00] text-white px-6 py-2.5 text-xs sm:text-sm font-bold shadow-sm transition min-h-[44px] disabled:opacity-60"
                  data-testid="admin-save-btn"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Record</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FieldEditor({ field, value, onChange }) {
  const label = (
    <div className="text-[11px] uppercase tracking-wider text-[#000F1B] font-bold mb-1.5">
      {field.name.replaceAll("_", " ")}
      {field.required && <span className="text-[#FF2D00] ml-1">*</span>}
    </div>
  );

  if (field.type === "bool") {
    return (
      <label className="flex items-center gap-3 p-3 rounded-xl border border-black/5 bg-[#F2F2F2]/40 hover:bg-[#F2F2F2] cursor-pointer transition">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="w-5 h-5 rounded accent-[#FF5A00] text-white focus:ring-[#FF5A00] border-black/20"
        />
        <span className="text-xs sm:text-sm font-semibold text-[#000F1B] capitalize">
          {field.name.replaceAll("_", " ")}
        </span>
      </label>
    );
  }

  if (field.type === "number") {
    return (
      <label className="block">
        {label}
        <input
          type="number"
          value={value ?? 0}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-[#FF5A00] focus:border-[#FF5A00] text-sm text-[#000F1B]"
        />
      </label>
    );
  }

  if (field.type === "text") {
    return (
      <label className="block">
        {label}
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-[#FF5A00] focus:border-[#FF5A00] text-sm text-[#000F1B] resize-y"
          placeholder={field.placeholder || "Enter details..."}
        />
      </label>
    );
  }

  if (field.type === "richtext") {
    return (
      <div className="block">
        <div className="text-[11px] uppercase tracking-wider text-[#000F1B] font-bold mb-1.5">
          {field.name.replaceAll("_", " ")}
        </div>
        <RichTextEditor
          value={value || ""}
          onChange={onChange}
          placeholder={field.placeholder || "Write rich formatted article content..."}
          minHeight={280}
          data-testid={`rte-${field.name}`}
        />
      </div>
    );
  }

  if (field.type === "tags") {
    const val = Array.isArray(value) ? value.join(", ") : value || "";
    return (
      <label className="block">
        {label}
        <input
          value={val}
          placeholder={field.placeholder || "Comma-separated items (e.g. 3BHK, Vastu, Parking)"}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-[#FF5A00] focus:border-[#FF5A00] text-sm text-[#000F1B]"
        />
      </label>
    );
  }

  if (field.type === "json") {
    const val =
      typeof value === "string" ? value : JSON.stringify(value ?? [], null, 2);
    return (
      <label className="block">
        {label}
        <textarea
          value={val}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          placeholder={field.placeholder}
          className="w-full rounded-xl border border-black/10 bg-[#F2F2F2]/60 px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-[#FF5A00] focus:border-[#FF5A00] text-xs font-mono text-[#000F1B] resize-y"
        />
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className="block">
        {label}
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-[#FF5A00] focus:border-[#FF5A00] text-sm text-[#000F1B]"
        >
          <option value="">— Select an option —</option>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "image") {
    return (
      <label className="block">
        {label}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#F2F2F2] grid place-items-center border border-black/5 shrink-0">
            {value ? (
              <img
                src={value}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageOff className="w-5 h-5 text-[#111111]/30" />
            )}
          </div>
          <input
            value={value || ""}
            placeholder="Image URL (https://...)"
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 rounded-xl border border-black/10 bg-white px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-[#FF5A00] focus:border-[#FF5A00] text-sm text-[#000F1B]"
          />
        </div>
      </label>
    );
  }

  // default: string
  return (
    <label className="block">
      {label}
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-[#FF5A00] focus:border-[#FF5A00] text-sm text-[#000F1B]"
      />
    </label>
  );
}
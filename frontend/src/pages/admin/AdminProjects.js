/**
 * AdminProjects — admin cockpit for customer projects.
 * List, create, edit stages (status/dates/photos/docs/notes) inline.
 */
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";
import {
  Plus, Trash2, Save, X, Loader2, RefreshCw, Building2, ClipboardList,
  CheckCircle2, PlayCircle, Circle, Camera, FileText, ChevronDown, ChevronUp,
} from "lucide-react";

const API_BASE = process.env.REACT_APP_BACKEND_URL + "/api";
const api = axios.create({ baseURL: API_BASE, withCredentials: true });

const PR = {
  list: () => api.get("/admin/projects").then(r => r.data),
  create: (body) => api.post("/admin/projects", body).then(r => r.data),
  remove: (id) => api.delete(`/admin/projects/${id}`).then(r => r.data),
  patchStage: (id, index, body) => api.patch(`/admin/projects/${id}/stages/${index}`, body).then(r => r.data),
  update: (id, body) => api.put(`/admin/projects/${id}`, body).then(r => r.data),
};

export default function AdminProjects() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await PR.list()); }
    catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (row) => {
    if (!window.confirm(`Delete ${row.title}?`)) return;
    try { await PR.remove(row.id); toast.success("Deleted"); load(); }
    catch { toast.error("Delete failed"); }
  };

  if (loading) return <div className="grid place-items-center py-24"><Loader2 className="w-6 h-6 animate-spin text-brand-orange" /></div>;

  return (
    <div className="max-w-6xl mx-auto" data-testid="admin-projects">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="section-eyebrow">Operations · Project Tracker</div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-navy mt-1">Customer Projects</h1>
          <p className="text-sm text-brand-navy/60 mt-1">Manage every customer's project timeline. They see updates instantly on their portal.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="btn-ghost text-sm py-2 px-4"><RefreshCw className="w-4 h-4" /> Refresh</button>
          <button onClick={() => setShowCreate(true)} data-testid="proj-new-btn" className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange text-white px-4 py-2 text-sm font-semibold hover:brightness-95">
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-white border border-black/5 shadow-soft p-10 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-brand-orange/10 grid place-items-center"><Building2 className="w-7 h-7 text-brand-orange" /></div>
          <div className="mt-4 font-semibold text-brand-navy">No projects yet</div>
          <p className="text-sm text-brand-navy/60 mt-1">Click "New Project" to create a tracker for a customer.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(p => {
            const done = p.stages.filter(s => s.status === "completed").length;
            const pct = Math.round((done / p.stages.length) * 100);
            return (
              <div key={p.id} className="rounded-2xl bg-white border border-black/5 shadow-soft p-5" data-testid={`proj-row-${p.id}`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="font-bold text-brand-navy">{p.title}</div>
                    <div className="text-xs text-brand-navy/60">{p.customer_name} · {p.customer_email}</div>
                    {p.address && <div className="text-xs text-brand-navy/50">{p.address}</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-brand-navy/50">Progress</div>
                    <div className="font-bold text-brand-orange">{done}/{p.stages.length} · {pct}%</div>
                  </div>
                </div>
                <div className="mt-3 h-1.5 bg-brand-bg rounded-full overflow-hidden"><div className="h-full bg-brand-orange" style={{ width: `${pct}%` }} /></div>
                <div className="mt-4 flex items-center gap-2">
                  <button onClick={() => setEditing(p)} data-testid={`proj-edit-${p.id}`} className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy text-white px-3.5 py-1.5 text-xs font-semibold hover:brightness-110">
                    <ClipboardList className="w-3.5 h-3.5" /> Manage Stages
                  </button>
                  <button onClick={() => remove(p)} className="inline-flex items-center gap-1.5 rounded-full border border-red-200 text-red-500 bg-white px-3.5 py-1.5 text-xs font-semibold hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />}
      {editing && <StagesEditor project={editing} onClose={() => setEditing(null)} onSaved={() => { load(); }} />}
    </div>
  );
}

function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ customer_email: "", customer_name: "", title: "My Home Project", address: "" });
  const [saving, setSaving] = useState(false);
  const create = async () => {
    if (!form.customer_email.trim()) { toast.error("Email required"); return; }
    setSaving(true);
    try {
      await PR.create(form);
      toast.success("Project created \u2014 customer will see it on their portal");
      onCreated();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Create failed");
    } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[60] grid place-items-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6" data-testid="proj-create-modal">
        <div className="font-bold text-brand-navy text-lg">New Customer Project</div>
        <p className="text-sm text-brand-navy/60 mt-1">Customer must sign in with the same Google email to see this project on their portal.</p>
        <div className="space-y-3 mt-4">
          {[
            { k: "customer_email", label: "Customer Email *", ph: "client@example.com" },
            { k: "customer_name", label: "Customer Name", ph: "e.g. Rajesh Kumar" },
            { k: "title", label: "Project Title", ph: "e.g. Kumar Villa \u2014 G+1 Modern" },
            { k: "address", label: "Site Address", ph: "Plot address / city" },
          ].map(f => (
            <label key={f.k} className="block">
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-navy/60 mb-1">{f.label}</div>
              <input value={form[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} placeholder={f.ph} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm" data-testid={`proj-field-${f.k}`} />
            </label>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-brand-navy">Cancel</button>
          <button onClick={create} disabled={saving} data-testid="proj-create-confirm" className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange text-white px-5 py-2 text-sm font-semibold disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Create
          </button>
        </div>
      </div>
    </div>
  );
}

function StagesEditor({ project, onClose, onSaved }) {
  const [stages, setStages] = useState(project.stages);
  const [saving, setSaving] = useState(null);
  const [uploading, setUploading] = useState(null);

  const saveStage = async (idx) => {
    setSaving(idx);
    try {
      const s = stages[idx];
      const updated = await PR.patchStage(project.id, idx, {
        status: s.status, expected_date: s.expected_date, progress_pct: Number(s.progress_pct) || 0,
        photos: s.photos, documents: s.documents, notes: s.notes,
      });
      const next = [...stages]; next[idx] = updated; setStages(next);
      toast.success(`"${s.name}" saved`); onSaved();
    } catch { toast.error("Save failed"); }
    finally { setSaving(null); }
  };

  const uploadPhoto = async (idx, file) => {
    if (!file) return;
    setUploading(idx);
    try {
      const res = await adminApi.uploadImage(file, "project-photos");
      const next = [...stages];
      next[idx] = { ...next[idx], photos: [...(next[idx].photos || []), res.url] };
      setStages(next);
      toast.success("Photo uploaded \u2014 click Save to publish");
    } catch { toast.error("Upload failed"); }
    finally { setUploading(null); }
  };

  const patchStage = (idx, patch) => {
    const next = [...stages]; next[idx] = { ...next[idx], ...patch }; setStages(next);
  };

  return (
    <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[60] grid place-items-center p-4">
      <div className="bg-brand-bg rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" data-testid="proj-stages-editor">
        <div className="p-5 border-b border-black/5 flex items-center justify-between bg-white">
          <div>
            <div className="section-eyebrow">Manage Stages</div>
            <div className="font-bold text-brand-navy">{project.title} · {project.customer_email}</div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full grid place-items-center hover:bg-brand-bg"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {stages.map((s, idx) => {
            const StatusIcon = s.status === "completed" ? CheckCircle2 : s.status === "in_progress" ? PlayCircle : Circle;
            const color = s.status === "completed" ? "text-emerald-500" : s.status === "in_progress" ? "text-brand-orange" : "text-brand-navy/30";
            return (
              <div key={idx} className="rounded-xl bg-white border border-black/5 p-4" data-testid={`proj-stage-edit-${idx}`}>
                <div className="flex items-center gap-3 mb-3">
                  <StatusIcon className={`w-6 h-6 ${color}`} />
                  <div className="flex-1">
                    <div className="text-[10px] uppercase tracking-wider text-brand-navy/50 font-semibold">Stage {idx + 1}</div>
                    <div className="font-bold text-brand-navy">{s.name}</div>
                  </div>
                  <select value={s.status} onChange={e => patchStage(idx, { status: e.target.value })} className="rounded-lg border border-black/10 bg-white px-2 py-1 text-xs" data-testid={`proj-status-${idx}`}>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                  <input type="date" value={s.expected_date || ""} onChange={e => patchStage(idx, { expected_date: e.target.value })} className="rounded border border-black/10 bg-white px-2 py-1.5 text-xs" placeholder="Expected date" />
                  <input type="number" value={s.progress_pct || 0} onChange={e => patchStage(idx, { progress_pct: e.target.value })} className="rounded border border-black/10 bg-white px-2 py-1.5 text-xs" placeholder="Progress %" />
                  <label className="inline-flex items-center justify-center gap-1.5 rounded border border-black/10 bg-white px-2 py-1.5 text-xs cursor-pointer hover:bg-brand-bg">
                    {uploading === idx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />} Upload Photo
                    <input type="file" accept="image/*" className="hidden" onChange={e => uploadPhoto(idx, e.target.files?.[0])} />
                  </label>
                </div>
                <textarea value={s.notes || ""} onChange={e => patchStage(idx, { notes: e.target.value })} rows={2} className="w-full rounded border border-black/10 bg-white px-2 py-1.5 text-xs resize-y" placeholder="Notes visible to the customer" />
                {(s.photos || []).length > 0 && (
                  <div className="mt-2 grid grid-cols-4 gap-1">
                    {s.photos.map((url, i) => (
                      <div key={i} className="relative">
                        <img src={url} alt="" className="w-full h-16 object-cover rounded" />
                        <button onClick={() => patchStage(idx, { photos: s.photos.filter((_, j) => j !== i) })} className="absolute top-0 right-0 w-5 h-5 rounded-full bg-white/90 grid place-items-center text-red-500"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex items-center justify-end">
                  <button onClick={() => saveStage(idx)} disabled={saving === idx} data-testid={`proj-save-stage-${idx}`} className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange text-white px-4 py-1.5 text-xs font-semibold">
                    {saving === idx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Stage
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

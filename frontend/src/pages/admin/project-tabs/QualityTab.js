import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { adminApi } from "@/lib/api";
import { Plus, X, Save, Loader2, ShieldCheck, CheckCircle2, AlertTriangle, Camera, UploadCloud, Trash2 } from "lucide-react";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000") + "/api";
const api = axios.create({ baseURL: API_BASE, withCredentials: true });

export default function QualityTab({ project, onSaved }) {
  const [inspections, setInspections] = useState(project.quality_inspections || []);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editId, setEditId] = useState(null);

  const getTodayStr = () => new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    name: "", category: "Foundation", status: "pending",
    inspector_name: "", remarks: "", photo_url: "", inspected_at: getTodayStr()
  });

  useEffect(() => { setInspections(project.quality_inspections || []); }, [project]);

  const fetchProject = async () => {
    try { const { data } = await api.get(`/admin/projects/${project.id}`); setInspections(data.quality_inspections || []); onSaved(); } 
    catch { toast.error("Failed to refresh"); }
  };

  const openNew = () => {
    setEditId(null);
    setForm({ name: "", category: "Foundation", status: "pending", inspector_name: "", remarks: "", photo_url: "", inspected_at: getTodayStr() });
    setShowForm(true);
  };

  const openEdit = (insp) => {
    setEditId(insp.id);
    const dateStr = insp.inspected_at ? new Date(insp.inspected_at).toISOString().split("T")[0] : getTodayStr();
    setForm({ ...insp, inspected_at: dateStr });
    setShowForm(true);
  };

  const saveInspection = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...form };
      if (payload.inspected_at) payload.inspected_at = new Date(payload.inspected_at).toISOString();
      if (editId) await api.put(`/admin/projects/${project.id}/quality/${editId}`, payload);
      else await api.post(`/admin/projects/${project.id}/quality`, payload);
      toast.success("Quality audit saved");
      setShowForm(false);
      await fetchProject();
    } catch { toast.error("Failed to save"); } finally { setLoading(false); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return; setUploading(true);
    try {
      const res = await adminApi.uploadImage(file, "quality");
      setForm(prev => ({ ...prev, photo_url: res.url }));
      toast.success("Audit photo attached!");
    } catch { toast.error("Upload failed"); } finally { setUploading(false); e.target.value = ""; }
  };

  return (
    <div className="space-y-6">
      {!showForm && (
        <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-black/5 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-[#000F1B]">Quality Assurance Logs</h3>
            <p className="text-[10px] text-[#111111]/50 mt-1">{inspections.length} audits recorded</p>
          </div>
          <button onClick={openNew} className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Log Inspection
          </button>
        </div>
      )}

      {showForm ? (
        <div className="bg-white rounded-xl border border-emerald-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-sm font-bold text-[#000F1B]">{editId ? "Edit Quality Audit" : "Log New Quality Check"}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-black/5 grid place-items-center hover:bg-black/10 transition"><X className="w-4 h-4" /></button>
          </div>

          <form onSubmit={saveInspection} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase mb-1 tracking-wider text-[#111111]/60">Audit Name / Checklist Item *</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Slump Test - Ground Floor Slab" className="w-full px-3 py-2 border rounded-lg bg-[#F9FAFB] focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1 tracking-wider text-[#111111]/60">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white cursor-pointer">
                  <option>Foundation</option><option>Structure</option><option>MEP</option><option>Finishing</option><option>General</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1 tracking-wider text-[#111111]/60">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold bg-white cursor-pointer text-[#000F1B]">
                  <option value="pending">Scheduled</option><option value="in_progress">In Progress</option><option value="rectification">Rectification Required (Failed)</option><option value="passed">Passed / Compliant</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1 tracking-wider text-[#111111]/60">Inspector / Verifier Name *</label>
                <input type="text" required value={form.inspector_name} onChange={e => setForm({ ...form, inspector_name: e.target.value })} placeholder="Er. Name" className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1 tracking-wider text-[#111111]/60">Inspection Date</label>
                <input type="date" value={form.inspected_at} onChange={e => setForm({ ...form, inspected_at: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase mb-1 tracking-wider text-[#111111]/60">Remarks / Notes</label>
                <textarea value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} placeholder="Any rectification notes or clearance details..." rows={2} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 resize-y text-sm" />
              </div>

              <div className="md:col-span-2 flex items-center gap-4 bg-[#F9FAFB] border border-black/5 rounded-xl p-3">
                {form.photo_url ? (
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-black/10 shadow-sm">
                    <img src={resolveMediaUrl(form.photo_url)} alt="audit" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setForm({ ...form, photo_url: "" })} className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white grid place-items-center rounded-bl-lg"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-white border border-black/5 grid place-items-center"><Camera className="w-4 h-4 text-[#111111]/30" /></div>
                )}
                <label className="cursor-pointer bg-white border border-black/10 hover:bg-[#000F1B] hover:text-white text-[#000F1B] rounded-lg px-4 py-2 text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  {form.photo_url ? "Replace Evidence Photo" : "Upload Inspection Image"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-black/5 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-lg border border-black/10 text-xs font-bold hover:bg-[#F2F2F2] transition">Cancel</button>
              <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg bg-[#000F1B] hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 transition shadow-sm disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Audit
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inspections.map(insp => {
            const isPassed = insp.status === 'passed';
            const isRect = insp.status === 'rectification';
            return (
              <div key={insp.id} className={`bg-white rounded-xl border p-4 flex flex-col justify-between group shadow-sm transition hover:shadow-md ${isPassed ? 'border-emerald-200' : isRect ? 'border-red-200' : 'border-black/10'}`}>
                <div className="flex justify-between items-start mb-3 border-b border-black/5 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 grid place-items-center ${insp.photo_url ? 'border border-black/10' : 'bg-gray-50 border border-gray-100'}`}>
                      {insp.photo_url ? <img src={resolveMediaUrl(insp.photo_url)} alt="" className="w-full h-full object-cover" /> : <ShieldCheck className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#000F1B] text-sm leading-tight truncate">{insp.name}</h4>
                      <p className="text-[9px] font-semibold text-[#111111]/50 mt-0.5">{insp.category} • By {insp.inspector_name}</p>
                    </div>
                  </div>
                  <span className={`text-[8px] uppercase tracking-wider font-bold px-2 py-1 rounded-md shrink-0 flex items-center gap-1 ${isPassed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : isRect ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-[#F2F2F2] text-[#111111]/50 border border-black/10'}`}>
                    {isPassed ? <CheckCircle2 className="w-3 h-3" /> : isRect ? <AlertTriangle className="w-3 h-3" /> : null}
                    {insp.status.replace("_", " ")}
                  </span>
                </div>

                {insp.remarks && (
                  <div className="text-[10px] text-[#111111]/70 bg-[#F9FAFB] border border-black/5 p-2 rounded-lg mb-3 line-clamp-2 italic font-medium">
                    "{insp.remarks}"
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 mt-auto">
                  <button onClick={() => openEdit(insp)} className="px-3 py-1.5 rounded-lg bg-white border border-black/10 text-xs font-bold hover:bg-[#000F1B] hover:text-white transition">Edit</button>
                  <button onClick={() => { if (window.confirm("Delete this inspection record?")) { api.delete(`/admin/projects/${project.id}/quality/${insp.id}`).then(fetchProject); } }} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 grid place-items-center hover:bg-red-500 hover:text-white transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
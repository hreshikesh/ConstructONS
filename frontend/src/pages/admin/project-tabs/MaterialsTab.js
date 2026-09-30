import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { adminApi } from "@/lib/api";
import { Plus, X, Save, Loader2, Package, UploadCloud, ImageIcon, Trash2 } from "lucide-react";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000") + "/api";
const api = axios.create({ baseURL: API_BASE, withCredentials: true });

export default function MaterialsTab({ project, onSaved }) {
  const [materials, setMaterials] = useState(project.materials || []);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [form, setForm] = useState({ 
    category: "Structure", item_name: "", brand: "", grade_spec: "", 
    quantity: "", unit: "Nos", unit_price: "", status: "ordered", 
    payment_status: "pending", photo_url: "", notes: "" 
  });

  useEffect(() => { setMaterials(project.materials || []); }, [project]);

  const fetchProject = async () => {
    try { const { data } = await api.get(`/admin/projects/${project.id}`); setMaterials(data.materials || []); onSaved(); } 
    catch { toast.error("Failed to refresh"); }
  };

  const openNew = () => {
    setEditId(null);
    setForm({ category: "Structure", item_name: "", brand: "", grade_spec: "", quantity: "", unit: "Nos", unit_price: "", status: "ordered", payment_status: "pending", photo_url: "", notes: "" });
    setShowForm(true);
  };

  const openEdit = (mat) => { setEditId(mat.id); setForm({ ...mat }); setShowForm(true); };

  const saveMaterial = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...form, quantity: Number(form.quantity) || 0, unit_price: Number(form.unit_price) || 0 };
      if (editId) await api.put(`/admin/projects/${project.id}/materials/${editId}`, payload);
      else await api.post(`/admin/projects/${project.id}/materials`, payload);
      toast.success("Material saved"); setShowForm(false); await fetchProject();
    } catch { toast.error("Failed to save"); } finally { setLoading(false); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return; setUploading(true);
    try {
      const res = await adminApi.uploadImage(file, "materials");
      setForm(prev => ({ ...prev, photo_url: res.url }));
      toast.success("Photo attached!");
    } catch { toast.error("Upload failed"); } finally { setUploading(false); e.target.value = ""; }
  };

  const deleteMat = async (id) => {
    if (!window.confirm("Delete this material log?")) return;
    try { await api.delete(`/admin/projects/${project.id}/materials/${id}`); toast.success("Deleted"); await fetchProject(); }
    catch { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-6">
      
      {!showForm && (
        <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-black/5 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-[#000F1B]">Procurement & Materials Log</h3>
            <p className="text-[10px] text-[#111111]/50 mt-1">{materials.length} items logged</p>
          </div>
          <button onClick={openNew} className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Log Material
          </button>
        </div>
      )}

      {showForm ? (
        <div className="bg-white rounded-xl border border-amber-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-sm font-bold text-[#000F1B]">{editId ? "Edit Material Details" : "Log New Material Order"}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-black/5 grid place-items-center hover:bg-black/10 transition"><X className="w-4 h-4" /></button>
          </div>

          <form onSubmit={saveMaterial} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="md:col-span-2"><label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-[#111111]/60">Item Name *</label><input type="text" required value={form.item_name} onChange={e => setForm({ ...form, item_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF5A00] outline-none text-sm font-bold" /></div>
              <div><label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-[#111111]/60">Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white cursor-pointer"><option>Structure</option><option>Flooring</option><option>Electrical</option><option>Plumbing</option><option>Finishes</option></select></div>
              <div><label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-[#111111]/60">Brand</label><input type="text" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. UltraTech" /></div>
              <div><label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-[#111111]/60">Unit Price (₹)</label><input type="number" required value={form.unit_price} onChange={e => setForm({ ...form, unit_price: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm font-bold text-[#10B981]" /></div>
              <div><label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-[#111111]/60">Quantity</label><input type="number" required value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm font-bold" /></div>
              <div><label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-[#111111]/60">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm font-bold text-amber-600 bg-white"><option value="ordered">Ordered</option><option value="delivered">Delivered</option><option value="inspected">Inspected</option><option value="installed">Installed</option></select></div>
              <div><label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-[#111111]/60">Payment</label><select value={form.payment_status} onChange={e => setForm({ ...form, payment_status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white"><option value="pending">Pending</option><option value="paid">Paid</option></select></div>

              <div className="md:col-span-4 flex items-center gap-4 bg-[#F9FAFB] border border-black/5 rounded-xl p-3">
                {form.photo_url ? (
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-black/10">
                    <img src={resolveMediaUrl(form.photo_url)} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setForm({ ...form, photo_url: "" })} className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white grid place-items-center rounded-bl-lg"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-white border border-black/5 grid place-items-center"><ImageIcon className="w-5 h-5 text-[#111111]/30" /></div>
                )}
                <label className="cursor-pointer bg-white border border-black/10 hover:bg-[#000F1B] hover:text-white text-[#000F1B] rounded-lg px-4 py-2 text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  {form.photo_url ? "Replace Photo" : "Upload Delivery Photo"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-black/5">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-lg border border-black/10 text-xs font-bold hover:bg-[#F2F2F2]">Cancel</button>
              <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg bg-[#000F1B] hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-sm disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Material
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map(m => (
            <div key={m.id} className="bg-white rounded-xl border border-black/5 shadow-sm p-4 flex flex-col justify-between hover:border-amber-300 transition">
              <div className="flex justify-between items-start mb-3 border-b border-black/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 overflow-hidden shrink-0 grid place-items-center">
                    {m.photo_url ? <img src={resolveMediaUrl(m.photo_url)} alt="" className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-amber-500" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#000F1B] text-sm truncate">{m.item_name}</h4>
                    <p className="text-[10px] text-[#111111]/50 font-medium">{m.quantity} {m.unit} • ₹{(m.unit_price * m.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-bold bg-[#F2F2F2] text-[#000F1B] px-2 py-0.5 rounded-md border border-black/5">{m.status}</span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button onClick={() => openEdit(m)} className="px-3 py-1.5 rounded-lg bg-white border border-black/10 text-xs font-bold hover:bg-[#000F1B] hover:text-white transition">Edit</button>
                <button onClick={() => deleteMat(m.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 grid place-items-center hover:bg-red-500 hover:text-white transition"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
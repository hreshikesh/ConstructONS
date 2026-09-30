import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { adminApi } from "@/lib/api";
import { FileText, UploadCloud, Loader2, Trash2 } from "lucide-react";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000") + "/api";
const api = axios.create({ baseURL: API_BASE, withCredentials: true });

export default function DocumentsTab({ project, onSaved }) {
  const [documents, setDocuments] = useState(project.documents || []);
  const [uploading, setUploading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Contracts");

  useEffect(() => {
    setDocuments(project.documents || []);
  }, [project]);

  const fetchProject = async () => {
    try { 
      const { data } = await api.get(`/admin/projects/${project.id}`); 
      setDocuments(data.documents || []); 
      onSaved(); 
    }
    catch { toast.error("Failed to refresh documents"); }
  };

  const handleUploadNew = async (e) => {
    const file = e.target.files?.[0]; 
    if (!file) return;
    if (!newTitle.trim()) { toast.error("Enter a document title first"); e.target.value = ""; return; }
    
    setUploading(true);
    try {
      const res = await adminApi.uploadImage(file, "documents");
      await api.post(`/admin/projects/${project.id}/documents`, { name: newTitle.trim(), category: newCategory, url: res.url });
      toast.success("Document uploaded & Client notified!");
      setNewTitle(""); 
      await fetchProject();
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Permanently delete this document from the vault?")) return;
    try { 
      await api.delete(`/admin/projects/${project.id}/documents/${docId}`); 
      toast.success("Document deleted"); 
      await fetchProject(); 
    }
    catch { toast.error("Failed to delete document"); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-black/5 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-[#000F1B] mb-4">Upload New Document to Vault</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-bold text-[#111111]/60 uppercase tracking-wider mb-1">Document Title *</label>
            <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Signed Contract V1" className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[#FF5A00] outline-none" />
          </div>
          <div className="w-full sm:w-64">
            <label className="block text-[10px] font-bold text-[#111111]/60 uppercase tracking-wider mb-1">Category</label>
            <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[#FF5A00] outline-none cursor-pointer">
              <option>Contracts</option><option>Reports</option><option>Invoices</option>
              <option>Handover</option><option>Approvals</option><option>General</option>
            </select>
          </div>
          <label className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#000F1B] text-white px-6 py-2 text-sm font-semibold transition min-h-[40px] cursor-pointer hover:bg-[#FF5A00] shadow-sm`}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            <span>Upload PDF / Image</span>
            <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleUploadNew} disabled={!newTitle.trim() || uploading} />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-black/5 shadow-sm p-6">
        <h3 className="text-sm font-bold text-[#000F1B] mb-4 border-b border-black/5 pb-2">Vault Files ({documents.length})</h3>
        {documents.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#111111]/50 italic bg-[#F9FAFB] rounded-xl border border-black/5">No documents uploaded to this project yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documents.map(d => (
              <div key={d.id} className="bg-[#F9FAFB] rounded-xl border border-black/5 p-4 flex justify-between items-center group hover:border-[#FF5A00]/40 hover:bg-white transition shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-white border border-black/5 grid place-items-center shrink-0"><FileText className="w-5 h-5 text-purple-600" /></div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-[#000F1B] text-sm truncate">{d.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-bold text-[#FF5A00] uppercase tracking-wider">{d.category}</span>
                      <span className="text-[10px] text-[#111111]/40 font-semibold">• {new Date(d.uploaded_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition shrink-0 pl-2 border-l border-black/5">
                  <a href={resolveMediaUrl(d.url)} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-[#000F1B] text-white text-[10px] font-bold hover:bg-[#FF5A00] transition">View</a>
                  <button onClick={() => handleDelete(d.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 grid place-items-center hover:bg-red-500 hover:text-white transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { adminApi } from "@/lib/api";
import { FileText, UploadCloud, Loader2, Trash2, History, CheckCircle2, AlertTriangle, Circle } from "lucide-react";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000") + "/api";
const api = axios.create({ baseURL: API_BASE, withCredentials: true });

export default function DrawingsTab({ project, onSaved }) {
  const [drawings, setDrawings] = useState(project.drawings || []);
  const [uploading, setUploading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Architectural");
  const [revisingId, setRevisingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setDrawings(project.drawings || []);
  }, [project]);

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/admin/projects/${project.id}`);
      setDrawings(data.drawings || []);
      onSaved();
    } catch {
      toast.error("Failed to refresh drawings");
    }
  };

  const handleUploadNew = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !newTitle.trim()) return;
    setUploading(true);
    try {
      const res = await adminApi.uploadImage(file, "drawings");
      await api.post(`/admin/projects/${project.id}/drawings`, { name: newTitle.trim(), category: newCategory, url: res.url });
      toast.success("Drawing uploaded!");
      setNewTitle("");
      await fetchProject();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleUploadRevision = async (drawingId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRevisingId(drawingId);
    try {
      const res = await adminApi.uploadImage(file, "drawings");
      await api.post(`/admin/projects/${project.id}/drawings/${drawingId}/revision`, { url: res.url });
      const currentVer = drawings.find(d => d.id === drawingId)?.current_version || 1;
      toast.success(`Revision V${currentVer + 1} uploaded!`);
      await fetchProject();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Revision failed");
    } finally {
      setRevisingId(null);
      e.target.value = "";
    }
  };

  const handleDelete = async (drawingId) => {
    if (!window.confirm("Delete this drawing?")) return;
    try {
      await api.delete(`/admin/projects/${project.id}/drawings/${drawingId}`);
      toast.success("Deleted");
      await fetchProject();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Upload Box */}
      <div className="bg-white rounded-xl border border-black/5 p-5 sm:p-6 shadow-sm">
        <h3 className="text-sm font-bold text-[#000F1B] mb-4">Upload New Drawing Plan</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-bold text-[#111111]/60 uppercase tracking-wider mb-1">Drawing Title *</label>
            <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Ground Floor Electrical Layout" className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF5A00] outline-none" />
          </div>
          <div className="w-full sm:w-48">
            <label className="block text-[10px] font-bold text-[#111111]/60 uppercase tracking-wider mb-1">Category</label>
            <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF5A00] outline-none cursor-pointer">
              <option>Architectural</option><option>Structural</option><option>Electrical</option><option>Plumbing</option><option>Interior</option>
            </select>
          </div>
          <label className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#000F1B] text-white px-6 py-2.5 text-sm font-bold transition cursor-pointer hover:bg-[#FF5A00] shadow-sm`}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            <span>Upload Plan</span>
            <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleUploadNew} disabled={!newTitle.trim() || uploading} />
          </label>
        </div>
      </div>

      {/* Drawings List */}
      <div className="bg-white rounded-xl border border-black/5 shadow-sm p-6">
        <h3 className="text-sm font-bold text-[#000F1B] mb-4 border-b border-black/5 pb-2">Active Drawings ({drawings.length})</h3>

        {drawings.length === 0 ? (
          <div className="bg-[#F9FAFB] rounded-xl border border-black/5 p-10 text-center text-sm text-[#111111]/50 italic">
            No drawings uploaded for this project yet.
          </div>
        ) : (
          <div className="space-y-4">
            {drawings.map(d => {
              const versions = d.versions || [];
              const latest = versions[versions.length - 1] || {};
              const isExpanded = expandedId === d.id;

              const statusConfig = {
                approved: { color: "bg-emerald-50 text-emerald-600 border-emerald-200", label: "Approved" },
                changes_required: { color: "bg-blue-50 text-blue-600 border-blue-200", label: "Changes Required" },
                rejected: { color: "bg-red-50 text-red-600 border-red-200", label: "Rejected" },
                pending: { color: "bg-amber-50 text-amber-600 border-amber-200", label: "Pending Approval" }
              };
              const stat = statusConfig[d.status] || statusConfig.pending;

              return (
                <div key={d.id} className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden hover:border-[#FF5A00]/40 transition">
                  <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#F9FAFB]/50">
                    <div className="flex items-center gap-4 min-w-0">
                      <a href={resolveMediaUrl(latest.url)} target="_blank" rel="noreferrer" className="w-16 h-16 rounded-xl bg-white border border-black/10 overflow-hidden shrink-0 group relative block shadow-sm">
                        <img src={resolveMediaUrl(latest.url)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                      </a>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-[9px] font-bold text-[#FF5A00] uppercase tracking-wider">{d.category}</span>
                          <span className="text-[9px] font-mono font-bold bg-[#000F1B] text-white px-2 py-0.5 rounded shadow-sm">V{d.current_version}</span>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${stat.color}`}>
                            {stat.label}
                          </span>
                        </div>
                        <h4 className="font-bold text-[#000F1B] text-sm md:text-base truncate">{d.name}</h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button onClick={() => setExpandedId(isExpanded ? null : d.id)} className="px-3 py-1.5 rounded-lg bg-white border border-black/10 text-xs font-bold text-[#000F1B] hover:bg-[#F2F2F2] transition flex items-center gap-1.5 shadow-sm">
                        <History className="w-3.5 h-3.5" /> {isExpanded ? "Hide History" : `History (${versions.length})`}
                      </button>

                      <label className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#FF5A00]/10 text-[#FF5A00] hover:bg-[#FF5A00] hover:text-white px-4 py-1.5 text-xs font-bold cursor-pointer transition shadow-sm">
                        {revisingId === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : `Upload V${d.current_version + 1}`}
                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleUploadRevision(d.id, e)} />
                      </label>

                      <button onClick={() => handleDelete(d.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 grid place-items-center hover:bg-red-500 hover:text-white transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Version History Accordion */}
                  {isExpanded && (
                    <div className="bg-white border-t border-black/5 p-5 space-y-3">
                      <div className="text-[10px] font-bold text-[#000F1B] uppercase tracking-wider mb-3">Revision & Feedback History</div>
                      <div className="space-y-2.5">
                        {[...versions].reverse().map((v) => (
                          <div key={v.version} className="bg-[#F9FAFB] border border-black/5 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <a href={resolveMediaUrl(v.url)} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-white overflow-hidden border border-black/10 shrink-0">
                                <img src={resolveMediaUrl(v.url)} alt="" className="w-full h-full object-cover" />
                              </a>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-[#000F1B]">Version {v.version}</span>
                                  <span className="text-[10px] text-[#111111]/40 font-medium">• {v.uploaded_at ? new Date(v.uploaded_at).toLocaleDateString() : ""}</span>
                                </div>
                                {v.client_comment ? (
                                  <p className="text-xs text-[#111111]/70 italic truncate mt-0.5">"{v.client_comment}"</p>
                                ) : (
                                  <span className="text-[10px] text-[#111111]/30 italic">No comments left</span>
                                )}
                              </div>
                            </div>

                            <div className="shrink-0">
                              {v.client_decision ? (
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${
                                  v.client_decision === "approved" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                  v.client_decision === "changes_required" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-red-50 text-red-600 border-red-200"
                                }`}>
                                  {v.client_decision.replace("_", " ")}
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-amber-600 uppercase bg-amber-50 border border-amber-200 px-2.5 py-1 rounded">Pending Approval</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
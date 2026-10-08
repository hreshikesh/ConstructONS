import React, { useCallback, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import {
  Plus, Trash2, Save, X, Loader2, RefreshCw, Building2, Search,
  Eye, Link as LinkIcon, Pencil, Check, Users, User, Archive, RotateCcw, AlertTriangle
} from "lucide-react";
import SEO from "@/components/site/SEO";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000") + "/api";
const api = axios.create({ baseURL: API_BASE, withCredentials: true });

const PR = {
  list: () => api.get("/admin/projects").then(r => r.data),
  create: (body) => api.post("/admin/projects", body).then(r => r.data),
  update: (id, body) => api.put(`/admin/projects/${id}`, body).then(r => r.data),
  softDelete: (id, reason) => api.post(`/admin/projects/${id}/delete`, { reason }).then(r => r.data),
  trashList: () => api.get("/admin/projects-trash").then(r => r.data),
  restore: (id) => api.post(`/admin/projects-trash/${id}/restore`).then(r => r.data),
  purge: (id) => api.delete(`/admin/projects-trash/${id}`).then(r => r.data),
};

const sanitizeDateYear = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    let year = parseInt(parts[0], 10);
    if (year > 0 && year < 100) {
      year += 2000;
      return `${year}-${parts[1]}-${parts[2]}`;
    } else if (year >= 100 && year < 1000) {
      const yearStr = String(parts[0]).padStart(4, "0");
      const lastTwo = yearStr.slice(-2);
      return `20${lastTwo}-${parts[1]}-${parts[2]}`;
    }
  }
  return dateStr;
};

export default function AdminProjects() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ isOpen: false, project: null });
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  // ★ RECYCLE BIN & DELETE REASON STATES
  const [view, setView] = useState("live"); // 'live' | 'trash'
  const [trash, setTrash] = useState([]);
  const [trashLoading, setTrashLoading] = useState(false);
  
  const [deleteModal, setDeleteModal] = useState({ open: false, project: null });
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await PR.list()); }
    catch { toast.error("Failed to load projects"); }
    finally { setLoading(false); }
  }, []);

  const loadTrash = useCallback(async () => {
    setTrashLoading(true);
    try { setTrash(await PR.trashList()); }
    catch { toast.error("Failed to load recycle bin"); }
    finally { setTrashLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (view === "trash") loadTrash();
  }, [view, loadTrash]);

  // Handle opening soft-delete modal
  const openDeleteModal = (row, e) => {
    e.stopPropagation();
    setDeleteReason("");
    setDeleteModal({ open: true, project: row });
  };

  // Confirm soft-delete with reason
  const confirmDelete = async () => {
    const reason = deleteReason.trim();
    if (reason.length < 5) {
      toast.error("Please enter a valid reason (at least 5 characters)");
      return;
    }
    setDeleting(true);
    try {
      const res = await PR.softDelete(deleteModal.project.id, reason);
      toast.success(res?.message || "Moved to recycle bin (recoverable for 3 days)");
      setDeleteModal({ open: false, project: null });
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  // Restore project from recycle bin
  const handleRestore = async (id) => {
    if (!window.confirm("Restore this project back to live tracking?")) return;
    try {
      await PR.restore(id);
      toast.success("Project restored successfully!");
      loadTrash();
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Restore failed");
    }
  };

  // Permanently purge project from recycle bin
  const handlePurge = async (id) => {
    if (!window.confirm("PERMANENTLY DELETE? This cannot be undone!")) return;
    try {
      await PR.purge(id);
      toast.success("Permanently deleted from system");
      loadTrash();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Purge failed");
    }
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter(p =>
      (p.title || "").toLowerCase().includes(q) ||
      (p.customer_name || "").toLowerCase().includes(q) ||
      (p.customer_email || "").toLowerCase().includes(q) ||
      (p.customer_phone || "").toLowerCase().includes(q) ||
      (p.project_code || "").toLowerCase().includes(q) ||
      (p.address || "").toLowerCase().includes(q) ||
      (p.city || "").toLowerCase().includes(q)
    );
  }, [items, query]);

  if (loading && view === "live") return (
    <div className="grid place-items-center py-24">
      <Loader2 className="w-6 h-6 animate-spin text-[#FF6600]" />
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto font-['Poppins'] pb-12">
      <SEO title="Admin Projects" description="Manage projects" canonical="/admin/projects" noindex={true} />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="text-xs font-semibold text-[#FF6600] uppercase tracking-wider">Operations · Project Tracker</div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#000F1B] mt-1">
            {view === "live" ? "Customer Projects" : "Recycle Bin (Trash)"}
          </h1>
          <p className="text-sm text-[#111111]/60 mt-1">
            {view === "live" 
              ? "Click any project to open its full detail workspace." 
              : "Deleted projects stored here for 3 days before auto-purging."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Recycle Bin Toggle Button */}
          <button 
            onClick={() => setView(view === "live" ? "trash" : "live")} 
            className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition shadow-sm cursor-pointer ${
              view === "trash" 
                ? "bg-[#000F1B] text-white border-[#000F1B]" 
                : "bg-white text-gray-700 border-black/10 hover:bg-gray-50"
            }`}
          >
            <Archive className="w-4 h-4 text-[#FF6600]" />
            {view === "live" ? "Recycle Bin" : "← Live Projects"}
          </button>

          <button onClick={view === "live" ? load : loadTrash} className="px-4 py-2 text-xs font-semibold text-[#000F1B] bg-white border border-black/10 rounded-xl hover:bg-[#F2F2F2] flex items-center gap-1.5 shadow-sm transition">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          
          {view === "live" && (
            <button onClick={() => setModalState({ isOpen: true, project: null })} className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6600] text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#FF0000] transition shadow-sm">
              <Plus className="w-4 h-4" /> New Project
            </button>
          )}
        </div>
      </div>

      {/* SEARCH BAR (Only on Live view) */}
      {view === "live" && (
        <div className="mb-4 relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#111111]/40" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, email, phone, project code, or location..."
            className="w-full bg-white border border-black/10 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6600] shadow-sm"
          />
        </div>
      )}

      {/* RECYCLE BIN TABLE VIEW */}
      {view === "trash" ? (
        trashLoading ? (
          <div className="grid place-items-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF6600]" />
          </div>
        ) : trash.length === 0 ? (
          <div className="rounded-3xl bg-white border border-black/5 shadow-sm p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 grid place-items-center mb-4">
              <Archive className="w-8 h-8 text-gray-400" />
            </div>
            <div className="text-lg font-bold text-[#000F1B]">Recycle bin is empty</div>
            <p className="text-sm text-gray-500 mt-1">Deleted projects will stay here for 3 days before permanent removal.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9FAFB] text-[10px] uppercase tracking-wider text-gray-500 font-bold border-b border-black/5">
                <tr>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Deleted By</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Time Remaining</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {trash.map((t) => (
                  <tr key={t.id} className="hover:bg-[#F9FAFB] transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-[#000F1B] text-sm">{t.title}</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">{t.project_code || "No Code"} · {t.customer_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">{t.deleted_by || "Admin"}</div>
                      <div className="text-[10px] text-gray-400">
                        {t.deleted_at ? new Date(t.deleted_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[250px]">
                      <div className="text-gray-700 font-medium line-clamp-2 bg-red-50/50 p-1.5 rounded border border-red-100 text-[11px]">
                        "{t.delete_reason || "No reason given"}"
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[10px]">
                        {t.hours_remaining != null ? `${t.hours_remaining} hours left` : "Auto-Purge Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1.5">
                      <button
                        onClick={() => handleRestore(t.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition shadow-xs"
                      >
                        <RotateCcw className="w-3 h-3" /> Restore
                      </button>
                      <button
                        onClick={() => handlePurge(t.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-500 text-red-600 hover:text-white text-[10px] font-bold transition"
                      >
                        <Trash2 className="w-3 h-3" /> Purge
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* LIVE PROJECTS VIEW */
        items.length === 0 ? (
          <div className="rounded-3xl bg-white border border-black/5 shadow-sm p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FF6600]/10 grid place-items-center mb-4">
              <Building2 className="w-8 h-8 text-[#FF6600]" />
            </div>
            <div className="text-lg font-bold text-[#000F1B]">No active projects yet</div>
            <p className="text-sm text-[#111111]/60 mt-1 max-w-sm mx-auto">Click "New Project" to convert an accepted proposal into a live project tracker.</p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden md:block bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F9FAFB] text-[10px] uppercase tracking-wider text-[#111111]/50 font-bold border-b border-black/5">
                  <tr>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3 text-right">Contract Value</th>
                    <th className="px-4 py-3">Payment Status</th>
                    <th className="px-4 py-3 w-[180px]">Progress</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filtered.map(p => {
                    const stages = p.stages || [];
                    const done = stages.filter(s => s.status === "completed").length;
                    const overall = stages.length ? Math.round(stages.reduce((sum, s) => sum + (Number(s.progress_pct) || 0), 0) / stages.length) : 0;
                    const cv = p.contract_value || 0;
                    const paid = p.amount_spent || 0;
                    const pctPaid = cv > 0 ? Math.round((paid / cv) * 100) : 0;
                    const locationDisplay = [p.address, p.city, p.state].filter(Boolean).join(", ") || "No location";

                    return (
                      <tr key={p.id} className="hover:bg-[#F9FAFB] transition cursor-pointer" onClick={() => navigate(`/admin/projects/${p.id}`)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 mb-1">
                            {p.project_code && (
                              <span className="text-[9px] font-mono font-bold bg-[#F2F2F2] text-[#000F1B] px-1.5 py-0.5 rounded border border-black/5">
                                {p.project_code}
                              </span>
                            )}
                            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                              {p.status || "Active"}
                            </span>
                          </div>
                          <div className="font-bold text-[#000F1B] text-sm truncate max-w-[240px]">{p.title}</div>
                          <div className="text-[10px] text-[#111111]/50 truncate max-w-[240px] mt-0.5">{locationDisplay}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-[#000F1B] truncate max-w-[180px]">{p.customer_name || "—"}</div>
                          <div className="text-[10px] text-[#FF6600] font-semibold truncate max-w-[180px]">{p.customer_email}</div>
                          {p.customer_phone && <div className="text-[10px] text-gray-500 font-medium mt-0.5">{p.customer_phone}</div>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="font-black text-emerald-600">₹{cv.toLocaleString('en-IN')}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-bold text-[#000F1B]">₹{paid.toLocaleString('en-IN')}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className="flex-1 h-1 bg-[#F2F2F2] rounded-full overflow-hidden max-w-[100px]">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pctPaid}%` }} />
                            </div>
                            <span className="text-[9px] font-bold text-emerald-600">{pctPaid}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-[#F2F2F2] rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#FF6600] to-[#FFA500] rounded-full" style={{ width: `${overall}%` }} />
                            </div>
                            <span className="text-xs font-black text-[#000F1B] w-9 text-right">{overall}%</span>
                          </div>
                          <div className="text-[9px] text-[#111111]/50 font-semibold mt-1">{done}/{stages.length} stages done</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/admin/projects/${p.id}`); }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#000F1B] hover:bg-[#FF6600] text-white text-[10px] font-bold rounded-lg transition shadow-sm"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setModalState({ isOpen: true, project: p }); }}
                              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#FF6600] text-gray-700 hover:text-white grid place-items-center transition"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => openDeleteModal(p, e)}
                              className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-500 text-red-600 hover:text-white grid place-items-center transition"
                              title="Delete to Trash"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden space-y-3">
              {filtered.map(p => {
                const stages = p.stages || [];
                const done = stages.filter(s => s.status === "completed").length;
                const overall = stages.length ? Math.round(stages.reduce((sum, s) => sum + (Number(s.progress_pct) || 0), 0) / stages.length) : 0;
                const cv = p.contract_value || 0;
                const paid = p.amount_spent || 0;
                const pctPaid = cv > 0 ? Math.round((paid / cv) * 100) : 0;

                return (
                  <div key={p.id} onClick={() => navigate(`/admin/projects/${p.id}`)}
                    className="bg-white rounded-xl border border-black/5 shadow-sm p-4 cursor-pointer hover:shadow-md transition">
                    
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          {p.project_code && (
                            <span className="text-[9px] font-mono font-bold bg-[#F2F2F2] text-[#000F1B] px-1.5 py-0.5 rounded border border-gray-200">
                              {p.project_code}
                            </span>
                          )}
                          <span className="text-[9px] font-bold uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                            {p.status || "Active"}
                          </span>
                        </div>
                        <div className="font-bold text-[#000F1B] text-sm truncate">{p.title}</div>
                        <div className="text-[10px] text-[#FF6600] font-semibold truncate mt-0.5">
                          {p.customer_name} • {p.customer_email} {p.customer_phone && `• ${p.customer_phone}`}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setModalState({ isOpen: true, project: p }); }}
                          className="w-7 h-7 rounded-lg bg-gray-100 text-[#000F1B] grid place-items-center shadow-sm"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => openDeleteModal(p, e)}
                          className="w-7 h-7 rounded-lg bg-red-50 text-red-600 grid place-items-center shadow-sm"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-[#F9FAFB] rounded-lg p-2.5 border border-black/5">
                      <div>
                        <div className="text-[8px] font-bold uppercase text-[#111111]/50 mb-0.5">Progress</div>
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#FF6600] rounded-full" style={{ width: `${overall}%` }} />
                          </div>
                          <span className="text-[10px] font-black text-[#000F1B]">{overall}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[8px] font-bold uppercase text-[#111111]/50 mb-0.5">Paid ({pctPaid}%)</div>
                        <div className="text-[10px] font-black text-emerald-600 truncate">₹{paid.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )
      )}

      {/* CREATE / EDIT MODAL */}
      {modalState.isOpen && (
        <ProjectFormModal 
          project={modalState.project} 
          onClose={() => setModalState({ isOpen: false, project: null })} 
          onSaved={() => { setModalState({ isOpen: false, project: null }); load(); }} 
        />
      )}

      {/* ★ DELETE CONFIRMATION & REASON MODAL */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-[70] bg-[#000F1B]/60 backdrop-blur-sm grid place-items-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl font-['Poppins'] relative">
            <div className="flex items-center gap-2 text-red-600 font-bold text-lg mb-1">
              <AlertTriangle className="w-5 h-5" /> Move to Recycle Bin?
            </div>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              <strong>{deleteModal.project?.title}</strong> will be moved to the 3-day recycle bin. You can recover it anytime within 3 days.
            </p>

            <label className="block text-[11px] font-bold uppercase text-[#000F1B] mb-1">
              Reason for Deletion *
            </label>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              rows={3}
              placeholder="e.g. Client requested cancellation / Duplicate entry..."
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:border-[#FF6600] outline-none mb-1 shadow-xs"
            />
            <p className="text-[10px] text-gray-400 mb-5">Minimum 5 characters. Recorded with timestamp and admin identity.</p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, project: null })}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 inline-flex items-center gap-1.5 transition shadow-sm"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Move to Recycle Bin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// DYNAMIC PROJECT FORM MODAL (CREATE & EDIT)
// ============================================================================
function ProjectFormModal({ project, onClose, onSaved }) {
  const isEdit = !!project;
  const [form, setForm] = useState({
    customer_email: "", customer_name: "", customer_phone: "", 
    title: "My Home Project", address: "", city: "", state: "", pincode: "",
    contract_value: "", project_agreed_date: "", start_date: "", expected_completion: "", 
    actual_completion_date: "", site_lat: "", site_lng: "", manager_id: "", team_ids: []
  });

  const [saving, setSaving] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [allStaff, setAllStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  useEffect(() => {
    if (project) {
      setForm({
        customer_email: project.customer_email || "",
        customer_name: project.customer_name || "",
        customer_phone: project.customer_phone || "",
        title: project.title || "",
        address: project.address || "",
        city: project.city || "",
        state: project.state || "",
        pincode: project.pincode || "",
        contract_value: project.contract_value ? String(project.contract_value) : "",
        project_agreed_date: project.project_agreed_date ? String(project.project_agreed_date).slice(0, 10) : "",
        start_date: project.start_date ? String(project.start_date).slice(0, 10) : "",
        expected_completion: project.expected_completion ? String(project.expected_completion).slice(0, 10) : "",
        actual_completion_date: project.actual_completion_date ? String(project.actual_completion_date).slice(0, 10) : "",
        site_lat: project.site_lat ? String(project.site_lat) : "",
        site_lng: project.site_lng ? String(project.site_lng) : "",
        manager_id: project.manager_id || "",
        team_ids: project.team_ids || []
      });
    }
  }, [project]);

  useEffect(() => {
    adminApi.list("team")
      .then(res => setAllStaff(Array.isArray(res) ? res : []))
      .catch(() => console.error("Failed to load staff list"))
      .finally(() => setLoadingStaff(false));
  }, []);

  useEffect(() => {
    if (isEdit) {
      setLoadingProps(false);
      return;
    }
    adminApi.list("proposals")
      .then(res => {
        if (Array.isArray(res)) setProposals(res.filter(p => p.status === "accepted"));
      })
      .catch(() => console.error("Failed to load proposals"))
      .finally(() => setLoadingProps(false));
  }, [isEdit]);

  const handleProposalSelect = (e) => {
    const propId = e.target.value;
    if (!propId) return;
    const p = proposals.find(x => x.id === propId);
    if (!p) return;

    const baseCost = (Number(p.built_up_area) || 0) * (Number(p.package_price_per_sqft) || 0);
    const addonsCost = (p.addons_selected || []).reduce((sum, a) => sum + (Number(a.price) || 0), 0);
    const discount = Number(p.discount_amount) || 0;
    const trueTotal = baseCost + addonsCost - discount;

    setForm(prev => ({
      ...prev,
      quote_id: p.id,
      customer_email: p.client_email?.trim() || prev.customer_email,
      customer_name: p.client_name?.trim() || prev.customer_name,
      customer_phone: p.client_phone ? p.client_phone.replace(/\D/g, "").slice(0, 10) : prev.customer_phone,
      address: p.site_address?.trim() || prev.address,
      contract_value: trueTotal > 0 ? String(trueTotal) : prev.contract_value,
      title: `${p.client_name?.split(" ")[0] || "Client"}'s ${p.package_name || "Home"} Build`,
      start_date: p.expected_start ? String(p.expected_start).slice(0, 10) : prev.start_date,
      expected_completion: p.expected_completion ? String(p.expected_completion).slice(0, 10) : prev.expected_completion
    }));
    toast.success("Client details auto-filled from proposal");
  };

  const handlePhoneChange = (e) => {
    const numericValue = e.target.value.replace(/\D/g, "");
    setForm(prev => ({ ...prev, customer_phone: numericValue }));
  };

  const toggleTeamSelect = (staffId) => {
    if (staffId === form.manager_id) {
      toast.info("This person is assigned as the Project Manager.");
      return;
    }
    setForm(prev => ({
      ...prev,
      team_ids: prev.team_ids.includes(staffId)
        ? prev.team_ids.filter(id => id !== staffId)
        : [...prev.team_ids, staffId]
    }));
  };

  const save = async () => {
    if (!form.customer_email.trim()) { 
      toast.error("Client Email is required"); 
      return; 
    }
    if (form.customer_phone && form.customer_phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return; 
    }

    if (form.pincode && !/^\d{6}$/.test(form.pincode.trim())) {
      toast.error("Pincode must be exactly 6 digits (e.g. 560001)");
      return;
    }
    if (form.city && !/^[A-Za-z\s]+$/.test(form.city.trim())) {
      toast.error("City name must contain alphabets and spaces only");
      return;
    }
    if (form.state && !/^[A-Za-z\s]+$/.test(form.state.trim())) {
      toast.error("State name must contain alphabets and spaces only");
      return;
    }
    
    setSaving(true);
    try {
      const payload = { 
        ...form, 
        contract_value: Number(form.contract_value) || 0,
        site_lat: form.site_lat ? Number(form.site_lat) : null,
        site_lng: form.site_lng ? Number(form.site_lng) : null,
        project_agreed_date: sanitizeDateYear(form.project_agreed_date) || null,
        start_date: sanitizeDateYear(form.start_date) || null,
        expected_completion: sanitizeDateYear(form.expected_completion) || null,
        actual_completion_date: sanitizeDateYear(form.actual_completion_date) || null,
      };

      if (isEdit) {
        await PR.update(project.id, payload);
        toast.success("Project updated successfully!");
      } else {
        await PR.create(payload);
        toast.success("Live Project Created! Welcome email sent to client.");
      }
      onSaved();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Save failed");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-[#000F1B]/60 backdrop-blur-sm z-[60] grid place-items-center p-4 font-['Poppins']">
      <div className="bg-white rounded-3xl w-full max-w-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#FF6600]" />
        
        <div className="flex items-center justify-between mb-2 shrink-0">
          <div className="font-bold text-[#000F1B] text-xl">
            {isEdit ? "Edit Project Details" : "New Project Tracker"}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 grid place-items-center transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-[#111111]/60 mb-4 shrink-0">
          {isEdit ? "Make necessary alterations to the operational data metrics below." : "Convert an accepted proposal into a live project, or create one from scratch."}
        </p>

        <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1 pb-4">
          
          {!isEdit && (
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 shadow-sm">
              <label className="block text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5" /> Auto-Fill from Proposal
              </label>
              {loadingProps ? (
                <div className="text-xs text-blue-600 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                </div>
              ) : (
                <select onChange={handleProposalSelect} className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-[#000F1B] cursor-pointer outline-none focus:border-blue-500 shadow-sm">
                  <option value="">-- Select Accepted Proposal --</option>
                  {proposals.map(p => {
                    const baseCost = (Number(p.built_up_area) || 0) * (Number(p.package_price_per_sqft) || 0);
                    const addonsCost = (p.addons_selected || []).reduce((sum, a) => sum + (Number(a.price) || 0), 0);
                    const total = baseCost + addonsCost - (Number(p.discount_amount) || 0);
                    return <option key={p.id} value={p.id}>{p.ref_number} : {p.client_name} (₹{total.toLocaleString('en-IN')})</option>;
                  })}
                </select>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[#000F1B] uppercase mb-1">Project Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm font-bold focus:border-[#FF6600] outline-none shadow-sm" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#000F1B] uppercase mb-1">Client Name</label>
              <input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm focus:border-[#FF6600] outline-none shadow-sm" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#000F1B] uppercase mb-1">Client Email *</label>
              <input type="email" value={form.customer_email} onChange={e => setForm({ ...form, customer_email: e.target.value })} className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm focus:border-[#FF6600] outline-none shadow-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[#000F1B] uppercase mb-1">Client Phone Number (10 Digits)</label>
              <input 
                type="tel" 
                value={form.customer_phone} 
                onChange={handlePhoneChange} 
                maxLength={10}
                placeholder="e.g. 9876543210" 
                className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm focus:border-[#FF6600] outline-none shadow-sm" 
              />
            </div>

            {/* LOCATION FIELDS */}
            <div className="sm:col-span-2 pt-2 border-t border-black/5">
              <label className="block text-[11px] font-bold text-[#000F1B] uppercase mb-1">Site Street Address</label>
              <input 
                value={form.address} 
                onChange={e => setForm({ ...form, address: e.target.value })} 
                className="w-full rounded-xl border border-black/10 px-3.5 py-2 text-sm focus:border-[#FF6600] outline-none shadow-sm" 
                placeholder="Plot / House No, Street name..."
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#000F1B] uppercase mb-1">City (Alphabets Only)</label>
              <input 
                value={form.city} 
                onChange={e => setForm({ ...form, city: e.target.value.replace(/[^A-Za-z\s]/g, "") })} 
                placeholder="e.g. Bangalore"
                className="w-full rounded-xl border border-black/10 px-3.5 py-2 text-sm focus:border-[#FF6600] outline-none shadow-sm" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#000F1B] uppercase mb-1">State (Alphabets Only)</label>
              <input 
                value={form.state} 
                onChange={e => setForm({ ...form, state: e.target.value.replace(/[^A-Za-z\s]/g, "") })} 
                placeholder="e.g. Karnataka"
                className="w-full rounded-xl border border-black/10 px-3.5 py-2 text-sm focus:border-[#FF6600] outline-none shadow-sm" 
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[#000F1B] uppercase mb-1">Pincode (Exactly 6 Digits)</label>
              <input 
                value={form.pincode} 
                onChange={e => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} 
                maxLength={6}
                placeholder="e.g. 560001"
                className="w-full rounded-xl border border-black/10 px-3.5 py-2 text-sm focus:border-[#FF6600] outline-none shadow-sm" 
              />
            </div>

            {/* DATES */}
            <div className="sm:col-span-2 pt-2 border-t border-black/5">
              <div className="text-[11px] font-bold text-[#000F1B] uppercase mb-2">Project Timeline Milestones</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Project Agreed Date</label>
                  <input 
                    type="date" 
                    value={form.project_agreed_date || ""} 
                    onChange={e => setForm({ ...form, project_agreed_date: e.target.value })}
                    onBlur={e => setForm(p => ({ ...p, project_agreed_date: sanitizeDateYear(e.target.value) }))}
                    className="w-full rounded-xl border border-black/10 px-3 py-2 text-xs focus:border-[#FF6600] outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Project Start Date</label>
                  <input 
                    type="date" 
                    value={form.start_date || ""} 
                    onChange={e => setForm({ ...form, start_date: e.target.value })}
                    onBlur={e => setForm(p => ({ ...p, start_date: sanitizeDateYear(e.target.value) }))}
                    className="w-full rounded-xl border border-black/10 px-3 py-2 text-xs focus:border-[#FF6600] outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Forecast Completion</label>
                  <input 
                    type="date" 
                    value={form.expected_completion || ""} 
                    onChange={e => setForm({ ...form, expected_completion: e.target.value })} 
                    onBlur={e => setForm(p => ({ ...p, expected_completion: sanitizeDateYear(e.target.value) }))}
                    className="w-full rounded-xl border border-black/10 px-3 py-2 text-xs focus:border-[#FF6600] outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Actual Completion Date</label>
                  <input 
                    type="date" 
                    value={form.actual_completion_date || ""} 
                    onChange={e => setForm({ ...form, actual_completion_date: e.target.value })} 
                    onBlur={e => setForm(p => ({ ...p, actual_completion_date: sanitizeDateYear(e.target.value) }))}
                    className="w-full rounded-xl border border-black/10 px-3 py-2 text-xs focus:border-[#FF6600] outline-none" 
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[#000F1B] uppercase mb-1">Total Contract Value (₹)</label>
              <input 
                type="text" 
                value={form.contract_value} 
                onChange={e => setForm({ ...form, contract_value: e.target.value.replace(/[^0-9]/g, "") })} 
                placeholder="0"
                className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm font-bold text-emerald-600 focus:border-[#FF6600] outline-none shadow-sm" 
              />
            </div>

            {/* PROJECT MANAGER ASSIGNMENT */}
            <div className="sm:col-span-2 pt-3 border-t border-black/5">
              <label className="block text-[11px] font-bold text-[#000F1B] uppercase mb-1">Primary Project Manager</label>
              <select 
                value={form.manager_id}
                onChange={e => {
                  const mId = e.target.value;
                  setForm(prev => ({
                    ...prev,
                    manager_id: mId,
                    team_ids: prev.team_ids.filter(id => id !== mId)
                  }));
                }}
                className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm font-semibold text-[#000F1B] outline-none focus:border-[#FF6600] bg-white shadow-sm"
              >
                <option value="">-- Select Project Manager --</option>
                {allStaff.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.designation || s.role || "Staff"}) {s.email ? `• ${s.email}` : ""}</option>
                ))}
              </select>
            </div>

            {/* WORKING TEAM ASSIGNMENT */}
            <div className="sm:col-span-2 pt-2">
              <div className="text-[11px] font-bold text-[#000F1B] uppercase mb-1 flex items-center justify-between">
                <span>Assign Working Site Team</span>
                <span className="text-[10px] font-semibold text-[#FF6600]">{form.team_ids.length} selected</span>
              </div>
              <p className="text-[10px] text-gray-500 mb-2">Supporting staff visible on the client dashboard.</p>
              
              {loadingStaff ? (
                <div className="py-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6600]" /> Loading staff list...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                  {allStaff.map(staff => {
                    const isSelected = form.team_ids.includes(staff.id);
                    const isManager = staff.id === form.manager_id;
                    return (
                      <div 
                        key={staff.id} 
                        onClick={() => toggleTeamSelect(staff.id)}
                        className={`flex items-center justify-between p-2 rounded-xl border transition ${
                          isManager ? "border-[#FF6600]/40 bg-[#FF6600]/10 cursor-not-allowed" :
                          isSelected ? "border-[#FF6600] bg-[#FF6600]/5 cursor-pointer" : "border-black/10 bg-white hover:border-black/20 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {staff.photo ? (
                            <img src={resolveMediaUrl(staff.photo)} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[#000F1B] text-white grid place-items-center shrink-0">
                              <User className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-[#000F1B] truncate">{staff.name}</div>
                            <div className="text-[9px] text-gray-500 truncate">{staff.designation || staff.role || "Staff"}</div>
                          </div>
                        </div>
                        {!isManager && (
                          <div className={`w-4 h-4 rounded grid place-items-center shrink-0 ${isSelected ? "bg-[#FF6600] text-white" : "border border-gray-300"}`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-black/5">
              <div className="text-[11px] font-bold text-[#000F1B] uppercase mb-2">Live Weather Coordinates</div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" step="any" value={form.site_lat} onChange={e => setForm({ ...form, site_lat: e.target.value })} placeholder="Latitude (e.g. 12.9716)" className="w-full rounded-xl border border-black/10 px-3.5 py-2 text-sm outline-none focus:border-[#FF6600] shadow-sm" />
                <input type="number" step="any" value={form.site_lng} onChange={e => setForm({ ...form, site_lng: e.target.value })} placeholder="Longitude (e.g. 77.5946)" className="w-full rounded-xl border border-black/10 px-3.5 py-2 text-sm outline-none focus:border-[#FF6600] shadow-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-black/5 flex justify-end gap-2 shrink-0">
          <button onClick={onClose} className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-[#000F1B] hover:bg-[#FF6600] text-white px-6 py-2.5 text-sm font-bold transition shadow-sm disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {isEdit ? "Update Changes" : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { adminApi } from "@/lib/api";
import { 
  Plus, X, Save, Loader2, CheckCircle2, Circle, Camera, 
  HardHat, ShieldCheck, Trash2 
} from "lucide-react";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000") + "/api";
const api = axios.create({ baseURL: API_BASE, withCredentials: true });

export default function ReportsTab({ project, onSaved }) {
  const [activeTab, setActiveTab] = useState("queue"); // "create" | "queue"
  const [reports, setReports] = useState(project.daily_reports || []);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const todayStr = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(todayStr);
  const [overallStatus, setOverallStatus] = useState("Work as per plan");
  const [statusNotes, setStatusNotes] = useState("");
  const [workCompletedInput, setWorkCompletedInput] = useState("");
  const [workCompletedList, setWorkCompletedList] = useState([]);
  const [plannedTomorrowInput, setPlannedTomorrowInput] = useState("");
  const [plannedTomorrowList, setPlannedTomorrowList] = useState([]);
  const [photosList, setPhotosList] = useState([]);

  useEffect(() => {
    setReports(project.daily_reports || []);
  }, [project]);

  const fetchReports = async () => {
    try {
      const { data } = await api.get(`/admin/projects/${project.id}/daily-reports`);
      setReports(data.reports || []);
      onSaved();
    } catch {
      toast.error("Failed to refresh daily reports");
    }
  };

  const handleAddWorkCompleted = () => {
    if (!workCompletedInput.trim()) return;
    setWorkCompletedList(prev => [...prev, workCompletedInput.trim()]);
    setWorkCompletedInput("");
  };

  const handleAddPlannedTomorrow = () => {
    if (!plannedTomorrowInput.trim()) return;
    setPlannedTomorrowList(prev => [...prev, plannedTomorrowInput.trim()]);
    setPlannedTomorrowInput("");
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await adminApi.uploadImage(file, "daily-reports");
      const photoUrl = res.url || res.absoluteUrl;
      const currentTimeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      setPhotosList(prev => [...prev, { url: photoUrl, caption: "Site Progress Photo", time: currentTimeStr }]);
      toast.success("Photo attached!");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (workCompletedList.length === 0) {
      toast.error("Please add at least one item under 'Work Completed Today'");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/admin/projects/${project.id}/daily-reports`, {
        date, overall_status: overallStatus, status_notes: statusNotes,
        work_completed: workCompletedList, planned_tomorrow: plannedTomorrowList, photos: photosList,
      });
      toast.success("Daily report submitted! (Awaiting PM Approval)");
      setDate(todayStr); setStatusNotes(""); setWorkCompletedList([]); setPlannedTomorrowList([]); setPhotosList([]);
      setActiveTab("queue");
      await fetchReports();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReport = async (reportId) => {
    try {
      await api.patch(`/admin/projects/${project.id}/daily-reports/${reportId}/approve`);
      toast.success("Report approved & published to client portal!");
      await fetchReports();
    } catch {
      toast.error("Approval failed");
    }
  };

  const handleUnapproveReport = async (reportId) => {
    try {
      await api.patch(`/admin/projects/${project.id}/daily-reports/${reportId}/unapprove`);
      toast.info("Report revoked — hidden from client");
      await fetchReports();
    } catch {
      toast.error("Revoke failed");
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Permanently delete this report?")) return;
    try {
      await api.delete(`/admin/projects/${project.id}/daily-reports/${reportId}`);
      toast.success("Report deleted");
      await fetchReports();
    } catch {
      toast.error("Delete failed");
    }
  };

  const pendingCount = reports.filter(r => !r.is_approved).length;

  return (
    <div className="space-y-4">
      {/* Top Bar Tabs */}
      <div className="flex border-b border-black/5 bg-white px-4 gap-6 rounded-xl shadow-sm">
        <button onClick={() => setActiveTab("queue")} className={`py-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${activeTab === "queue" ? "border-[#FF5A00] text-[#FF5A00]" : "border-transparent text-[#111111]/50 hover:text-[#000F1B]"}`}>
          <span>Report Queue & History ({reports.length})</span>
          {pendingCount > 0 && <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{pendingCount} Pending Approval</span>}
        </button>
        <button onClick={() => setActiveTab("create")} className={`py-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${activeTab === "create" ? "border-[#FF5A00] text-[#FF5A00]" : "border-transparent text-[#111111]/50 hover:text-[#000F1B]"}`}>
          <Plus className="w-4 h-4" /> <span>Log Daily Report (Site Engineer)</span>
        </button>
      </div>

      {activeTab === "create" && (
        <form onSubmit={handleSubmitReport} className="bg-white rounded-xl border border-black/5 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-black/5 pb-3">
            <h3 className="text-sm font-bold text-[#000F1B] uppercase tracking-wider">New Daily Site Report</h3>
            <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">Requires PM Approval before client publication</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1 text-[#000F1B]">Report Date *</label>
              <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-[#000F1B] outline-none focus:ring-2 focus:ring-[#FF5A00]" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1 text-[#000F1B]">Overall Site Status *</label>
              <select value={overallStatus} onChange={e => setOverallStatus(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-[#000F1B] bg-white cursor-pointer outline-none focus:ring-2 focus:ring-[#FF5A00]">
                <option>Work as per plan</option><option>Ahead of schedule</option><option>Slightly delayed</option><option>Impacted by weather</option><option>Material arrival pending</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase mb-1 text-[#000F1B]">Status Briefing / Notes</label>
              <textarea rows={2} value={statusNotes} onChange={e => setStatusNotes(e.target.value)} placeholder="Brief morning notes or site conditions..." className="w-full px-3 py-2 border rounded-xl text-xs resize-none outline-none focus:ring-2 focus:ring-[#FF5A00]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-black/5">
            {/* Work Completed */}
            <div>
              <label className="block text-[10px] font-bold uppercase mb-2 text-[#000F1B]">Work Completed Today *</label>
              <div className="flex gap-2 mb-3">
                <input type="text" value={workCompletedInput} onChange={e => setWorkCompletedInput(e.target.value)} placeholder="e.g. Block work (50%)" className="flex-1 px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#FF5A00]" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddWorkCompleted(); } }} />
                <button type="button" onClick={handleAddWorkCompleted} className="px-4 py-2 bg-[#000F1B] hover:bg-[#FF5A00] text-white rounded-xl text-xs font-bold transition">Add</button>
              </div>
              <div className="space-y-2">
                {workCompletedList.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900">
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /><span>{item}</span></div>
                    <button type="button" onClick={() => setWorkCompletedList(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Planned Tomorrow */}
            <div>
              <label className="block text-[10px] font-bold uppercase mb-2 text-[#000F1B]">Planned Tomorrow</label>
              <div className="flex gap-2 mb-3">
                <input type="text" value={plannedTomorrowInput} onChange={e => setPlannedTomorrowInput(e.target.value)} placeholder="e.g. Service conduits marking" className="flex-1 px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#FF5A00]" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddPlannedTomorrow(); } }} />
                <button type="button" onClick={handleAddPlannedTomorrow} className="px-4 py-2 bg-[#000F1B] hover:bg-[#FF5A00] text-white rounded-xl text-xs font-bold transition">Add</button>
              </div>
              <div className="space-y-2">
                {plannedTomorrowList.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                    <div className="flex items-center gap-2"><Circle className="w-4 h-4 text-slate-400 shrink-0" /><span>{item}</span></div>
                    <button type="button" onClick={() => setPlannedTomorrowList(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-black/5">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-[10px] font-bold uppercase text-[#000F1B]">Attach Today's Photos</label>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FF5A00]/10 hover:bg-[#FF5A00]/20 text-[#FF5A00] rounded-lg text-xs font-bold cursor-pointer transition">
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                <span>Upload Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleUploadPhoto} disabled={uploading} />
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {photosList.map((p, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-black/10 aspect-square bg-black/5">
                  <img src={resolveMediaUrl(p.url)} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setPhotosList(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white grid place-items-center"><X className="w-3.5 h-3.5" /></button>
                  <input type="text" value={p.caption} onChange={e => setPhotosList(prev => prev.map((item, idx) => idx === i ? { ...item, caption: e.target.value } : item))} className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] px-2 py-1 outline-none font-medium" placeholder="Caption..." />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-black/5 flex justify-end gap-2">
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-[#000F1B] hover:bg-[#FF5A00] text-white text-xs font-bold flex items-center gap-2 transition disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Submit for PM Approval
            </button>
          </div>
        </form>
      )}

      {activeTab === "queue" && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-white rounded-xl border border-black/5 p-12 text-center text-xs text-[#111111]/50 italic shadow-sm">
              No daily reports logged yet.
            </div>
          ) : (
            reports.map(rep => {
              const isApproved = rep.is_approved;
              return (
                <div key={rep.id} className={`bg-white rounded-xl border p-5 shadow-sm transition ${isApproved ? "border-emerald-200" : "border-amber-200 bg-amber-50/20"}`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-black/5 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl grid place-items-center font-bold text-xs ${isApproved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        <HardHat className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#000F1B] text-sm">
                            {new Date(rep.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                          </h4>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {isApproved ? "Published to Client" : "Awaiting PM Approval"}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#111111]/50 mt-0.5">Status: <strong>{rep.overall_status}</strong> · By {rep.submitted_by || "Site Engineer"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!isApproved ? (
                        <button onClick={() => handleApproveReport(rep.id)} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4" /> Approve & Publish
                        </button>
                      ) : (
                        <button onClick={() => handleUnapproveReport(rep.id)} className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition">
                          Revoke Approval
                        </button>
                      )}
                      <button onClick={() => handleDeleteReport(rep.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 grid place-items-center hover:bg-red-600 hover:text-white transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-[10px] font-bold text-[#000F1B] uppercase tracking-wider mb-1">Work Completed Today:</div>
                      <ul className="space-y-1 pl-1">
                        {(rep.work_completed || []).map((item, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 text-[#111111]/80 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /><span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {(rep.photos || []).length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold text-[#000F1B] uppercase tracking-wider mb-1">Attached Photos:</div>
                        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                          {rep.photos.map((p, idx) => (
                            <img key={idx} src={resolveMediaUrl(p.url)} alt="" className="w-14 h-14 rounded-lg object-cover border border-black/10 shrink-0" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
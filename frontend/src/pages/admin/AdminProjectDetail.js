import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  ArrowLeft, Loader2, RefreshCw, Activity, ClipboardList,
  Users, CalendarCheck, FileText, FolderOpen, Package, IndianRupee,
  ShieldCheck, Wrench, Video, HardHat, Settings, X, Save
} from "lucide-react";

// Import Tab Components
import OverviewTab from "./project-tabs/OverviewTab";
import StagesTab from "./project-tabs/StagesTab";
import ReportsTab from "./project-tabs/ReportsTab";
import FinanceTab from "./project-tabs/FinanceTab";
import TeamTab from "./project-tabs/TeamTab";
import AttendanceTab from "./project-tabs/AttendanceTab";
import DrawingsTab from "./project-tabs/DrawingsTab";
import DocumentsTab from "./project-tabs/DocumentsTab";
import MaterialsTab from "./project-tabs/MaterialsTab";
import QualityTab from "./project-tabs/QualityTab";
import MaintenanceTab from "./project-tabs/MaintenanceTab";
import CctvTab from "./project-tabs/CctvTab";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000") + "/api";
const api = axios.create({ baseURL: API_BASE, withCredentials: true });

// Flat, SaaS-style tab list mapping exactly to modules
const TABS = [
  { key: "overview", label: "Overview", icon: Activity },
  { key: "stages", label: "Stages & Schedule", icon: ClipboardList },
  { key: "reports", label: "Daily Progress", icon: HardHat },
  { key: "finance", label: "Financials", icon: IndianRupee },
  { key: "team", label: "Team", icon: Users },
  { key: "attendance", label: "Attendance", icon: CalendarCheck },
  { key: "drawings", label: "Drawings", icon: FileText },
  { key: "documents", label: "Documents", icon: FolderOpen },
  { key: "materials", label: "Materials", icon: Package },
  { key: "quality", label: "Quality", icon: ShieldCheck },
  { key: "maintenance", label: "Maintenance", icon: Wrench },
  { key: "cctv", label: "CCTV Feeds", icon: Video },
];

export default function AdminProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditInfo, setShowEditInfo] = useState(false);

  const loadProject = useCallback(async () => {
    try {
      const { data } = await api.get(`/admin/projects/${projectId}`);
      setProject(data);
    } catch (err) {
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProject();
    toast.success("Project data refreshed");
  };

  const switchTab = (key) => {
    setSearchParams({ tab: key });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6F8]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF5A00]" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F6F8]">
        <h1 className="text-xl font-bold text-[#000F1B] mb-4">Project not found</h1>
        <button onClick={() => navigate("/admin/projects")} className="px-5 py-2 bg-[#FF5A00] text-white text-sm font-bold rounded-lg transition hover:bg-[#FF2D00]">
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Formatting helpers
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "TBD";
  
  // Notification counts
  const pendingReports = (project.daily_reports || []).filter(r => !r.is_approved).length;
  const pendingDrawings = (project.drawings || []).filter(d => d.status === "pending").length;
  const pendingMaterials = (project.materials || []).filter(m => m.status === "pending").length;

  const getBadgeCount = (key) => {
    if (key === "reports") return pendingReports;
    if (key === "drawings") return pendingDrawings;
    if (key === "materials") return pendingMaterials;
    return 0;
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-['Poppins'] flex flex-col">
      
      {/* ============================================
          SAAS-STYLE SEAMLESS HEADER
      ============================================ */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        
        {/* Top Utility Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2 border-b border-gray-100 bg-gray-50/50">
          <button onClick={() => navigate("/admin/projects")} className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-[#FF5A00] transition">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Project List
          </button>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setShowEditInfo(true)} className="px-3 py-1.5 rounded bg-white border border-gray-200 hover:bg-gray-50 flex items-center gap-1.5 text-[10px] font-bold text-gray-700 transition shadow-sm">
              <Settings className="w-3 h-3" /> Edit Settings
            </button>
            <button onClick={handleRefresh} disabled={refreshing} className="px-3 py-1.5 rounded bg-white border border-gray-200 hover:bg-gray-50 flex items-center gap-1.5 text-[10px] font-bold text-gray-700 transition shadow-sm disabled:opacity-60">
              <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin text-[#FF5A00]" : ""}`} />
              {refreshing ? "Syncing..." : "Sync"}
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 pt-5">
          {/* Title & Status */}
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{project.title}</h1>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${project.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
              {project.status || "Active"}
            </span>
          </div>

          {/* Project Meta Data Strip (Matches reference image) */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 font-medium mb-6">
            <span className="font-mono text-gray-400">{project.project_code || "No Code"}</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-700 font-semibold">{project.customer_name || "No Client Assigned"}</span>
            <span className="text-gray-300">|</span>
            <span>{project.address || "Location pending"}</span>
            <span className="text-gray-300">|</span>
            <span>Start: <strong className="text-gray-700 font-semibold">{fmtDate(project.start_date || project.created_at)}</strong></span>
            <span className="text-gray-300">|</span>
            <span>Expected: <strong className="text-gray-700 font-semibold">{fmtDate(project.expected_completion)}</strong></span>
          </div>

          {/* Flat Horizontal Tabs */}
          <div className="flex overflow-x-auto no-scrollbar gap-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              const badge = getBadgeCount(tab.key);

              return (
                <button
                  key={tab.key}
                  onClick={() => switchTab(tab.key)}
                  className={`flex items-center gap-2 px-4 pb-3 border-b-2 transition-colors whitespace-nowrap ${
                    isActive 
                      ? "border-[#FF5A00] text-[#000F1B]" 
                      : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#FF5A00]" : ""}`} />
                  <span className="text-sm font-semibold">{tab.label}</span>
                  {badge > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-[10px] font-black rounded-full px-1.5 py-0.5 grid place-items-center shadow-sm">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ============================================
          MAIN WORKSPACE
      ============================================ */}
      <main className="flex-1 p-4 sm:p-6 w-full max-w-[1600px] mx-auto min-w-0">
        {activeTab === "overview" && <OverviewTab project={project} onSaved={loadProject} />}
        {activeTab === "stages" && <StagesTab project={project} onSaved={loadProject} />}
        {activeTab === "reports" && <ReportsTab project={project} onSaved={loadProject} />}
        {activeTab === "finance" && <FinanceTab project={project} onSaved={loadProject} />}
        {activeTab === "team" && <TeamTab project={project} onSaved={loadProject} />}
        {activeTab === "attendance" && <AttendanceTab project={project} onSaved={loadProject} />}
        {activeTab === "drawings" && <DrawingsTab project={project} onSaved={loadProject} />}
        {activeTab === "documents" && <DocumentsTab project={project} onSaved={loadProject} />}
        {activeTab === "materials" && <MaterialsTab project={project} onSaved={loadProject} />}
        {activeTab === "quality" && <QualityTab project={project} onSaved={loadProject} />}
        {activeTab === "maintenance" && <MaintenanceTab project={project} onSaved={loadProject} />}
        {activeTab === "cctv" && <CctvTab project={project} onSaved={loadProject} />}
      </main>

      {/* ============================================
          MODALS
      ============================================ */}
      {showEditInfo && (
        <EditInfoModal 
          project={project} 
          onClose={() => setShowEditInfo(false)} 
          onSaved={() => { setShowEditInfo(false); loadProject(); }} 
        />
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Edit Basic Info Modal Component
// ------------------------------------------------------------------
function EditInfoModal({ project, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: project.title || "", 
    address: project.address || "",
    status: project.status || "active",
    contract_value: project.contract_value || 0, 
    amount_spent: project.amount_spent || 0,
    site_lat: project.site_lat || "",
    site_lng: project.site_lng || "",
    start_date: project.start_date ? String(project.start_date).slice(0, 10) : (project.created_at ? String(project.created_at).slice(0, 10) : ""),
    expected_completion: project.expected_completion ? String(project.expected_completion).slice(0, 10) : ""
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/projects/${project.id}`, { 
        ...form, 
        contract_value: Number(form.contract_value) || 0, 
        amount_spent: Number(form.amount_spent) || 0,
        site_lat: form.site_lat ? Number(form.site_lat) : null,
        site_lng: form.site_lng ? Number(form.site_lng) : null,
        start_date: form.start_date || null,
        expected_completion: form.expected_completion || null
      });
      toast.success("Project settings updated"); 
      onSaved();
    } catch { 
      toast.error("Update failed"); 
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-[#000F1B]/60 backdrop-blur-sm z-[100] grid place-items-center p-4 font-['Poppins']">
      <div className="bg-white rounded-2xl w-full max-w-lg p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <div className="font-bold text-gray-900 text-lg">Edit Project Metadata</div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 grid place-items-center text-gray-500 transition"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Project Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none transition" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Site Address</label>
            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 outline-none transition" />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Project Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold focus:border-blue-500 outline-none cursor-pointer">
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Project Start</label>
              <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Forecast Completion</label>
              <input type="date" value={form.expected_completion} onChange={e => setForm({ ...form, expected_completion: e.target.value })} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Contract (₹)</label>
              <input type="number" value={form.contract_value} onChange={e => setForm({ ...form, contract_value: e.target.value })} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Amount Paid (₹)</label>
              <input type="number" value={form.amount_spent} onChange={e => setForm({ ...form, amount_spent: e.target.value })} className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 focus:border-emerald-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="col-span-2"><span className="text-[10px] font-bold uppercase text-gray-700">Live Weather Coordinates</span></div>
            <div>
              <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Latitude</label>
              <input type="number" step="any" value={form.site_lat} onChange={e => setForm({ ...form, site_lat: e.target.value })} placeholder="12.9716" className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Longitude</label>
              <input type="number" step="any" value={form.site_lng} onChange={e => setForm({ ...form, site_lng: e.target.value })} placeholder="77.5946" className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none" />
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-bold transition shadow-sm disabled:opacity-60">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Updates
          </button>
        </div>
      </div>
    </div>
  );
}
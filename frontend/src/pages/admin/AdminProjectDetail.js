import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  ArrowLeft, Loader2, RefreshCw, Activity, ClipboardList,
  Users, CalendarCheck, FileText, FolderOpen, Package, IndianRupee,
  ShieldCheck, Wrench, Video, HardHat, Settings, X, Save
} from "lucide-react";

// Tab Imports
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

const TAB_COMPONENTS = {
  overview: OverviewTab, stages: StagesTab, reports: ReportsTab,
  finance: FinanceTab, team: TeamTab, attendance: AttendanceTab,
  drawings: DrawingsTab, documents: DocumentsTab, materials: MaterialsTab,
  quality: QualityTab, maintenance: MaintenanceTab, cctv: CctvTab
};

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

  useEffect(() => { loadProject(); }, [loadProject]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProject();
    toast.success("Project data refreshed");
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "TBD";

  const badgeCounts = useMemo(() => ({
    reports: project?.daily_reports?.filter(r => !r.is_approved).length || 0,
    drawings: project?.drawings?.filter(d => d.status === "pending").length || 0,
    materials: project?.materials?.filter(m => m.status === "pending").length || 0,
  }), [project]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6F8]">
        <Loader2 className="w-6 h-6 animate-spin text-[#FF5A00]" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F6F8]">
        <h1 className="text-lg font-bold text-[#000F1B] mb-2">Project not found</h1>
        <button onClick={() => navigate("/admin/projects")} className="px-4 py-1.5 bg-[#FF5A00] text-white text-xs font-bold rounded-md hover:bg-[#FF2D00] transition">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const ActiveComponent = TAB_COMPONENTS[activeTab] || OverviewTab;

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-['Poppins'] flex flex-col text-xs">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center justify-between px-3 sm:px-5 py-1.5 border-b border-gray-100 bg-gray-50/50">
          <button onClick={() => navigate("/admin/projects")} className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-[#FF5A00] transition">
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          
          <div className="flex items-center gap-1.5">
            <button onClick={() => setShowEditInfo(true)} className="px-2 py-1 rounded bg-white border border-gray-200 hover:bg-gray-50 flex items-center gap-1 text-[10px] font-semibold text-gray-700 shadow-2xs">
              <Settings className="w-3 h-3" /> Edit Settings
            </button>
            <button onClick={handleRefresh} disabled={refreshing} className="px-2 py-1 rounded bg-white border border-gray-200 hover:bg-gray-50 flex items-center gap-1 text-[10px] font-semibold text-gray-700 shadow-2xs disabled:opacity-60">
              <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin text-[#FF5A00]" : ""}`} />
              {refreshing ? "Syncing..." : "Sync"}
            </button>
          </div>
        </div>

        <div className="px-3 sm:px-5 pt-2.5">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight leading-none">{project.title}</h1>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border bg-emerald-50 text-emerald-700 border-emerald-200">
              {project.status || "Active"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 font-medium mb-2.5">
            <span className="font-mono text-gray-400">{project.project_code || "No Code"}</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-700 font-semibold">{project.customer_name || "No Client Assigned"}</span>
            <span className="text-gray-300">•</span>
            <span>{project.address || "Location pending"}</span>
            <span className="text-gray-300">•</span>
            <span>Start: <strong className="text-gray-700">{fmtDate(project.start_date || project.created_at)}</strong></span>
            <span className="text-gray-300">•</span>
            <span>Expected: <strong className="text-gray-700">{fmtDate(project.expected_completion)}</strong></span>
          </div>

          {/* TABS */}
          <div className="flex overflow-x-auto no-scrollbar gap-0.5">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              const badge = badgeCounts[tab.key] || 0;

              return (
                <button
                  key={tab.key}
                  onClick={() => setSearchParams({ tab: tab.key })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 transition-colors whitespace-nowrap text-xs ${
                    isActive ? "border-[#FF5A00] text-[#000F1B] font-bold" : "border-transparent text-gray-500 font-medium hover:text-gray-800 hover:border-gray-200"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#FF5A00]" : ""}`} />
                  <span>{tab.label}</span>
                  {badge > 0 && (
                    <span className="ml-0.5 bg-red-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.2 grid place-items-center">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* WORKSPACE */}
      <main className="flex-1 p-3 sm:p-5 w-full max-w-[1600px] mx-auto min-w-0">
        <ActiveComponent project={project} onSaved={loadProject} />
      </main>

      {/* EDIT MODAL */}
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

// EDIT MODAL COMPONENT
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

  const Field = ({ label, name, type = "text", ...props }) => (
    <div>
      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        className="w-full rounded border border-gray-200 bg-white px-2.5 py-1 text-xs focus:border-blue-500 outline-none transition"
        {...props}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#000F1B]/60 backdrop-blur-xs z-[100] grid place-items-center p-3 font-['Poppins']">
      <div className="bg-white rounded-xl w-full max-w-md p-4 shadow-xl relative max-h-[90vh] overflow-y-auto text-xs">
        <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
          <span className="font-bold text-gray-900 text-sm">Edit Project Metadata</span>
          <button onClick={onClose} className="w-6 h-6 rounded hover:bg-gray-100 grid place-items-center text-gray-500 transition"><X className="w-3.5 h-3.5" /></button>
        </div>

        <div className="space-y-2.5">
          <Field label="Project Title" name="title" />
          <Field label="Site Address" name="address" />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium focus:border-blue-500 outline-none cursor-pointer">
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
            <Field label="Project Start" name="start_date" type="date" />
            <Field label="Forecast Completion" name="expected_completion" type="date" />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
            <Field label="Total Contract (₹)" name="contract_value" type="number" />
            <Field label="Amount Paid (₹)" name="amount_spent" type="number" />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 bg-gray-50 p-2 rounded border border-gray-200">
            <span className="col-span-2 text-[9px] font-bold uppercase text-gray-700">Live Weather Coordinates</span>
            <Field label="Latitude" name="site_lat" type="number" step="any" placeholder="12.9716" />
            <Field label="Longitude" name="site_lng" type="number" step="any" placeholder="77.5946" />
          </div>
        </div>

        <div className="mt-4 pt-2.5 border-t border-gray-100 flex items-center justify-end gap-1.5">
          <button onClick={onClose} className="rounded border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 text-xs font-semibold transition disabled:opacity-60">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save Updates
          </button>
        </div>
      </div>
    </div>
  );
}
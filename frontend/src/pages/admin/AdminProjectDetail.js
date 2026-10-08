import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";

// Core imports from lucide-react with fallback safety
import * as LucideIcons from "lucide-react";

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

// Safe icon extractor helper
const getIcon = (name, FallbackSvg) => {
  const IconComponent = LucideIcons[name];
  if (IconComponent) return IconComponent;
  return FallbackSvg || (() => null);
};

// Safe Icons with built-in SVG fallbacks
const ArrowLeft = getIcon("ArrowLeft");
const Loader2 = getIcon("Loader2");
const RefreshCw = getIcon("RefreshCw");
const Activity = getIcon("Activity");
const ClipboardList = getIcon("ClipboardList");
const Users = getIcon("Users");
const CalendarCheck = getIcon("CalendarCheck");
const FileText = getIcon("FileText");
const FolderOpen = getIcon("FolderOpen");
const Package = getIcon("Package");
const IndianRupee = getIcon("IndianRupee");
const ShieldCheck = getIcon("ShieldCheck");
const Wrench = getIcon("Wrench");
const Video = getIcon("Video");
const HardHat = getIcon("HardHat");
const Settings = getIcon("Settings");
const X = getIcon("X");
const Save = getIcon("Save");

const Clock = getIcon("Clock", (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
));

const ChevronDown = getIcon("ChevronDown", (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
));

const User = getIcon("User", (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
));

const Lock = getIcon("Lock", (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
));

const Crown = getIcon("Crown", (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-5-4 7-6-7zm3 16h14"/></svg>
));

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
  const [showAuditDropdown, setShowAuditDropdown] = useState(false);

  const [hasEditAccess, setHasEditAccess] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null); // 'admin' | 'manager' | 'viewer'
  const dropdownRef = useRef(null);

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

  // ACCESS CONTROL: Super Admin OR assigned Project Manager gets edit access
  useEffect(() => {
    if (!project) return;
    Promise.all([adminApi.me(), adminApi.list("team")])
      .then(([user, staffList]) => {
        if (user?.role === "admin") {
          setHasEditAccess(true);
          setCurrentUserRole("admin");
        } else {
          const userStaff = (Array.isArray(staffList) ? staffList : []).find(
            s => s.email?.toLowerCase() === user?.email?.toLowerCase()
          );
          if (userStaff && project.manager_id === userStaff.id) {
            setHasEditAccess(true);
            setCurrentUserRole("manager");
          } else {
            setHasEditAccess(false);
            setCurrentUserRole("viewer");
          }
        }
      })
      .catch(() => {
        setHasEditAccess(false);
        setCurrentUserRole("viewer");
      });
  }, [project]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowAuditDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProject();
    toast.success("Project data refreshed");
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "TBD";

  const badgeCounts = useMemo(() => ({
    reports: project?.daily_reports?.filter(r => !r.is_approved).length || 0,
    drawings: project?.drawings?.filter(d => d.status === "pending").length || 0,
    materials: project?.materials?.filter(m => m.status === "pending").length || 0,
  }), [project]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6F8]">
        <Loader2 className="w-6 h-6 animate-spin text-[#FF6600]" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F6F8]">
        <h1 className="text-lg font-bold text-[#000F1B] mb-2">Project not found</h1>
        <button onClick={() => navigate("/admin/projects")} className="px-4 py-1.5 bg-[#FF6600] text-white text-xs font-bold rounded-md hover:bg-[#FF0000] transition">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const ActiveComponent = TAB_COMPONENTS[activeTab] || OverviewTab;
  const activities = project.activities || [];
  const locationString = [project.address, project.city, project.state, project.pincode].filter(Boolean).join(", ") || "Location pending";

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-['Poppins'] flex flex-col text-xs">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center justify-between px-3 sm:px-5 py-1.5 border-b border-gray-100 bg-gray-50/50">
          <button onClick={() => navigate("/admin/projects")} className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-[#FF6600] transition">
            <ArrowLeft className="w-3 h-3" /> Back
          </button>

          <div className="flex items-center gap-1.5">
            {/* Activity Log Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowAuditDropdown(!showAuditDropdown)}
                className="px-2.5 py-1 rounded bg-white border border-gray-200 hover:bg-gray-50 flex items-center gap-1.5 text-[10px] font-bold text-gray-700 shadow-2xs cursor-pointer"
              >
                <Clock className="w-3 h-3 text-[#FF6600]" />
                <span>Activity Log</span>
                <span className="bg-[#FF6600]/10 text-[#FF6600] px-1 rounded text-[9px] font-black">{activities.length}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {showAuditDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden font-['Poppins']">
                  <div className="px-4 py-2.5 bg-[#000F1B] text-white flex items-center justify-between">
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#FF6600]" /> Project Edits & Activity Log
                    </div>
                    <span className="text-[9px] font-semibold text-gray-400">{activities.length} total events</span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {activities.length === 0 ? (
                      <div className="p-6 text-center text-gray-400 text-xs">No activity recorded yet.</div>
                    ) : (
                      activities.slice().reverse().map((act, idx) => (
                        <div key={act.id || idx} className="p-3 hover:bg-gray-50 transition">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[#000F1B] text-[11px] flex items-center gap-1">
                              <User className="w-3 h-3 text-[#FF6600]" /> {act.user_name || "Admin"}
                            </span>
                            <span className="text-[9px] text-gray-400 font-mono">
                              {act.timestamp ? new Date(act.timestamp).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "—"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 font-medium leading-relaxed">{act.action}</p>
                          {act.module && (
                            <span className="inline-block mt-1 text-[8px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded">
                              {act.module}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {hasEditAccess && (
              <button onClick={() => setShowEditInfo(true)} className="px-2 py-1 rounded bg-white border border-gray-200 hover:bg-gray-50 flex items-center gap-1 text-[10px] font-semibold text-gray-700 shadow-2xs">
                <Settings className="w-3 h-3" /> Edit Settings
              </button>
            )}

            <button onClick={handleRefresh} disabled={refreshing} className="px-2 py-1 rounded bg-white border border-gray-200 hover:bg-gray-50 flex items-center gap-1 text-[10px] font-semibold text-gray-700 shadow-2xs disabled:opacity-60">
              <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin text-[#FF6600]" : ""}`} />
              {refreshing ? "Syncing..." : "Sync"}
            </button>
          </div>
        </div>

        <div className="px-3 sm:px-5 pt-2.5">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight leading-none">{project.title}</h1>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border bg-emerald-50 text-emerald-700 border-emerald-200">
              {project.status || "Active"}
            </span>

            {currentUserRole === "admin" && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border bg-[#FF6600]/10 text-[#FF6600] border-[#FF6600]/30 flex items-center gap-1">
                <Crown className="w-2.5 h-2.5" /> Super Admin
              </span>
            )}
            {currentUserRole === "manager" && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" /> Project Manager
              </span>
            )}
            {currentUserRole === "viewer" && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border bg-slate-50 text-slate-500 border-slate-200 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> View Only
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 font-medium mb-2.5">
            <span className="font-mono text-gray-400">{project.project_code || "No Code"}</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-700 font-semibold">{project.customer_name || "No Client Assigned"}</span>
            <span className="text-gray-300">•</span>
            <span>{locationString}</span>
            <span className="text-gray-300">•</span>
            <span>Start: <strong className="text-gray-700">{fmtDate(project.start_date || project.created_at)}</strong></span>
            <span className="text-gray-300">•</span>
            <span>Expected: <strong className="text-gray-700">{fmtDate(project.expected_completion)}</strong></span>
          </div>

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
                    isActive ? "border-[#FF6600] text-[#000F1B] font-bold" : "border-transparent text-gray-500 font-medium hover:text-gray-800 hover:border-gray-200"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#FF6600]" : ""}`} />
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

      <main className="flex-1 p-3 sm:p-5 w-full max-w-[1600px] mx-auto min-w-0">
        {ActiveComponent ? (
          <ActiveComponent project={project} onSaved={loadProject} hasEditAccess={hasEditAccess} />
        ) : (
          <OverviewTab project={project} onSaved={loadProject} hasEditAccess={hasEditAccess} />
        )}
      </main>

      {showEditInfo && hasEditAccess && (
        <EditInfoModal
          project={project}
          onClose={() => setShowEditInfo(false)}
          onSaved={() => { setShowEditInfo(false); loadProject(); }}
        />
      )}
    </div>
  );
}

function Field({ label, name, type = "text", value, onChange, onBlur, numericOnly = false, ...props }) {
  return (
    <div>
      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={(e) => {
          let v = e.target.value;
          if (numericOnly) v = v.replace(/[^0-9]/g, "");
          onChange(name, v);
        }}
        onBlur={
          type === "date"
            ? (e) => {
                const corrected = sanitizeDateYear(e.target.value);
                if (corrected !== e.target.value) onChange(name, corrected);
                onBlur?.(e);
              }
            : onBlur
        }
        onClick={
          type === "date"
            ? (e) => {
                try {
                  e.target.showPicker();
                } catch {}
              }
            : undefined
        }
        min={type === "date" ? "2020-01-01" : undefined}
        max={type === "date" ? "2099-12-31" : undefined}
        inputMode={numericOnly ? "numeric" : type === "number" ? "decimal" : undefined}
        className="w-full rounded border border-gray-200 bg-white px-2.5 py-1 text-xs focus:border-blue-500 outline-none transition no-spinner"
        {...props}
      />
    </div>
  );
}

function EditInfoModal({ project, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: project.title || "",
    address: project.address || "",
    city: project.city || "",
    state: project.state || "",
    pincode: project.pincode || "",
    status: project.status || "active",
    contract_value: project.contract_value != null ? String(project.contract_value) : "",
    amount_spent: project.amount_spent != null ? String(project.amount_spent) : "",
    site_lat: project.site_lat != null ? String(project.site_lat) : "",
    site_lng: project.site_lng != null ? String(project.site_lng) : "",
    project_agreed_date: project.project_agreed_date ? String(project.project_agreed_date).slice(0, 10) : "",
    start_date: project.start_date ? String(project.start_date).slice(0, 10) : project.created_at ? String(project.created_at).slice(0, 10) : "",
    expected_completion: project.expected_completion ? String(project.expected_completion).slice(0, 10) : "",
    actual_completion_date: project.actual_completion_date ? String(project.actual_completion_date).slice(0, 10) : "",
  });
  const [saving, setSaving] = useState(false);

  const setField = useCallback((name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
  }, []);

  const save = async () => {
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
      await api.put(`/admin/projects/${project.id}`, {
        ...form,
        contract_value: Number(form.contract_value) || 0,
        amount_spent: Number(form.amount_spent) || 0,
        site_lat: form.site_lat === "" ? null : Number(form.site_lat),
        site_lng: form.site_lng === "" ? null : Number(form.site_lng),
        project_agreed_date: sanitizeDateYear(form.project_agreed_date) || null,
        start_date: sanitizeDateYear(form.start_date) || null,
        expected_completion: sanitizeDateYear(form.expected_completion) || null,
        actual_completion_date: sanitizeDateYear(form.actual_completion_date) || null,
      });
      toast.success("Project settings updated and activity logged");
      onSaved();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#000F1B]/60 backdrop-blur-xs z-[100] grid place-items-center p-3 font-['Poppins']">
      <div className="bg-white rounded-xl w-full max-w-lg p-4 shadow-xl relative max-h-[90vh] overflow-y-auto text-xs">
        <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
          <span className="font-bold text-gray-900 text-sm">Edit Project Metadata</span>
          <button onClick={onClose} className="w-6 h-6 rounded hover:bg-gray-100 grid place-items-center text-gray-500 transition">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          <Field label="Project Title" name="title" value={form.title} onChange={setField} />

          <Field label="Street Address" name="address" value={form.address} onChange={setField} />

          <div className="grid grid-cols-2 gap-2">
            <Field label="City (Alpha Only)" name="city" value={form.city} onChange={(n, v) => setField(n, v.replace(/[^A-Za-z\s]/g, ""))} />
            <Field label="State (Alpha Only)" name="state" value={form.state} onChange={(n, v) => setField(n, v.replace(/[^A-Za-z\s]/g, ""))} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Pincode (6 Digits)" name="pincode" value={form.pincode} maxLength={6} onChange={(n, v) => setField(n, v.replace(/\D/g, "").slice(0, 6))} />
            <div>
              <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
                className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <span className="block text-[9px] font-bold uppercase text-gray-700 mb-2">Project Dates</span>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Agreed Date" name="project_agreed_date" type="date" value={form.project_agreed_date} onChange={setField} />
              <Field label="Start Date" name="start_date" type="date" value={form.start_date} onChange={setField} />
              <Field label="Forecast End" name="expected_completion" type="date" value={form.expected_completion} onChange={setField} />
              <Field label="Actual Handover" name="actual_completion_date" type="date" value={form.actual_completion_date} onChange={setField} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
            <Field label="Total Contract (₹)" name="contract_value" type="text" numericOnly value={form.contract_value} onChange={setField} placeholder="0" />
            <Field label="Amount Paid (₹)" name="amount_spent" type="text" numericOnly value={form.amount_spent} onChange={setField} placeholder="0" />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 bg-gray-50 p-2 rounded border border-gray-200">
            <span className="col-span-2 text-[9px] font-bold uppercase text-gray-700">Live Weather Coordinates</span>
            <Field label="Latitude" name="site_lat" type="text" value={form.site_lat} onChange={(name, v) => setField(name, v.replace(/[^0-9.\-]/g, ""))} placeholder="12.9716" />
            <Field label="Longitude" name="site_lng" type="text" value={form.site_lng} onChange={(name, v) => setField(name, v.replace(/[^0-9.\-]/g, ""))} placeholder="77.5946" />
          </div>
        </div>

        <div className="mt-4 pt-2.5 border-t border-gray-100 flex items-center justify-end gap-1.5">
          <button onClick={onClose} className="rounded border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 text-xs font-semibold transition disabled:opacity-60">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save Updates
          </button>
        </div>
      </div>
    </div>
  );
}
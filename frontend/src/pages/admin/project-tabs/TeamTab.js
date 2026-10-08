import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { adminApi } from "@/lib/api";
import { User, Check, Loader2, Save, Mail, Lock, ShieldCheck, Crown } from "lucide-react";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000") + "/api";
const api = axios.create({ baseURL: API_BASE, withCredentials: true });

export default function TeamTab({ project, onSaved, hasEditAccess = true }) {
  const [allStaff, setAllStaff] = useState([]);
  const [managerId, setManagerId] = useState(project.manager_id || "");
  const [selectedIds, setSelectedIds] = useState(project.team_ids || []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelectedIds(project.team_ids || []);
    setManagerId(project.manager_id || "");
  }, [project]);

  useEffect(() => {
    adminApi
      .list("team")
      .then((res) => setAllStaff(Array.isArray(res) ? res : []))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load staff list");
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleSelect = (id) => {
    if (!hasEditAccess) {
      toast.error("Security Lock: You are not authorized to modify team assignments.");
      return;
    }
    // Prevent selecting the manager in the working team list
    if (id === managerId) {
      toast.info("This person is already the Project Manager.");
      return;
    }
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleManagerChange = (newId) => {
    if (!hasEditAccess) {
      toast.error("Security Lock: You cannot change the Project Manager.");
      return;
    }
    setManagerId(newId);
    // Remove new manager from working team if present
    setSelectedIds(prev => prev.filter(id => id !== newId));
  };

  const handleSave = async () => {
    if (!hasEditAccess) {
      toast.error("Security Lock: You do not have permissions to save changes.");
      return;
    }
    setSaving(true);
    try {
      await api.put(`/admin/projects/${project.id}`, {
        manager_id: managerId || null,
        team_ids: selectedIds,
      });
      toast.success("Project team assignments saved successfully!");
      onSaved();
    } catch {
      toast.error("Failed to update project team");
    } finally {
      setSaving(false);
    }
  };

  const currentManager = allStaff.find(s => s.id === managerId);

  return (
    <div className="bg-white rounded-xl border border-black/5 shadow-sm p-5 max-w-5xl mx-auto font-['Poppins']">
      <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-4 flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#000F1B]">Project Team Management</h3>
            {hasEditAccess ? (
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 text-[9px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" /> Full Edit Rights
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 text-[9px] font-bold flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> View Only
              </span>
            )}
          </div>
          <p className="text-[10px] text-[#111111]/50 mt-1">
            Assign a Project Manager (full edit access) and supporting staff (view access).
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !hasEditAccess}
          className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#FF6600] hover:bg-[#FF0000] rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}{" "}
          Save Assignments
        </button>
      </div>

      {/* ★ MANAGER SELECTION SECTION */}
      <div className="mb-6 bg-gradient-to-br from-[#FF6600]/5 to-amber-50 border border-[#FF6600]/20 p-4 rounded-xl">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div>
            <label className="block text-xs font-bold text-[#000F1B] uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-[#FF6600]" /> Primary Project Manager
            </label>
            <p className="text-[10px] text-gray-600 mt-0.5">
              This person has full edit rights across all project modules and acts as the main point of contact for the client.
            </p>
          </div>
        </div>

        {currentManager && (
          <div className="flex items-center gap-3 mb-3 bg-white p-3 rounded-lg border border-[#FF6600]/20 shadow-xs">
            {currentManager.photo ? (
              <img src={resolveMediaUrl(currentManager.photo)} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-[#FF6600]" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#FF6600] text-white grid place-items-center shrink-0">
                <Crown className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-[#000F1B] truncate">{currentManager.name}</div>
              <div className="text-[10px] font-bold text-[#FF6600] uppercase tracking-wider">{currentManager.designation || currentManager.role || "Staff"}</div>
              {currentManager.email && <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5"><Mail className="w-2.5 h-2.5" /> {currentManager.email}</div>}
            </div>
          </div>
        )}

        <select
          value={managerId}
          onChange={(e) => handleManagerChange(e.target.value)}
          disabled={!hasEditAccess}
          className="w-full rounded-lg border border-black/10 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-[#FF6600] disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
        >
          <option value="">-- Select Project Manager --</option>
          {allStaff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.designation || s.role || "Staff"}) {s.email ? `• ${s.email}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* ★ WORKING TEAM SECTION */}
      <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h4 className="text-xs font-bold text-[#000F1B] uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#000F1B]" /> On-Site Working Team
          </h4>
          <p className="text-[10px] text-gray-500 mt-0.5">
            Supporting staff visible to the client dashboard. They can view but not edit project data.
          </p>
        </div>
        <span className="text-[10px] font-bold bg-[#000F1B] text-white px-2 py-0.5 rounded">
          {selectedIds.length} selected
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF6600]" />
          </div>
        ) : allStaff.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-gray-400 italic">
            No staff members available. Add team members from Admin → Team.
          </div>
        ) : (
          allStaff.map((staff) => {
            const isSelected = selectedIds.includes(staff.id);
            const isManager = staff.id === managerId;

            return (
              <div
                key={staff.id}
                onClick={() => toggleSelect(staff.id)}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition relative ${
                  !hasEditAccess ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
                } ${
                  isManager
                    ? "border-[#FF6600]/50 bg-[#FF6600]/10 cursor-not-allowed"
                    : isSelected
                    ? "border-[#000F1B] bg-[#000F1B]/5 ring-1 ring-[#000F1B]/20"
                    : "border-black/10 bg-white hover:border-black/20"
                }`}
              >
                {isManager && (
                  <span className="absolute -top-2 -right-2 bg-[#FF6600] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                    <Crown className="w-2.5 h-2.5" /> PM
                  </span>
                )}

                <div className="flex items-center gap-3 min-w-0">
                  {staff.photo ? (
                    <img
                      src={resolveMediaUrl(staff.photo)}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-black/10 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#000F1B] text-white grid place-items-center shrink-0">
                      <User className="w-5 h-5 text-white/60" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-[#000F1B] truncate">{staff.name}</div>
                    <div className="text-[9px] text-[#111111]/50 truncate font-semibold mt-0.5">
                      {staff.designation || staff.role}
                    </div>
                    {staff.email && (
                      <div className="text-[9px] text-[#FF6600] truncate font-medium flex items-center gap-1 mt-0.5">
                        <Mail className="w-2.5 h-2.5" /> {staff.email}
                      </div>
                    )}
                  </div>
                </div>

                {!isManager && (
                  <div
                    className={`w-5 h-5 rounded grid place-items-center shrink-0 transition ${
                      isSelected ? "bg-[#000F1B] text-white" : "border border-black/20 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function Users(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
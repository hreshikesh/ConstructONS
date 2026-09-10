/**
 * AdminProjects — admin cockpit for customer projects.
 * List, create, edit stages, and assign team members inline.
 */
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import {
  Plus, Trash2, Save, X, Loader2, RefreshCw, Building2, ClipboardList,
  CheckCircle2, PlayCircle, Circle, Camera, Users, User, Check, CalendarCheck
} from "lucide-react";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000") + "/api";
const api = axios.create({ baseURL: API_BASE, withCredentials: true });

const PR = {
  list: () => api.get("/admin/projects").then(r => r.data),
  create: (body) => api.post("/admin/projects", body).then(r => r.data),
  remove: (id) => api.delete(`/admin/projects/${id}`).then(r => r.data),
  patchStage: (id, index, body) => api.patch(`/admin/projects/${id}/stages/${index}`, body).then(r => r.data),
  update: (id, body) => api.put(`/admin/projects/${id}`, body).then(r => r.data),
};

export default function AdminProjects() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [assigningTeam, setAssigningTeam] = useState(null);
  const [markingAttendance, setMarkingAttendance] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await PR.list()); }
    catch { toast.error("Failed to load projects"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (row) => {
    if (!window.confirm(`Delete ${row.title}?`)) return;
    try { await PR.remove(row.id); toast.success("Deleted"); load(); }
    catch { toast.error("Delete failed"); }
  };

  if (loading) return <div className="grid place-items-center py-24"><Loader2 className="w-6 h-6 animate-spin text-[#FF5A00]" /></div>;

  return (
    <div className="max-w-6xl mx-auto font-['Poppins']" data-testid="admin-projects">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="text-xs font-semibold text-[#FF5A00] uppercase tracking-wider">Operations · Project Tracker</div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#000F1B] mt-1">Customer Projects</h1>
          <p className="text-sm text-[#111111]/60 mt-1">Manage every customer's project timeline and assigned team. Updates reflect instantly on their portal.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="px-4 py-2 text-xs font-semibold text-[#000F1B] bg-white border border-black/10 rounded-xl hover:bg-[#F2F2F2] flex items-center gap-1.5"><RefreshCw className="w-4 h-4" /> Refresh</button>
          <button onClick={() => setShowCreate(true)} data-testid="proj-new-btn" className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF5A00] text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#FF2D00] transition">
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-white border border-black/5 shadow-sm p-10 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#FF5A00]/10 grid place-items-center"><Building2 className="w-7 h-7 text-[#FF5A00]" /></div>
          <div className="mt-4 font-semibold text-[#000F1B]">No projects yet</div>
          <p className="text-sm text-[#111111]/60 mt-1">Click "New Project" to create a tracker for a customer.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(p => {
            const done = p.stages.filter(s => s.status === "completed").length;
            const pct = Math.round((done / p.stages.length) * 100);
            const teamCount = (p.team_ids || []).length;
            return (
              <div key={p.id} className="rounded-2xl bg-white border border-black/5 shadow-sm p-5" data-testid={`proj-row-${p.id}`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-[#000F1B] text-base">{p.title}</div>
                      {p.project_code && (
                        <span className="text-[10px] font-mono font-bold bg-black/5 text-[#000F1B] px-2 py-0.5 rounded">
                          {p.project_code}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#111111]/60 mt-0.5">{p.customer_name} · {p.customer_email}</div>
                    {p.address && <div className="text-xs text-[#111111]/50">{p.address}</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-[#111111]/50 font-semibold">Progress</div>
                    <div className="font-bold text-[#FF5A00]">{done}/{p.stages.length} · {pct}%</div>
                  </div>
                </div>
                <div className="mt-3 h-1.5 bg-[#F2F2F2] rounded-full overflow-hidden"><div className="h-full bg-[#FF5A00]" style={{ width: `${pct}%` }} /></div>

                <div className="mt-4 flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-black/5">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditing(p)} data-testid={`proj-edit-${p.id}`} className="inline-flex items-center gap-1.5 rounded-xl bg-[#000F1B] text-white px-4 py-2 text-xs font-semibold hover:bg-[#FF5A00] transition">
                      <ClipboardList className="w-3.5 h-3.5" /> Manage Stages
                    </button>
                    <button onClick={() => setAssigningTeam(p)} className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white text-[#000F1B] px-4 py-2 text-xs font-semibold hover:bg-[#F2F2F2] transition">
                      <Users className="w-3.5 h-3.5 text-[#FF5A00]" /> Assign Team ({teamCount})
                    </button>
                    <button onClick={() => setMarkingAttendance(p)} className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white text-[#000F1B] px-4 py-2 text-xs font-semibold hover:bg-[#F2F2F2] transition">
                      <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" /> Attendance
                    </button>
                  </div>

                  <button onClick={() => remove(p)} className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 text-red-600 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-red-50 transition">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {markingAttendance && <AttendanceModal project={markingAttendance} onClose={() => setMarkingAttendance(null)} onSaved={() => setMarkingAttendance(null)} />}
      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />}
      {editing && <StagesEditor project={editing} onClose={() => setEditing(null)} onSaved={() => { load(); }} />}
      {assigningTeam && <AssignTeamModal project={assigningTeam} onClose={() => setAssigningTeam(null)} onSaved={() => { setAssigningTeam(null); load(); }} />}
    </div>
  );
}

function AttendanceModal({ project, onClose, onSaved }) {
  const [members, setMembers] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Internal staff assigned to this project
        const staff = await adminApi.list("team");
        const staffMap = Object.fromEntries((staff || []).map(s => [s.id, s]));
        const internal = (project.team_ids || [])
          .map(id => staffMap[id])
          .filter(Boolean)
          .map(s => ({ id: s.id, name: s.name, role: s.designation || s.role || "Staff", photo: s.photo }));

        // External directory (owner, contractors, invited vendors)
        const external = (project.team_directory || [])
          .filter(e => e.status === "Active")
          .map(e => ({ id: e.id, name: e.name, role: e.role, photo: e.avatar }));

        setMembers([...internal, ...external]);

        // Pre-select today's saved attendance
        const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
        const entry = (project.attendance || []).find(a => a.date === today);
        setSelected(new Set(entry?.member_ids || []));
      } catch {
        toast.error("Failed to load team");
      } finally {
        setLoading(false);
      }
    })();
  }, [project]);

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`/admin/projects/${project.id}/attendance`, { member_ids: [...selected] });
      toast.success(`Attendance saved — ${selected.size} on site today`);
      onSaved();
    } catch {
      toast.error("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#000F1B]/60 backdrop-blur-sm z-[60] grid place-items-center p-4 font-['Poppins']">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        <div className="p-5 border-b border-black/5 flex items-center justify-between bg-[#F2F2F2]/30">
          <div>
            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Daily Attendance</div>
            <div className="font-bold text-[#000F1B] text-base">{project.title}</div>
            <div className="text-[10px] text-[#111111]/50 mt-0.5">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full grid place-items-center hover:bg-black/5 text-[#000F1B]"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-2.5">
          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#FF5A00]" /></div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#111111]/50 italic">No team members assigned to this project.</div>
          ) : (
            members.map(m => {
              const on = selected.has(m.id);
              return (
                <div key={m.id} onClick={() => toggle(m.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${on ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500/30" : "border-black/10 bg-white hover:border-black/20"}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    {m.photo
                      ? <img src={m.photo} alt="" className="w-9 h-9 rounded-full object-cover border border-black/10" />
                      : <div className="w-9 h-9 rounded-full bg-[#000F1B] text-white grid place-items-center text-xs font-bold">{m.name?.[0]}</div>}
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#000F1B] truncate">{m.name}</div>
                      <div className="text-[10px] text-[#111111]/50 truncate">{m.role}</div>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-lg grid place-items-center transition ${on ? "bg-emerald-500 text-white" : "border border-black/20 bg-white"}`}>
                    {on && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-black/5 bg-[#F2F2F2] flex items-center justify-between">
          <span className="text-xs text-[#111111]/60 font-medium">{selected.size} on site today</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-[#000F1B] bg-white border border-black/10 rounded-xl">Cancel</button>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition disabled:opacity-60">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save Attendance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function AssignTeamModal({ project, onClose, onSaved }) {
  const [allStaff, setAllStaff] = useState([]);
  const [selectedIds, setSelectedIds] = useState(project.team_ids || []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.list("team")
      .then((data) => setAllStaff(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to load staff directory"))
      .finally(() => setLoading(false));
  }, []);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await PR.update(project.id, { team_ids: selectedIds });
      toast.success("Project team assigned successfully!");
      onSaved();
    } catch {
      toast.error("Failed to update project team");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#000F1B]/60 backdrop-blur-sm z-[60] grid place-items-center p-4 font-['Poppins']">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        <div className="p-5 border-b border-black/5 flex items-center justify-between bg-[#F2F2F2]/30">
          <div>
            <div className="text-[10px] font-bold text-[#FF5A00] uppercase tracking-wider">Team Assignment</div>
            <div className="font-bold text-[#000F1B] text-base">{project.title}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full grid place-items-center hover:bg-black/5 text-[#000F1B]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          <p className="text-xs text-[#111111]/60 leading-relaxed mb-3">
            Select team members to assign to this project. Assigned staff will be visible on the client's live dashboard and team directory.
          </p>

          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#FF5A00]" /></div>
          ) : allStaff.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#111111]/50 italic">
              No staff entries found. Please add team members in CMS &rarr; Team Members first.
            </div>
          ) : (
            allStaff.map((staff) => {
              const isSelected = selectedIds.includes(staff.id);
              return (
                <div
                  key={staff.id}
                  onClick={() => toggleSelect(staff.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${isSelected ? "border-[#FF5A00] bg-[#FF5A00]/5 ring-1 ring-[#FF5A00]/30" : "border-black/10 bg-white hover:border-black/20"
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {staff.photo ? (
                      <img src={resolveMediaUrl(staff.photo)} alt={staff.name} className="w-10 h-10 rounded-full object-cover border border-black/10" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#000F1B] text-white grid place-items-center">
                        <User className="w-5 h-5 text-white/60" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-[#000F1B] truncate">{staff.name}</div>
                      <div className="text-xs text-[#111111]/50 truncate">{staff.designation || staff.role || "Team Member"}</div>
                    </div>
                  </div>

                  <div className={`w-6 h-6 rounded-lg grid place-items-center transition ${isSelected ? "bg-[#FF5A00] text-white" : "border border-black/20 bg-white"
                    }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-black/5 bg-[#F2F2F2] flex items-center justify-between">
          <span className="text-xs text-[#111111]/60 font-medium">{selectedIds.length} Selected</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-[#000F1B] bg-white border border-black/10 rounded-xl">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#FF5A00] hover:bg-[#FF2D00] rounded-xl transition disabled:opacity-60">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ customer_email: "", customer_name: "", title: "My Home Project", address: "" });
  const [saving, setSaving] = useState(false);
  const create = async () => {
    if (!form.customer_email.trim()) { toast.error("Email required"); return; }
    setSaving(true);
    try {
      await PR.create(form);
      toast.success("Project created — customer will see it on their portal");
      onCreated();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Create failed");
    } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 bg-[#000F1B]/60 backdrop-blur-sm z-[60] grid place-items-center p-4 font-['Poppins']">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" data-testid="proj-create-modal">
        <div className="font-bold text-[#000F1B] text-lg">New Customer Project</div>
        <p className="text-xs text-[#111111]/60 mt-1">Customer must sign in with the same Google email to see this project on their portal.</p>
        <div className="space-y-3 mt-4">
          {[
            { k: "customer_email", label: "Customer Email *", ph: "client@example.com" },
            { k: "customer_name", label: "Customer Name", ph: "e.g. Rajesh Kumar" },
            { k: "title", label: "Project Title", ph: "e.g. Kumar Villa — G+1 Modern" },
            { k: "address", label: "Site Address", ph: "Plot address / city" },
          ].map(f => (
            <label key={f.k} className="block">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#000F1B] mb-1">{f.label}</div>
              <input value={form[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} placeholder={f.ph} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[#FF5A00]" data-testid={`proj-field-${f.k}`} />
            </label>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-[#000F1B]">Cancel</button>
          <button onClick={create} disabled={saving} data-testid="proj-create-confirm" className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF5A00] text-white px-5 py-2 text-xs font-semibold disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Create Project
          </button>
        </div>
      </div>
    </div>
  );
}

function StagesEditor({ project, onClose, onSaved }) {
  const [stages, setStages] = useState(project.stages);
  const [saving, setSaving] = useState(null);
  const [uploading, setUploading] = useState(null);

  const saveStage = async (idx) => {
    setSaving(idx);
    try {
      const s = stages[idx];
      const updated = await PR.patchStage(project.id, idx, {
        status: s.status, expected_date: s.expected_date, progress_pct: Number(s.progress_pct) || 0,
        photos: s.photos, documents: s.documents, notes: s.notes,
      });
      const next = [...stages]; next[idx] = updated; setStages(next);
      toast.success(`"${s.name}" saved`); onSaved();
    } catch { toast.error("Save failed"); }
    finally { setSaving(null); }
  };

  const uploadPhoto = async (idx, file) => {
    if (!file) return;
    setUploading(idx);
    try {
      const res = await adminApi.uploadImage(file, "project-photos");
      const photoUrl = res.url || res.absoluteUrl;
      const next = [...stages];
      next[idx] = { ...next[idx], photos: [...(next[idx].photos || []), photoUrl] };
      setStages(next);
      toast.success("Photo uploaded — click Save Stage to publish to portal");
    } catch { toast.error("Upload failed"); }
    finally { setUploading(null); }
  };

  const patchStage = (idx, patch) => {
    const next = [...stages]; next[idx] = { ...next[idx], ...patch }; setStages(next);
  };

  return (
    <div className="fixed inset-0 bg-[#000F1B]/60 backdrop-blur-sm z-[60] grid place-items-center p-4 font-['Poppins']">
      <div className="bg-[#F5F6F8] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl" data-testid="proj-stages-editor">
        <div className="p-5 border-b border-black/5 flex items-center justify-between bg-white">
          <div>
            <div className="text-[10px] font-bold text-[#FF5A00] uppercase tracking-wider">Manage Stages</div>
            <div className="font-bold text-[#000F1B] text-base">{project.title} · {project.customer_email}</div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full grid place-items-center hover:bg-[#F2F2F2]"><X className="w-5 h-5 text-[#000F1B]" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {stages.map((s, idx) => {
            const StatusIcon = s.status === "completed" ? CheckCircle2 : s.status === "in_progress" ? PlayCircle : Circle;
            const color = s.status === "completed" ? "text-emerald-500" : s.status === "in_progress" ? "text-[#FF5A00]" : "text-[#111111]/30";
            return (
              <div key={idx} className="rounded-xl bg-white border border-black/5 p-5 shadow-sm" data-testid={`proj-stage-edit-${idx}`}>
                <div className="flex items-center gap-3 mb-4">
                  <StatusIcon className={`w-6 h-6 ${color}`} />
                  <div className="flex-1">
                    <div className="text-[10px] uppercase tracking-wider text-[#111111]/50 font-bold">Stage {idx + 1}</div>
                    <div className="font-bold text-[#000F1B]">{s.name}</div>
                  </div>
                  <select value={s.status} onChange={e => patchStage(idx, { status: e.target.value })} className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-[#FF5A00]" data-testid={`proj-status-${idx}`}>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#000F1B] uppercase tracking-wider mb-1">Target Date</label>
                    <input type="date" value={s.expected_date || ""} onChange={e => patchStage(idx, { expected_date: e.target.value })} className="w-full rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#000F1B] uppercase tracking-wider mb-1">Progress %</label>
                    <input type="number" value={s.progress_pct || 0} onChange={e => patchStage(idx, { progress_pct: e.target.value })} className="w-full rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs" />
                  </div>
                  <div className="flex items-end">
                    <label className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-black/10 bg-[#F2F2F2] px-3 py-2 text-xs font-semibold cursor-pointer hover:bg-black/5 transition">
                      {uploading === idx ? <Loader2 className="w-4 h-4 animate-spin text-[#FF5A00]" /> : <Camera className="w-4 h-4 text-[#FF5A00]" />}
                      <span>Upload Photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => uploadPhoto(idx, e.target.files?.[0])} />
                    </label>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-[10px] font-bold text-[#000F1B] uppercase tracking-wider mb-1">Engineer Notes</label>
                  <textarea value={s.notes || ""} onChange={e => patchStage(idx, { notes: e.target.value })} rows={2} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs resize-y" placeholder="Notes visible to the customer on portal" />
                </div>

                {(s.photos || []).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-black/5">
                    <div className="text-[10px] font-bold text-[#000F1B] uppercase tracking-wider mb-2">Stage Photos ({(s.photos || []).length})</div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {s.photos.map((url, i) => (
                        <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-black/10 bg-[#F2F2F2]">
                          <img src={resolveMediaUrl(url)} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => patchStage(idx, { photos: s.photos.filter((_, j) => j !== i) })} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 grid place-items-center text-red-500 shadow-sm hover:bg-white transition">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-end">
                  <button onClick={() => saveStage(idx)} disabled={saving === idx} data-testid={`proj-save-stage-${idx}`} className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF5A00] hover:bg-[#FF2D00] text-white px-5 py-2 text-xs font-bold transition">
                    {saving === idx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Stage
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
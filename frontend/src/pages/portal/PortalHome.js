/**
 * PortalHome — Customer's project status dashboard.
 * Shows their 10-stage timeline OR a placeholder if no project exists yet.
 */
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "sonner";
import {
  Loader2, LogOut, CheckCircle2, Circle, PlayCircle, Camera, FileText, Building2,
  Home, MessageSquare, ClipboardList, Clock,
} from "lucide-react";

const API_BASE = process.env.REACT_APP_BACKEND_URL + "/api";

export default function PortalHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hash = location.hash || "";
    const run = async () => {
      try {
        if (hash.includes("session_id=")) {
          const sid = new URLSearchParams(hash.replace(/^#/, "")).get("session_id");
          if (sid) {
            const res = await axios.post(`${API_BASE}/customer/auth/session`, { session_id: sid }, { withCredentials: true });
            setUser(res.data);
            window.history.replaceState(null, "", "/portal");
          }
        } else {
          const me = await axios.get(`${API_BASE}/customer/me`, { withCredentials: true });
          setUser(me.data);
        }
        const pr = await axios.get(`${API_BASE}/portal/my-project`, { withCredentials: true });
        setProject(pr.data?.project || null);
      } catch (e) {
        if (e?.response?.status === 401) {
          navigate("/portal/login", { replace: true });
        } else {
          toast.error("Failed to load your portal");
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [location.hash, navigate]);

  const logout = async () => {
    try { await axios.post(`${API_BASE}/customer/logout`, {}, { withCredentials: true }); } catch {}
    navigate("/portal/login", { replace: true });
  };

  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-brand-bg"><Loader2 className="w-6 h-6 animate-spin text-brand-orange" /></div>;
  }
  if (!user) return null;

  const overallProgress = project?.stages
    ? Math.round(project.stages.reduce((s, st) => s + (Number(st.progress_pct) || 0), 0) / project.stages.length)
    : 0;

  return (
    <div className="min-h-screen bg-brand-bg" data-testid="portal-home">
      <Toaster richColors position="top-right" />
      <header className="bg-white border-b border-black/5 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-orange grid place-items-center text-white font-bold">C</div>
            <div>
              <div className="font-bold text-brand-navy leading-none">ConstructONS</div>
              <div className="text-[10px] uppercase tracking-widest text-brand-navy/50">My Project</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user.picture && <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-black/10" />}
            <div className="hidden sm:block text-sm text-brand-navy leading-tight">
              <div className="font-semibold">{user.name}</div>
              <div className="text-xs text-brand-navy/50">{user.email}</div>
            </div>
            <button onClick={logout} data-testid="portal-logout" className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-brand-navy hover:bg-brand-bg">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 md:px-8 py-8">
        {!project ? (
          <div className="rounded-3xl bg-white border border-black/5 shadow-soft p-10 text-center" data-testid="portal-no-project">
            <div className="w-16 h-16 mx-auto rounded-full bg-brand-orange/10 grid place-items-center">
              <Building2 className="w-8 h-8 text-brand-orange" />
            </div>
            <h1 className="mt-5 text-2xl font-bold text-brand-navy">Hi {user.name?.split(" ")[0]}, your project hasn't started yet</h1>
            <p className="mt-2 text-sm text-brand-navy/60 max-w-md mx-auto">
              Once you book a package with ConstructONS, your dedicated project tracker will appear here — showing every construction milestone from design to handover with live photos, documents and updates.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <a href="/packages/compare" className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange text-white px-5 py-2.5 text-sm font-semibold hover:brightness-95">
                <Home className="w-4 h-4" /> Explore Packages
              </a>
              <a href="/contact" className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-brand-navy hover:bg-brand-bg">
                <MessageSquare className="w-4 h-4" /> Talk to Sales
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-3xl bg-brand-navy text-white p-6 md:p-8 shadow-lg" data-testid="portal-project-header">
              <div className="section-eyebrow text-brand-orangeLight">Your Project</div>
              <h1 className="mt-1 text-2xl md:text-3xl font-bold">{project.title}</h1>
              {project.address && <div className="mt-1 text-white/70 text-sm">{project.address}</div>}
              <div className="mt-5 flex items-center gap-3">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-orange" style={{ width: `${overallProgress}%` }} />
                </div>
                <div className="text-sm font-bold text-brand-orangeLight w-14 text-right">{overallProgress}%</div>
              </div>
              <div className="mt-2 text-xs text-white/60">
                {project.stages.filter(s => s.status === "completed").length} of {project.stages.length} stages complete
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {project.stages.map((stage) => (
                <StageCard key={stage.index} stage={stage} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StageCard({ stage }) {
  const [open, setOpen] = useState(stage.status === "in_progress");
  const StatusIcon = stage.status === "completed" ? CheckCircle2 : stage.status === "in_progress" ? PlayCircle : Circle;
  const color = stage.status === "completed" ? "text-emerald-500" : stage.status === "in_progress" ? "text-brand-orange" : "text-brand-navy/30";
  const label = { completed: "Completed", in_progress: "In Progress", pending: "Pending" }[stage.status] || "Pending";
  const chipClass = stage.status === "completed" ? "bg-emerald-100 text-emerald-700" : stage.status === "in_progress" ? "bg-brand-orange/15 text-brand-orange" : "bg-brand-navy/5 text-brand-navy/50";

  return (
    <div className="rounded-2xl bg-white border border-black/5 shadow-soft overflow-hidden" data-testid={`portal-stage-${stage.index}`}>
      <button type="button" onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-4 p-4 md:p-5 text-left hover:bg-brand-bg/30">
        <StatusIcon className={`w-8 h-8 shrink-0 ${color}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-[10px] uppercase tracking-widest text-brand-navy/50 font-semibold">Stage {stage.index + 1}</div>
            <span className={`text-[10px] rounded-full px-2 py-0.5 font-semibold ${chipClass}`}>{label}</span>
          </div>
          <div className="font-bold text-brand-navy mt-0.5">{stage.name}</div>
          <div className="text-sm text-brand-navy/60 mt-0.5 line-clamp-1">{stage.description}</div>
        </div>
        <div className="text-right text-xs shrink-0">
          {stage.expected_date && <div className="text-brand-navy/50 inline-flex items-center gap-1"><Clock className="w-3 h-3" />{stage.expected_date}</div>}
          {stage.status === "in_progress" && <div className="font-bold text-brand-orange mt-1">{stage.progress_pct || 0}%</div>}
        </div>
      </button>
      {open && (
        <div className="px-4 md:px-5 pb-5 border-t border-black/5 pt-4 space-y-4">
          {stage.notes && <div className="text-sm text-brand-navy/80 whitespace-pre-wrap">{stage.notes}</div>}
          {(stage.photos || []).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider mb-2 inline-flex items-center gap-1.5"><Camera className="w-3.5 h-3.5" /> Photos</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {stage.photos.map((url, i) => (
                  <img key={i} src={url} alt="" className="w-full h-28 object-cover rounded-lg" />
                ))}
              </div>
            </div>
          )}
          {(stage.documents || []).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider mb-2 inline-flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Documents</div>
              <div className="space-y-1">
                {stage.documents.map((d, i) => (
                  <a key={i} href={d.url} target="_blank" rel="noreferrer" className="block text-sm text-brand-orange hover:underline">{d.name || "Document"}</a>
                ))}
              </div>
            </div>
          )}
          {stage.started_at && <div className="text-xs text-brand-navy/50">Started {new Date(stage.started_at).toLocaleDateString()}</div>}
          {stage.completed_at && <div className="text-xs text-emerald-600">Completed {new Date(stage.completed_at).toLocaleDateString()}</div>}
        </div>
      )}
    </div>
  );
}

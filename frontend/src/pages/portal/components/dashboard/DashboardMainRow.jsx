import React from "react";
import { CheckCircle2, Circle, PlayCircle, ArrowRight, MapPin, Video } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardMainRow({ project }) {
  const stages = project?.stages || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Live CCTV (Coming Soon) */}
      <div className="lg:col-span-5 rounded-2xl bg-white border border-black/5 p-5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#000F1B]">Live CCTV</h2>
          <Link to="/portal/cctv" className="text-xs font-semibold text-[#111111]/50 hover:text-[#FF5A00]">View Module</Link>
        </div>
        <div className="flex-1 rounded-xl bg-[#F2F2F2]/50 border border-dashed border-black/10 flex flex-col items-center justify-center text-center p-6 min-h-[200px]">
          <Video className="w-8 h-8 text-[#111111]/20 mb-3" />
          <h3 className="text-sm font-bold text-[#000F1B]">Camera Sync Pending</h3>
          <p className="text-xs text-[#111111]/50 mt-1 max-w-xs">Live site camera integration is currently being rolled out across active projects.</p>
        </div>
      </div>

      {/* 2. Project Timeline (REAL DATA) */}
      <div className="lg:col-span-3 rounded-2xl bg-white border border-black/5 p-5 shadow-sm flex flex-col h-[320px]">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-base font-bold text-[#000F1B]">Timeline</h2>
          <Link to="/portal/timeline" className="text-xs font-semibold text-[#111111]/50 hover:text-[#FF5A00] flex items-center gap-1">
            All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {stages.length === 0 ? (
            <div className="text-xs text-[#111111]/40 italic text-center mt-10">No stages loaded yet.</div>
          ) : (
            stages.slice(0, 10).map((stage, i) => {
              const isCompleted = stage.status === "completed";
              const isInProgress = stage.status === "in_progress";
              return (
                <div key={i} className="relative flex items-start gap-3">
                  {i !== stages.length - 1 && <div className="absolute left-2.5 top-6 bottom-[-16px] w-0.5 bg-[#F2F2F2]" />}
                  <div className="relative z-10 shrink-0 mt-0.5">
                    {isCompleted ? <CheckCircle2 className="w-5 h-5 text-[#10B981] bg-white" /> :
                     isInProgress ? <PlayCircle className="w-5 h-5 text-[#FF5A00] bg-white" /> :
                     <Circle className="w-5 h-5 text-[#111111]/20 bg-white" />}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className={`text-xs font-semibold truncate ${isInProgress ? "text-[#000F1B]" : "text-[#111111]/60"}`}>{stage.name}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider ${isCompleted ? "bg-emerald-50 text-emerald-600" : isInProgress ? "bg-[#FF5A00]/10 text-[#FF5A00]" : "bg-[#F2F2F2] text-[#111111]/40"}`}>
                        {isCompleted ? "Completed" : isInProgress ? "In Progress" : "Upcoming"}
                      </span>
                      <span className="text-[10px] text-[#111111]/50">{stage.expected_date || "TBD"}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Hero Card (REAL DATA) */}
      <div className="lg:col-span-4 rounded-2xl bg-[#000F1B] border border-black/5 overflow-hidden relative shadow-sm flex flex-col justify-end p-5 min-h-[320px]">
        {project?.cover_image && (
          <img src={project.cover_image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#000F1B] via-[#000F1B]/60 to-transparent" />
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-white leading-tight">{project?.title || "My Project"}</h2>
          <div className="flex items-center gap-1 text-xs text-white/80 font-medium mt-1.5">
            <MapPin className="w-3.5 h-3.5" /> {project?.address || "Location pending"}
          </div>
          <p className="text-xs font-medium text-white/60 italic mt-3">From vision to reality.</p>
        </div>
      </div>
    </div>
  );
}
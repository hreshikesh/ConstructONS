import React from "react";
import { TrendingUp, CheckCircle2, PlayCircle, Circle } from "lucide-react";
import { usePortal } from "../context/PortalContext";
import ComingSoon from "../components/ComingSoon";

export default function ProgressPage() {
  const { project } = usePortal();

  if (!project) return <ComingSoon title="Progress" icon={TrendingUp} />;

  const stages = project.stages || [];
  
  const overallProgress = stages.length
    ? Math.round(stages.reduce((sum, stage) => sum + (Number(stage.progress_pct) || 0), 0) / stages.length)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-['Poppins'] pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#FF5A00]/10 grid place-items-center shrink-0">
          <TrendingUp className="w-6 h-6 text-[#FF5A00]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#000F1B] tracking-tight">Project Progress</h1>
          <p className="text-sm text-[#111111]/60 mt-0.5">Live completion status across all construction stages.</p>
        </div>
      </div>

      {/* Master Progress Bar */}
      <div className="rounded-2xl bg-white border border-black/5 p-6 shadow-sm">
        <div className="flex items-end justify-between mb-3">
          <div className="text-[11px] font-semibold text-[#111111]/50 uppercase tracking-wider">
            Overall Completion
          </div>
          <div className="text-3xl font-extrabold text-[#000F1B] leading-none">
            {overallProgress}%
          </div>
        </div>
        <div className="w-full h-3 bg-[#F2F2F2] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#FF5A00] transition-all duration-1000 ease-out rounded-full" 
            style={{ width: `${overallProgress}%` }} 
          />
        </div>
      </div>

      {/* Stage Breakdown */}
      <div className="space-y-3">
        {stages.map((stage, i) => {
          const isCompleted = stage.status === "completed";
          const isInProgress = stage.status === "in_progress";
          const pct = Number(stage.progress_pct) || 0;

          return (
            <div key={i} className="rounded-2xl bg-white border border-black/5 p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  {isCompleted ? <CheckCircle2 className="w-5 h-5 text-[#10B981]" /> :
                   isInProgress ? <PlayCircle className="w-5 h-5 text-[#FF5A00]" /> :
                   <Circle className="w-5 h-5 text-[#111111]/20" />}
                  
                  <div>
                    <div className="text-sm font-bold text-[#000F1B]">{stage.name}</div>
                    <div className="text-[10px] text-[#111111]/50 font-medium">{stage.description}</div>
                  </div>
                </div>
                
                <div className={`text-lg font-bold ${isInProgress ? "text-[#FF5A00]" : "text-[#000F1B]"}`}>
                  {pct}%
                </div>
              </div>

              {/* Individual Stage Bar */}
              <div className="w-full h-2 bg-[#F2F2F2] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isCompleted ? "bg-[#10B981]" : "bg-[#FF5A00]"
                  }`} 
                  style={{ width: `${pct}%` }} 
                />
              </div>

              {/* Status Chips */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-black/5">
                <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-widest ${
                  isCompleted ? "bg-emerald-50 text-emerald-700" : 
                  isInProgress ? "bg-[#FF5A00]/10 text-[#FF5A00]" : "bg-[#F2F2F2] text-[#111111]/40"
                }`}>
                  {isCompleted ? "Completed" : isInProgress ? "Active" : "Pending"}
                </span>
                
                {(stage.photos?.length > 0 || stage.documents?.length > 0) && (
                  <span className="text-[9px] font-semibold text-[#111111]/40 bg-[#F2F2F2] px-2 py-0.5 rounded">
                    Has Attachments (See Timeline)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
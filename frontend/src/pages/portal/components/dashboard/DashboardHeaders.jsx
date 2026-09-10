import React from "react";
import { ClipboardCheck, CalendarDays, Hourglass, IndianRupee, Flag, Sun, CloudRain } from "lucide-react";

export default function DashboardHeaders({ user, project }) {
  const stages = project?.stages || [];
  
  // Real calculation from backend data
  const overallProgress = stages.length
    ? Math.round(stages.reduce((sum, stage) => sum + (Number(stage.progress_pct) || 0), 0) / stages.length)
    : 0;

  const currentStageIndex = stages.findIndex((s) => s.status === "in_progress");
  const currentStage = currentStageIndex !== -1 ? stages[currentStageIndex] : null;

  const nextMilestone = stages.find((s) => s.status === "pending");

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-[#111111]/60">
            Welcome, {user?.name?.split(" ")[0] || "Client"}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#000F1B] tracking-tight mt-1">
            Your Dream Home is Taking Shape.
          </h1>
          <p className="text-sm text-[#111111]/50 mt-1">Real-time progress. Complete transparency. Total peace of mind.</p>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-sm font-bold text-[#000F1B]">Your Home. Our Commitment.</div>
          <div className="text-[10px] font-semibold text-[#111111]/50 uppercase tracking-widest mt-0.5">Live Today. A Better Tomorrow.</div>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {/* 1. Overall Progress (REAL) */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white border border-black/5 p-4 shadow-sm flex flex-col justify-center">
          <div className="text-[11px] font-semibold text-[#111111]/50 uppercase tracking-wider mb-2">Overall Progress</div>
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full flex items-center justify-center bg-[#F2F2F2]">
              <svg className="w-14 h-14 -rotate-90 absolute inset-0">
                <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-[#F2F2F2]" />
                <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={`${24 * 2 * Math.PI}`} strokeDashoffset={`${24 * 2 * Math.PI - (overallProgress / 100) * 24 * 2 * Math.PI}`} className="text-[#10B981]" />
              </svg>
              <span className="text-sm font-bold text-[#000F1B] relative z-10">{overallProgress}%</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#10B981]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> On Track
              </div>
            </div>
          </div>
        </div>

        {/* 2. Construction Stage (REAL) */}
        <StatCard 
          icon={ClipboardCheck} 
          title="Current Stage" 
          value={currentStageIndex !== -1 ? `${currentStageIndex + 1} / ${stages.length}` : "-"} 
          subValue={currentStage?.name || "Awaiting Start"} 
          subColor="text-[#10B981]" 
        />
        
        {/* 3 & 4. Days (Needs Backend Data) */}
        {project?.start_date ? (
          <StatCard icon={CalendarDays} title="Started On" value={new Date(project.start_date).toLocaleDateString()} subValue="Active" />
        ) : (
          <WidgetComingSoon title="Timeline" icon={CalendarDays} />
        )}
        
        {/* 5. Total Project Cost (Needs Backend Data) */}
        <div className="col-span-2 rounded-2xl bg-white border border-black/5 p-4 shadow-sm flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-[#111111]/50 uppercase tracking-wider">Total Project Cost</div>
          {project?.contract_value ? (
            <div className="flex items-end gap-3 mt-1">
              <div className="w-8 h-8 rounded-lg bg-[#F2F2F2] grid place-items-center"><IndianRupee className="w-4 h-4 text-[#000F1B]" /></div>
              <div className="text-lg font-bold text-[#000F1B]">₹ {project.contract_value}</div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-[#111111]/40 font-medium pt-2">
              Financial data integration coming soon
            </div>
          )}
        </div>

        {/* 6. Next Milestone (REAL) */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white border border-black/5 p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-[#111111]/50 uppercase tracking-wider mb-2">Next Milestone</div>
          {nextMilestone ? (
            <div className="flex items-start gap-2">
              <Flag className="w-4 h-4 text-[#111111]/40 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-[#000F1B] leading-tight line-clamp-2">{nextMilestone.name}</div>
                <div className="text-[10px] text-[#111111]/50 mt-1">{nextMilestone.expected_date || "TBD"}</div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#111111]/40 font-medium">No pending milestones.</div>
          )}
        </div>

        {/* 7. Weather (Coming Soon) */}
        <div className="hidden lg:flex rounded-2xl bg-white border border-black/5 p-4 shadow-sm flex-col justify-center items-center text-center">
           <CloudRain className="w-5 h-5 text-[#111111]/20 mb-1" />
           <span className="text-[10px] text-[#111111]/40 font-semibold uppercase">Weather Sync<br/>Coming Soon</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, subValue, subColor = "text-[#111111]/50" }) {
  return (
    <div className="rounded-2xl bg-white border border-black/5 p-4 shadow-sm flex flex-col justify-between">
      <div className="text-[11px] font-semibold text-[#111111]/50 uppercase tracking-wider">{title}</div>
      <div className="flex items-center gap-3 mt-2">
        <div className="w-8 h-8 rounded-lg bg-[#F2F2F2] grid place-items-center shrink-0">
          <Icon className="w-4 h-4 text-[#000F1B]" />
        </div>
        <div className="min-w-0">
          <div className="text-lg font-bold text-[#000F1B] leading-none truncate">{value}</div>
          <div className={`text-[10px] font-medium mt-1 truncate ${subColor}`}>{subValue}</div>
        </div>
      </div>
    </div>
  );
}

export function WidgetComingSoon({ title, icon: Icon }) {
  return (
    <div className="rounded-2xl bg-white border border-black/5 p-4 shadow-sm flex flex-col items-center justify-center text-center min-h-[100px]">
      <Icon className="w-5 h-5 text-[#111111]/20 mb-1.5" />
      <div className="text-[10px] font-semibold text-[#111111]/50 uppercase tracking-wider">{title}</div>
      <div className="text-[9px] text-[#111111]/40 mt-1">Coming Soon</div>
    </div>
  );
}
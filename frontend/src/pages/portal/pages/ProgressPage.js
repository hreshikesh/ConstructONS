import React, { useState } from "react";
import { 
  TrendingUp, Calendar, CheckCircle2, PlayCircle, Circle, 
  Download, Image as ImageIcon, FileText, HardHat, LayoutGrid, List,
  Clock, Target, ChevronRight
} from "lucide-react";
import { usePortal } from "../context/PortalContext";
import { resolveMediaUrl } from "../../../lib/mediaUrl";
import { toast } from "sonner";
import { API_BASE } from "../../../lib/api";

const TABS = ["Overview", "Site Schedule", "Monthly Progress", "Project Photos", "Progress Report"];

export default function ProgressPage() {
  const { project } = usePortal();
  const [activeTab, setActiveTab] = useState("Overview");

  if (!project) {
    return <div className="p-10 flex justify-center"><div className="w-6 h-6 border-2 border-[#FF5A00] border-t-transparent rounded-full animate-spin" /></div>;
  }

  const stages = project.stages || [];
  const totalWeight = stages.length || 1;
  const overallProgress = Math.round(stages.reduce((sum, s) => sum + (Number(s.progress_pct) || 0), 0) / totalWeight);
  const stagesCompleted = stages.filter(s => s.status === "completed").length;
  
  const startDate = new Date(project.start_date || project.created_at || Date.now());
  const expectedDate = project.expected_completion ? new Date(project.expected_completion) : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
  const today = new Date();
  
  const daysCompleted = Math.max(0, Math.floor((today - startDate) / (1000 * 60 * 60 * 24)));
  const totalDays = Math.max(1, Math.floor((expectedDate - startDate) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, Math.floor((expectedDate - today) / (1000 * 60 * 60 * 24)));

  const approvedReports = (project.daily_reports || []).filter(r => r.is_approved).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="max-w-[1400px] mx-auto space-y-3 font-['Poppins'] pb-10 px-2 sm:px-0">
      
      {/* ORIGINAL CLEAN TABS */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-[#000F1B] mb-2">Project Progress</h1>
        <div className="flex overflow-x-auto no-scrollbar border-b border-black/5">
          {TABS.map(tab => (
            <button
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-[11px] font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab ? "border-[#FF5A00] text-[#000F1B]" : "border-transparent text-[#111111]/50 hover:text-[#000F1B]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Ultra-Compact KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <KpiBlock title="Overall Progress" value={`${overallProgress}%`} subtitle={overallProgress >= 100 ? "Completed" : "On Track"} accent="#FF5A00" icon={Target} />
        <KpiBlock title="Stages Done" value={`${stagesCompleted}/${stages.length}`} subtitle="Milestones" accent="#10B981" icon={CheckCircle2} />
        <KpiBlock title="Days Completed" value={daysCompleted} subtitle={`of ${totalDays} total`} accent="#3B82F6" icon={Clock} />
        <KpiBlock title="Days Remaining" value={daysRemaining} subtitle="Estimated" accent="#F59E0B" icon={Calendar} />
        <KpiBlock title="Forecast Handover" value={expectedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} subtitle={expectedDate.getFullYear()} accent="#000F1B" icon={TrendingUp} />
      </div>

      {/* Tab Content */}
      <div className="min-h-[350px]">
        {activeTab === "Overview" && <OverviewTab project={project} stages={stages} />}
        {activeTab === "Site Schedule" && <SiteScheduleTab stages={stages} startDate={startDate} expectedDate={expectedDate} />}
        {activeTab === "Monthly Progress" && <MonthlyProgressTab project={project} startDate={startDate} expectedDate={expectedDate} />}
        {activeTab === "Project Photos" && <ProjectPhotosTab reports={approvedReports} stages={stages} />}
        {activeTab === "Progress Report" && <DailyProgressTab project={project} reports={approvedReports} />}
      </div>
    </div>
  );
}

// ============================================================================
// OVERVIEW TAB
// ============================================================================

function OverviewTab({ project, stages }) {
  const currentStageIdx = stages.findIndex(s => s.status === "in_progress");
  const activeStage = currentStageIdx !== -1 ? stages[currentStageIdx] : null;
  const team = project.team_directory || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
      
      {/* 
        Responsive Ordering: 
        On Mobile (order-2): Stages list goes below Current Stage
        On Desktop (lg:order-1): Stages list goes left, Sidebar goes right
      */}
      <div className="lg:col-span-8 order-2 lg:order-1 bg-white rounded-xl border border-black/5 shadow-sm p-3">
        <div className="flex items-center justify-between mb-2 border-b border-black/5 pb-2">
          <h3 className="text-[10px] font-bold text-[#000F1B] uppercase tracking-wider">Construction Master Plan</h3>
          <span className="text-[8px] font-bold bg-[#F2F2F2] px-1.5 py-0.5 rounded text-[#000F1B]">{stages.length} Stages</span>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-[9px]">
            <thead className="text-[#111111]/50 border-b border-black/5 bg-[#F9FAFB]">
              <tr>
                <th className="py-1.5 px-2 font-bold uppercase tracking-wider rounded-tl-md w-6">#</th>
                <th className="py-1.5 px-2 font-bold uppercase tracking-wider">Stage</th>
                <th className="py-1.5 px-2 font-bold uppercase tracking-wider">Status</th>
                <th className="py-1.5 px-2 font-bold uppercase tracking-wider w-[100px]">Progress</th>
                <th className="py-1.5 px-2 font-bold uppercase tracking-wider text-right rounded-tr-md">Actual End</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {stages.map((stage, i) => {
                const isActive = stage.status === "in_progress";
                const isCompleted = stage.status === "completed";
                const pct = Number(stage.progress_pct) || 0;
                const actualEnd = stage.actual_end_date 
                  ? new Date(stage.actual_end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) 
                  : "—";

                return (
                  <tr key={i} className={`transition-colors ${isActive ? "bg-[#FF5A00]/5" : "hover:bg-[#F9FAFB]"}`}>
                    <td className="py-2 px-2 text-[#111111]/40 font-mono font-bold">{(i + 1).toString().padStart(2, '0')}</td>
                    <td className={`py-2 px-2 font-bold text-[10px] ${isActive ? "text-[#FF5A00]" : "text-[#000F1B]"}`}>{stage.name}</td>
                    <td className="py-2 px-2"><StatusBadge status={stage.status} /></td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-1 bg-[#F2F2F2] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-[#FF5A00] to-[#FFA500]"}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[8px] font-black w-6 text-right text-[#000F1B]">{pct}%</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right text-[#111111]/60 font-semibold">{actualEnd}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden space-y-1.5">
          {stages.map((stage, i) => {
            const isActive = stage.status === "in_progress";
            const pct = Number(stage.progress_pct) || 0;
            const actualEnd = stage.actual_end_date ? new Date(stage.actual_end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—";
            
            return (
              <div key={i} className={`p-2.5 rounded-lg border transition-all ${isActive ? "border-[#FF5A00] bg-[#FF5A00]/5 shadow-sm ring-1 ring-[#FF5A00]/20" : "border-black/5 bg-white"}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0 pr-1">
                    <span className="text-[8px] font-mono font-bold text-[#111111]/40 shrink-0">#{(i + 1).toString().padStart(2, '0')}</span>
                    <span className={`text-[10px] font-bold truncate ${isActive ? "text-[#FF5A00]" : "text-[#000F1B]"}`}>{stage.name}</span>
                  </div>
                  <StatusBadge status={stage.status} />
                </div>
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-md border border-black/5">
                  <div className="flex-1 h-1 bg-[#F2F2F2] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${stage.status === "completed" ? "bg-emerald-500" : "bg-[#FF5A00]"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[8px] font-black text-[#000F1B] shrink-0">{pct}%</span>
                  <span className="text-[7px] text-[#111111]/20">|</span>
                  <span className="text-[7px] font-bold text-[#111111]/60 shrink-0">End: {actualEnd}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar: Current Stage & Team */}
      <div className="lg:col-span-4 order-1 lg:order-2 space-y-2.5">
        
        {/* Sleek Current Active Stage Card */}
        <div className="bg-gradient-to-br from-[#000F1B] via-[#0F1E30] to-[#000F1B] rounded-xl shadow-md p-3 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-[#FF5A00]" />
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#FF5A00]/15 blur-[20px] rounded-full" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[8px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-1">
                <Target className="w-3 h-3 text-[#FF5A00]" /> Active Stage
              </h3>
              {activeStage && (
                <span className="text-[9px] font-black bg-[#FF5A00] text-white px-2 py-0.5 rounded shadow-sm">{activeStage.progress_pct || 0}%</span>
              )}
            </div>
            
            {activeStage ? (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white leading-tight">{activeStage.name}</h4>
                
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#FF5A00] to-[#FFA500] rounded-full transition-all duration-1000" style={{ width: `${activeStage.progress_pct || 0}%` }} />
                </div>

                {activeStage.description && (
                  <p className="text-[9px] text-white/70 leading-relaxed bg-white/5 p-2 rounded-md border border-white/10 italic">
                    "{activeStage.description}"
                  </p>
                )}
              </div>
            ) : (
              <div className="text-[9px] text-white/40 italic py-4 text-center">No active stage currently in progress.</div>
            )}
          </div>
        </div>

        {/* Project Team */}
        <div className="bg-white rounded-xl border border-black/5 shadow-sm p-3">
          <h3 className="text-[8px] font-bold text-[#111111]/40 uppercase tracking-widest mb-2 border-b border-black/5 pb-1.5">Project Team</h3>
          <div className="space-y-2">
            {team.filter(t => t.status !== "Pending").slice(0, 5).map((member, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {member.avatar || member.photo 
                  ? <img src={resolveMediaUrl(member.avatar || member.photo)} alt="" className="w-6 h-6 rounded-full object-cover border border-black/10" /> 
                  : <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#F5F6F8] to-[#E5E7EB] border border-black/5 flex items-center justify-center text-[#000F1B] font-bold text-[9px]">{member.name?.[0] || "?"}</div>
                }
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-[#000F1B] truncate">{member.name}</div>
                  <div className="text-[8px] text-[#111111]/50 font-semibold truncate">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SITE SCHEDULE (PROFESSIONAL GANTT)
// ============================================================================

function SiteScheduleTab({ stages, startDate, expectedDate }) {
  const totalMs = expectedDate - startDate || 1;
  const today = new Date();
  const todayPct = Math.max(0, Math.min(100, ((today - startDate) / totalMs) * 100));
  
  const monthMarkers = [];
  const cur = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  while (cur <= expectedDate) {
    const pct = Math.max(0, ((cur - startDate) / totalMs) * 100);
    monthMarkers.push({ label: cur.toLocaleDateString("en-US", { month: "short" }), year: cur.getFullYear(), pct });
    cur.setMonth(cur.getMonth() + 1);
  }

  return (
    <div className="bg-white rounded-xl border border-black/5 shadow-sm p-3 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2 border-b border-black/5 pb-2">
        <div>
          <h3 className="text-xs font-bold text-[#000F1B]">Master Gantt Schedule</h3>
          <p className="text-[8px] text-[#111111]/50 font-medium mt-0.5">Dynamic timeline of stages & substages</p>
        </div>
        <div className="flex items-center gap-2 text-[7px] font-bold text-[#111111]/60 uppercase tracking-wider bg-[#F9FAFB] p-1 rounded border border-black/5 flex-wrap">
          <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-sm" /> Done</div>
          <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-[#FF5A00] rounded-sm" /> Active</div>
          <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-slate-300 rounded-sm" /> Pending</div>
          <div className="w-px h-2 bg-black/10 mx-0.5" />
          <div className="flex items-center gap-1"><div className="w-0.5 h-2 bg-red-500 rounded-full" /> Today</div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar pb-1">
        <div className="min-w-[650px]">
          
          <div className="flex mb-1.5">
            <div className="w-[35%] shrink-0 border-r border-black/10 pr-2 flex items-end pb-0.5">
              <div className="text-[8px] font-bold text-[#111111]/40 uppercase tracking-wider">Task Breakdown</div>
            </div>
            <div className="w-[65%] shrink-0 pl-1.5 relative h-5 border-b border-black/10">
              {monthMarkers.map((m, i) => (
                <div key={i} className="absolute top-0 border-l border-black/10 pl-1 h-full flex flex-col justify-end pb-0.5" style={{ left: `${m.pct}%` }}>
                  <div className="text-[8px] font-bold text-[#000F1B] leading-none">{m.label}</div>
                  {i === 0 || m.year !== monthMarkers[i-1].year ? <div className="text-[6px] font-bold text-[#111111]/40">{m.year}</div> : null}
                </div>
              ))}
            </div>
          </div>

          <div className="relative space-y-0.5">
            <div className="absolute top-0 bottom-0 pointer-events-none z-20" style={{ left: `calc(35% + 6px + ${todayPct}% * 0.65)` }}>
              <div className="w-[1px] h-full bg-red-500/80 shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
              <div className="absolute -top-0.5 -translate-x-1/2 bg-red-500 text-white text-[6px] font-black px-1 py-0.5 rounded shadow-sm">TODAY</div>
            </div>

            {stages.map((stage, idx) => {
              const substages = stage.substages || [];
              const sStart = stage.start_date ? new Date(stage.start_date) : stage.started_at ? new Date(stage.started_at) : null;
              const sEnd = stage.actual_end_date ? new Date(stage.actual_end_date) : stage.planned_end_date ? new Date(stage.planned_end_date) : stage.expected_date ? new Date(stage.expected_date) : null;
              const hasDates = sStart && sEnd;
              const leftPct = hasDates ? Math.max(0, ((sStart - startDate) / totalMs) * 100) : 0;
              const widthPct = hasDates ? Math.max(0.5, ((sEnd - sStart) / totalMs) * 100) : 0;
              const isCompleted = stage.status === "completed";
              const isActive = stage.status === "in_progress";
              const barColor = isCompleted ? "bg-emerald-500" : isActive ? "bg-[#FF5A00]" : "bg-slate-300";

              return (
                <div key={idx} className="group pb-1">
                  
                  {/* MAIN STAGE */}
                  <div className="flex items-center py-1 bg-white hover:bg-[#F9FAFB] rounded transition border border-transparent hover:border-black/5">
                    <div className="w-[35%] shrink-0 px-2 flex items-center gap-1.5 min-w-0 border-r border-black/5">
                      <div className="text-[8px] font-black text-white bg-[#000F1B] w-3.5 h-3.5 rounded-sm grid place-items-center shrink-0">{(idx + 1)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-[9px] text-[#000F1B] truncate">{stage.name}</div>
                        {hasDates ? (
                          <div className="text-[7px] text-[#111111]/50 font-medium">
                            {sStart.toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })} → {sEnd.toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })}
                          </div>
                        ) : <div className="text-[7px] text-amber-500 italic">Dates pending</div>}
                      </div>
                      <div className="text-[8px] font-black w-5 text-right text-[#000F1B]">{stage.progress_pct || 0}%</div>
                    </div>

                    <div className="w-[65%] shrink-0 pl-1.5 relative h-4 flex items-center">
                      {hasDates && (
                        <div className="absolute h-2.5 rounded-sm shadow-sm overflow-hidden" style={{ left: `${leftPct}%`, width: `${widthPct}%`, minWidth: '3px' }}>
                          <div className={`h-full ${barColor} relative`}>
                            {isActive && stage.progress_pct > 0 && <div className="absolute top-0 left-0 h-full bg-white/25" style={{ width: `${stage.progress_pct}%` }} />}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SUBSTAGES */}
                  {substages.length > 0 && (
                    <div className="ml-3 border-l border-black/10 mb-1 space-y-[1px]">
                      {substages.map((sub, sIdx) => {
                        const subStart = sub.start_date ? new Date(sub.start_date) : sStart;
                        const subEnd = sub.actual_end_date ? new Date(sub.actual_end_date) : sub.planned_end_date ? new Date(sub.planned_end_date) : sEnd;
                        const subHasDates = subStart && subEnd;
                        const subLeft = subHasDates ? Math.max(0, ((subStart - startDate) / totalMs) * 100) : 0;
                        const subWidth = subHasDates ? Math.max(0.5, ((subEnd - subStart) / totalMs) * 100) : 0;
                        const subColor = sub.status === "completed" ? "bg-emerald-400" : sub.status === "in_progress" ? "bg-amber-500" : "bg-slate-200";

                        return (
                          <div key={sIdx} className="flex items-center hover:bg-[#F9FAFB] transition relative py-0.5">
                            <div className="absolute top-1/2 left-0 w-1.5 border-t border-black/10 -translate-y-1/2" />
                            {sIdx === substages.length - 1 && <div className="absolute top-1/2 bottom-0 left-[-1px] w-1 bg-white" />}

                            <div className="w-[35%] shrink-0 pl-2.5 pr-1.5 flex items-center gap-1 min-w-0">
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-[8px] text-[#111111]/70 truncate">{sub.name}</div>
                                {subHasDates && (
                                  <div className="text-[6px] text-[#111111]/40 font-medium">
                                    {subStart.toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })} → {subEnd.toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })}
                                  </div>
                                )}
                              </div>
                              <span className="text-[7px] font-bold text-[#111111]/50">{sub.progress_pct || 0}%</span>
                            </div>

                            <div className="w-[65%] shrink-0 pl-1.5 relative h-2.5 flex items-center">
                              {subHasDates && <div className={`absolute h-1.5 rounded-[1px] ${subColor} opacity-90`} style={{ left: `${subLeft}%`, width: `${subWidth}%`, minWidth: '2px' }} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MONTHLY PROGRESS (Shrunk Chart)
// ============================================================================

function MonthlyProgressTab({ project, startDate, expectedDate }) {
  const calculateChartData = () => {
    const dbRecords = project.monthly_progress || [];
    const data = [];
    let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const today = new Date();
    const totalDurationMonths = Math.max(1, (expectedDate.getFullYear() - startDate.getFullYear()) * 12 + (expectedDate.getMonth() - startDate.getMonth()));
    let monthIndex = 0;
    let lastKnownActual = 0;
    
    while (current <= today && monthIndex <= totalDurationMonths) {
      const monthLabel = current.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      const plannedPct = Math.min(100, Math.round(((monthIndex + 1) / totalDurationMonths) * 100));
      const dbRecord = dbRecords.find(r => r.month === monthLabel);
      if (dbRecord) lastKnownActual = dbRecord.actual_pct;
      data.push({ label: current.toLocaleDateString("en-US", { month: "short" }), fullLabel: monthLabel, planned: plannedPct, actual: lastKnownActual, status: lastKnownActual >= plannedPct - 5 ? "On Track" : "Delayed" });
      current.setMonth(current.getMonth() + 1);
      monthIndex++;
    }
    return data.slice(-8);
  };
  
  const chartData = calculateChartData();

  const handleDownloadReport = async (monthStr) => {
    toast.info(`Generating ${monthStr} Report...`);
    const formattedMonth = monthStr.replace(" ", "-").toLowerCase();
    window.open(`${API_BASE}/portal/my-project/${project.id}/monthly-report/${formattedMonth}/pdf`, "_blank");
  };

  return (
    <div className="space-y-2.5">
      <div className="bg-white rounded-xl border border-black/5 shadow-sm p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="font-bold text-xs text-[#000F1B]">Planned vs Actual Progression</h3>
          <div className="flex gap-2 text-[8px] font-bold uppercase tracking-wider text-[#111111]/60">
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-slate-200 rounded-sm" /> Planned Target</div>
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-[#FF5A00] rounded-sm" /> Actual Achieved</div>
          </div>
        </div>

        {/* Shrunk Chart Height (h-40) */}
        <div className="relative h-40 w-full mt-2 border-l border-b border-black/10 pb-4 pl-5">
          <div className="absolute left-0 top-0 bottom-4 w-4 flex flex-col justify-between text-[7px] font-bold text-[#111111]/40 text-right pr-1">
            <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
          </div>
          <div className="absolute left-5 right-0 top-0 bottom-4 flex flex-col justify-between pointer-events-none z-0">
            {[100, 75, 50, 25].map(val => <div className="w-full border-t border-black/5 border-dashed" key={val}></div>)}
          </div>

          <div className="absolute left-5 right-0 top-0 bottom-4 flex items-end justify-around px-2 z-10">
            {chartData.map((d, i) => (
              <div key={i} className="flex gap-1 h-full items-end group relative w-full justify-center cursor-pointer">
                <div className="absolute -top-10 bg-[#000F1B] text-white text-[8px] font-bold px-2 py-1 rounded shadow-lg hidden group-hover:block z-20 whitespace-nowrap text-center">
                  <div className="text-white/60 mb-0.5">{d.fullLabel}</div>
                  <span className="text-slate-300">Plan: {d.planned}%</span> | <span className="text-[#FF5A00]">Act: {d.actual}%</span>
                </div>
                <div className="w-2.5 sm:w-4 md:w-5 bg-slate-200 rounded-t-sm transition-all duration-700 ease-out group-hover:bg-slate-300" style={{ height: `${d.planned}%` }}></div>
                <div className="w-2.5 sm:w-4 md:w-5 bg-gradient-to-t from-[#FF5A00] to-[#FFA500] rounded-t-sm shadow-[0_-2px_6px_rgba(255,90,0,0.2)] transition-all duration-700 ease-out group-hover:brightness-110" style={{ height: `${d.actual}%` }}></div>
              </div>
            ))}
          </div>

          <div className="absolute left-5 right-0 bottom-[-4px] h-4 flex justify-around items-end text-[7px] sm:text-[8px] font-bold text-[#111111]/50 uppercase tracking-wider">
            {chartData.map((d, i) => <div key={i} className="text-center w-full">{d.label}</div>)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-2 border-b border-black/5 bg-[#F9FAFB]">
          <h3 className="text-[10px] font-bold text-[#000F1B] px-1">Monthly Archive</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[9px]">
            <thead className="text-[#111111]/40 border-b border-black/5 bg-white">
              <tr>
                <th className="px-3 py-2 font-bold uppercase tracking-wider">Month</th>
                <th className="px-3 py-2 font-bold uppercase tracking-wider text-center">Planned</th>
                <th className="px-3 py-2 font-bold uppercase tracking-wider text-center">Actual</th>
                <th className="px-3 py-2 font-bold uppercase tracking-wider text-center hidden sm:table-cell">Status</th>
                <th className="px-3 py-2 font-bold uppercase tracking-wider text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {[...chartData].reverse().map((d) => (
                <tr key={d.fullLabel} className="hover:bg-black/[0.02]">
                  <td className="px-3 py-2 font-bold text-[#000F1B]">{d.fullLabel}</td>
                  <td className="px-3 py-2 text-center font-medium text-[#111111]/60">{d.planned}%</td>
                  <td className="px-3 py-2 text-center font-black text-[#FF5A00]">{d.actual}%</td>
                  <td className="px-3 py-2 text-center hidden sm:table-cell">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${d.status === 'On Track' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      <Circle className="w-1.5 h-1.5 fill-current" /> {d.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => handleDownloadReport(d.fullLabel)} className="inline-flex items-center gap-1 text-[8px] font-bold text-white bg-[#000F1B] hover:bg-[#FF5A00] px-2 py-1 rounded transition shadow-sm">
                      <Download className="w-2.5 h-2.5" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PROJECT PHOTOS
// ============================================================================

function ProjectPhotosTab({ reports, stages }) {
  const [viewMode, setViewMode] = useState("card");
  
  let photos = [];
  reports.forEach(rep => { (rep.photos || []).forEach(p => photos.push({ url: p.url, caption: p.caption || "Site Update", date: rep.date, category: "Daily Update" })); });
  if (photos.length === 0) {
    stages.forEach(stg => { (stg.photos || []).forEach(p => photos.push({ url: p, caption: `${stg.name} Progress`, date: stg.updated_at, category: stg.name })); });
  }

  if (photos.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-black/5 shadow-sm p-8 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full bg-black/5 grid place-items-center mb-2">
          <ImageIcon className="w-5 h-5 text-[#111111]/30" />
        </div>
        <h3 className="font-bold text-xs text-[#000F1B]">No photos available</h3>
        <p className="text-[9px] text-[#111111]/50 mt-1">Images will appear here once uploaded.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-black/5 shadow-sm p-3 space-y-3">
      <div className="flex items-center justify-between border-b border-black/5 pb-2 mb-2">
        <div>
          <h3 className="text-xs font-bold text-[#000F1B]">Site Gallery</h3>
          <p className="text-[8px] text-[#111111]/50 font-medium">{photos.length} photos</p>
        </div>
        
        <div className="flex items-center gap-1 bg-[#F5F6F8] p-0.5 rounded border border-black/5">
          <button onClick={() => setViewMode("card")} className={`p-1 rounded-sm transition ${viewMode === "card" ? "bg-white shadow-sm text-[#FF5A00]" : "text-[#111111]/50 hover:text-[#000F1B]"}`} title="Grid">
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setViewMode("list")} className={`p-1 rounded-sm transition ${viewMode === "list" ? "bg-white shadow-sm text-[#FF5A00]" : "text-[#111111]/50 hover:text-[#000F1B]"}`} title="List">
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {viewMode === "card" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {photos.map((img, idx) => (
            <div key={idx} className="group rounded-lg border border-black/10 overflow-hidden bg-black/5 relative aspect-square hover:shadow-md transition-all duration-300">
              <img src={resolveMediaUrl(img.url)} alt="Site Progress" className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
                <span className="text-white text-[8px] font-bold truncate mb-0.5">{img.caption}</span>
                <div className="flex items-center justify-between text-white/70 text-[7px] font-semibold">
                  <span className="truncate pr-1">{img.category}</span>
                  <span className="shrink-0">{img.date ? new Date(img.date).toLocaleDateString("en-IN") : "Recent"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-[9px]">
            <thead className="bg-[#F9FAFB] text-[#111111]/50 uppercase tracking-wider text-[8px]">
              <tr>
                <th className="px-3 py-2 font-bold rounded-tl-md w-12">Image</th>
                <th className="px-3 py-2 font-bold">Caption</th>
                <th className="px-3 py-2 font-bold">Category</th>
                <th className="px-3 py-2 font-bold text-right rounded-tr-md">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {photos.map((img, idx) => (
                <tr key={idx} className="hover:bg-[#F9FAFB] transition">
                  <td className="px-3 py-1.5">
                    <div className="w-8 h-8 rounded overflow-hidden border border-black/10 bg-gray-100">
                      <img src={resolveMediaUrl(img.url)} alt="" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-3 py-1.5 font-bold text-[#000F1B]">{img.caption}</td>
                  <td className="px-3 py-1.5 text-[#FF5A00] font-semibold text-[8px] uppercase tracking-wider">{img.category}</td>
                  <td className="px-3 py-1.5 text-right font-medium text-[#111111]/50">{img.date ? new Date(img.date).toLocaleDateString("en-IN") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PROGRESS REPORT
// ============================================================================

function DailyProgressTab({ project, reports }) {
  const [selectedDate, setSelectedDate] = useState(reports[0]?.date || "");
  const report = reports.find(r => r.date === selectedDate);

  const handleDownloadFullPDF = () => {
    toast.info("Generating Full Progress Report...");
    window.open(`${API_BASE}/portal/my-project/${project.id}/full-progress-report/pdf`, "_blank");
  };

  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-black/5 shadow-sm p-8 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full bg-[#FF5A00]/10 grid place-items-center mb-2">
          <FileText className="w-5 h-5 text-[#FF5A00]" />
        </div>
        <h3 className="font-bold text-xs text-[#000F1B]">No verified reports</h3>
        <p className="text-[9px] text-[#111111]/50 mt-1">Check back later when updates are published.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      
      {/* Header Controls */}
      <div className="bg-white p-3 rounded-xl border border-black/5 shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div>
          <h3 className="font-bold text-xs text-[#000F1B] flex items-center gap-1.5">
            <HardHat className="w-3.5 h-3.5 text-[#FF5A00]" /> Progress Report
          </h3>
          <p className="text-[8px] text-[#111111]/50 font-medium mt-0.5">PM-verified daily site updates</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="flex-1 sm:flex-none bg-[#F5F6F8] border border-black/10 rounded-md px-2 py-1.5 text-[9px] font-bold text-[#000F1B] focus:outline-none cursor-pointer">
            {reports.map(r => <option key={r.id} value={r.date}>{new Date(r.date).toLocaleDateString("en-IN", { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' })}</option>)}
          </select>
          <button onClick={handleDownloadFullPDF} className="flex-1 sm:flex-none px-3 py-1.5 bg-[#000F1B] hover:bg-[#FF5A00] text-white text-[9px] font-bold rounded-md transition flex items-center justify-center gap-1 shadow-sm whitespace-nowrap">
            <Download className="w-3 h-3" /> <span className="hidden xs:inline">Full</span> PDF
          </button>
        </div>
      </div>

      {/* Report Body */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          
          <div className="space-y-3">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <h4 className="text-[8px] font-bold text-emerald-800 uppercase tracking-wider mb-1">Site Status</h4>
              <div className="flex items-center gap-1 text-emerald-700 font-black text-[11px]">
                <CheckCircle2 className="w-3 h-3 fill-current" /> {report.overall_status}
              </div>
              {report.status_notes && <p className="text-[9px] text-emerald-700 mt-1.5 font-medium leading-relaxed bg-emerald-100/50 p-1.5 rounded border border-emerald-200/50">"{report.status_notes}"</p>}
            </div>
            
            <div className="bg-white border border-black/5 shadow-sm rounded-xl p-3.5">
              <h4 className="font-bold text-[9px] text-[#000F1B] mb-2 uppercase tracking-wide border-b border-black/5 pb-1.5">Work Completed</h4>
              <ul className="space-y-1.5">
                {(report.work_completed || []).map((work, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[9px] font-semibold text-[#111111]/70">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 shrink-0 mt-0.5" /> <span className="leading-snug">{work}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white border border-black/5 shadow-sm rounded-xl p-3.5">
              <h4 className="font-bold text-[9px] text-[#000F1B] mb-2 uppercase tracking-wide border-b border-black/5 pb-1.5">Planned Tomorrow</h4>
              <ul className="space-y-1.5">
                {(report.planned_tomorrow || []).map((work, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[9px] font-semibold text-[#111111]/60">
                    <Circle className="w-2.5 h-2.5 text-[#111111]/30 shrink-0 mt-0.5" /> <span className="leading-snug">{work}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white border border-black/5 shadow-sm rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-3 border-b border-black/5 pb-1.5">
              <h4 className="font-bold text-[9px] text-[#000F1B] uppercase tracking-wider">Site Execution Images</h4>
              <span className="text-[8px] font-bold text-[#111111]/40 bg-[#F5F6F8] px-1.5 py-0.5 rounded">{(report.photos || []).length} photos</span>
            </div>
            
            {(report.photos || []).length === 0 ? (
              <div className="text-center py-8 text-[9px] italic text-[#111111]/40 border border-dashed border-black/5 rounded-lg">No photos attached.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(report.photos || []).map((p, i) => (
                  <div key={i} className="group rounded-lg border border-black/5 bg-[#F9FAFB] overflow-hidden hover:shadow-md transition">
                    <div className="aspect-video bg-black/5 overflow-hidden relative">
                      <img src={resolveMediaUrl(p.url)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      {p.time && <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[7px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">{p.time}</div>}
                    </div>
                    <div className="p-1.5 text-[8px] font-bold text-[#000F1B] truncate" title={p.caption}>{p.caption || "Site update"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

function StatusBadge({ status }) {
  const config = {
    completed: { label: "Completed", color: "text-emerald-700 bg-emerald-50 border-emerald-200", Icon: CheckCircle2 },
    in_progress: { label: "Active", color: "text-[#FF5A00] bg-[#FF5A00]/10 border-[#FF5A00]/30", Icon: PlayCircle },
    pending: { label: "Pending", color: "text-[#111111]/50 bg-[#F5F6F8] border-black/10", Icon: Circle }
  };
  const c = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${c.color}`}>
      <c.Icon className="w-2 h-2" />
      {c.label}
    </span>
  );
}

function KpiBlock({ title, value, subtitle, icon: Icon, accent }) {
  return (
    <div className="bg-white rounded-lg border border-black/5 p-2 shadow-sm hover:shadow-md transition relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full transition-all group-hover:w-1.5" style={{ background: accent }} />
      <div className="flex items-start justify-between gap-1 mb-1 pl-1.5">
        <div className="text-[7px] sm:text-[8px] font-bold text-[#111111]/50 uppercase tracking-wider leading-tight">{title}</div>
        <Icon className="w-3 h-3 shrink-0 opacity-80" style={{ color: accent }} />
      </div>
      <div className="pl-1.5">
        <div className="text-sm sm:text-base font-black text-[#000F1B] leading-none mb-0.5">{value}</div>
        <div className="text-[7px] font-semibold text-[#111111]/40">{subtitle}</div>
      </div>
    </div>
  );
}
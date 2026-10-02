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
    return <div className="p-10 flex justify-center"><div className="w-8 h-8 md:w-10 md:h-10 border-4 border-[#FF5A00] border-t-transparent rounded-full animate-spin" /></div>;
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
    <div className="w-full max-w-[1800px] 2xl:max-w-screen-2xl mx-auto space-y-4 md:space-y-6 font-['Poppins'] pb-12 px-4 sm:px-6 lg:px-8 mt-4 md:mt-6">
      
      {/* TABS HEADER */}
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl 2xl:text-4xl font-bold text-[#000F1B] mb-4">Project Progress</h1>
        <div className="flex overflow-x-auto no-scrollbar border-b border-black/5 gap-2 md:gap-4 pb-0.5">
          {TABS.map(tab => (
            <button
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 md:py-3 text-xs md:text-sm 2xl:text-base uppercase tracking-wider font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab ? "border-[#FF5A00] text-[#000F1B]" : "border-transparent text-gray-400 hover:text-[#000F1B]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* KPI STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 2xl:gap-6">
        <KpiBlock title="Overall Progress" value={`${overallProgress}%`} subtitle={overallProgress >= 100 ? "Completed" : "On Track"} accent="#FF5A00" icon={Target} />
        <KpiBlock title="Stages Done" value={`${stagesCompleted}/${stages.length}`} subtitle="Milestones" accent="#10B981" icon={CheckCircle2} />
        <KpiBlock title="Days Completed" value={daysCompleted} subtitle={`of ${totalDays} total`} accent="#FF8C00" icon={Clock} />
        <KpiBlock title="Days Remaining" value={daysRemaining} subtitle="Estimated" accent="#EAB308" icon={Calendar} />
        <KpiBlock title="Forecast Handover" value={expectedDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} subtitle={expectedDate.getFullYear()} accent="#000F1B" icon={TrendingUp} />
      </div>

      {/* DYNAMIC TAB CONTENT */}
      <div className="min-h-[400px] 2xl:min-h-[600px] mt-4 md:mt-6">
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 2xl:gap-8">
      <div className="lg:col-span-8 order-2 lg:order-1 bg-white rounded-2xl border border-black/5 shadow-sm p-4 md:p-6 2xl:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-black/5 pb-4">
          <h3 className="text-sm md:text-base 2xl:text-lg font-bold text-[#000F1B] uppercase tracking-wider">Construction Master Plan</h3>
          <span className="text-xs md:text-sm 2xl:text-base font-bold bg-[#F2F2F2] px-3 py-1.5 rounded-lg text-[#000F1B]">{stages.length} Stages</span>
        </div>
        
        {/* DESKTOP TABLE */}
        <div className="hidden sm:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs md:text-sm 2xl:text-base min-w-[600px]">
            <thead className="text-gray-500 border-b border-black/5 bg-[#F9FAFB]">
              <tr>
                <th className="py-3 px-4 font-bold uppercase tracking-wider w-12">#</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Stage</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-center">Status</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider w-[120px] 2xl:w-[200px]">Progress</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-right">Actual End</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {stages.map((stage, i) => {
                const isActive = stage.status === "in_progress";
                const isCompleted = stage.status === "completed";
                const pct = Number(stage.progress_pct) || 0;
                const actualEnd = stage.actual_end_date 
                  ? new Date(stage.actual_end_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) 
                  : "—";

                return (
                  <tr key={i} className={`transition-colors ${isActive ? "bg-[#FF5A00]/5" : "hover:bg-[#F9FAFB]"}`}>
                    <td className="py-3 px-4 text-gray-400 font-mono font-bold">{(i + 1).toString().padStart(2, '0')}</td>
                    <td className={`py-3 px-4 font-bold ${isActive ? "text-[#FF5A00]" : "text-[#000F1B]"}`}>{stage.name}</td>
                    <td className="py-3 px-4 text-center"><StatusBadge status={stage.status} /></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 2xl:gap-3">
                        <div className="flex-1 h-1.5 md:h-2 2xl:h-3 bg-[#F2F2F2] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-[#FF5A00] to-[#FFA500]"}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] md:text-xs 2xl:text-sm font-black w-8 2xl:w-10 text-right text-[#000F1B]">{pct}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-500 font-semibold">{actualEnd}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="sm:hidden space-y-3">
          {stages.map((stage, i) => {
            const isActive = stage.status === "in_progress";
            const pct = Number(stage.progress_pct) || 0;
            const actualEnd = stage.actual_end_date ? new Date(stage.actual_end_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
            
            return (
              <div key={i} className={`p-4 rounded-xl border ${isActive ? "border-[#FF5A00] bg-[#FF5A00]/5 shadow-sm" : "border-black/5 bg-white"}`}>
                <div className="flex items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="text-xs font-mono font-bold text-gray-400 shrink-0">#{(i + 1).toString().padStart(2, '0')}</span>
                    <span className={`text-sm font-bold truncate ${isActive ? "text-[#FF5A00]" : "text-[#000F1B]"}`}>{stage.name}</span>
                  </div>
                  <StatusBadge status={stage.status} />
                </div>
                <div className="flex flex-col gap-2 bg-white p-3 rounded-lg border border-black/5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[#F2F2F2] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${stage.status === "completed" ? "bg-emerald-500" : "bg-[#FF5A00]"}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-black text-[#000F1B] shrink-0">{pct}%</span>
                  </div>
                  <div className="text-[10px] font-bold text-gray-500 text-right">
                    Completion: {actualEnd}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-4 order-1 lg:order-2 space-y-4 md:space-y-6">
        
        <div className="bg-gradient-to-br from-[#000F1B] via-[#0F1E30] to-[#000F1B] rounded-2xl shadow-lg p-5 md:p-6 2xl:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#FF5A00]" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF5A00]/20 blur-[20px] rounded-full" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs md:text-sm 2xl:text-base font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                <Target className="w-4 h-4 2xl:w-5 2xl:h-5 text-[#FF5A00]" /> Active Stage
              </h3>
              {activeStage && (
                <span className="text-xs md:text-sm 2xl:text-base font-black bg-[#FF5A00] text-white px-2.5 py-1 rounded-md">{activeStage.progress_pct || 0}%</span>
              )}
            </div>
            
            {activeStage ? (
              <div className="space-y-3">
                <h4 className="text-base md:text-lg 2xl:text-2xl font-bold text-white leading-tight">{activeStage.name}</h4>
                <div className="h-1.5 md:h-2 2xl:h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#FF5A00] to-[#FFA500] rounded-full" style={{ width: `${activeStage.progress_pct || 0}%` }} />
                </div>
                {activeStage.description && (
                  <p className="text-xs md:text-sm 2xl:text-base text-white/70 bg-white/5 p-3 rounded-lg border border-white/10 italic leading-relaxed mt-4">
                    "{activeStage.description}"
                  </p>
                )}
              </div>
            ) : (
              <div className="text-sm 2xl:text-base text-white/40 italic py-6 text-center">No active stage currently in progress.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5 md:p-6 2xl:p-8">
          <h3 className="text-xs md:text-sm 2xl:text-base font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-black/5 pb-2">Project Team</h3>
          <div className="space-y-3 2xl:space-y-4">
            {team.filter(t => t.status !== "Pending").slice(0, 5).map((member, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {member.avatar || member.photo 
                  ? <img src={resolveMediaUrl(member.avatar || member.photo)} alt="" className="w-10 h-10 2xl:w-12 2xl:h-12 rounded-full object-cover border border-black/10" /> 
                  : <div className="w-10 h-10 2xl:w-12 2xl:h-12 rounded-full bg-gray-100 border border-black/5 flex items-center justify-center text-[#000F1B] font-bold text-sm 2xl:text-base">{member.name?.[0] || "?"}</div>
                }
                <div className="flex-1 min-w-0">
                  <div className="text-sm 2xl:text-base font-bold text-[#000F1B] truncate">{member.name}</div>
                  <div className="text-xs 2xl:text-sm text-gray-500 font-semibold truncate">{member.role}</div>
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
    <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-4 md:p-6 2xl:p-8 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-black/5 pb-4">
        <div>
          <h3 className="text-sm md:text-base 2xl:text-xl font-bold text-[#000F1B]">Master Gantt Schedule</h3>
          <p className="text-xs md:text-sm 2xl:text-base text-gray-500 font-medium mt-1">Timeline of stages & substages</p>
        </div>
        <div className="flex items-center gap-3 text-xs 2xl:text-sm font-bold text-gray-500 uppercase tracking-wider bg-[#F9FAFB] p-2 md:p-3 rounded-lg border border-black/5 flex-wrap">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 2xl:w-3 2xl:h-3 bg-emerald-500 rounded-sm" /> Done</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 2xl:w-3 2xl:h-3 bg-[#FF5A00] rounded-sm" /> Active</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 2xl:w-3 2xl:h-3 bg-slate-300 rounded-sm" /> Pending</div>
          <div className="w-px h-4 bg-black/10 mx-1" />
          <div className="flex items-center gap-1.5"><div className="w-1 h-3 2xl:h-4 bg-red-500 rounded-full" /> Today</div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar pb-4">
        <div className="min-w-[800px] 2xl:min-w-[1200px]">
          
          <div className="flex mb-3">
            <div className="w-[30%] shrink-0 border-r border-black/10 pr-4 flex items-end pb-2">
              <div className="text-xs 2xl:text-sm font-bold text-gray-400 uppercase tracking-wider">Task Breakdown</div>
            </div>
            <div className="w-[70%] shrink-0 pl-4 relative h-8 2xl:h-10 border-b border-black/10">
              {monthMarkers.map((m, i) => (
                <div key={i} className="absolute top-0 border-l border-black/10 pl-2 h-full flex flex-col justify-end pb-1" style={{ left: `${m.pct}%` }}>
                  <div className="text-[10px] sm:text-xs 2xl:text-sm font-bold text-[#000F1B] leading-none">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative space-y-1 md:space-y-2">
            <div className="absolute top-0 bottom-0 pointer-events-none z-20" style={{ left: `calc(30% + 16px + ${todayPct}% * 0.70)` }}>
              <div className="w-0.5 h-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
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
                <div key={idx} className="group pb-2 md:pb-3">
                  <div className="flex items-center py-2 bg-white hover:bg-[#F9FAFB] rounded-lg border border-transparent hover:border-black/5 transition">
                    <div className="w-[30%] shrink-0 px-2 flex items-center gap-3 min-w-0 border-r border-black/5">
                      <div className="text-xs 2xl:text-sm font-black text-white bg-[#000F1B] w-5 h-5 2xl:w-7 2xl:h-7 rounded-md grid place-items-center shrink-0">{(idx + 1)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs sm:text-sm 2xl:text-base text-[#000F1B] truncate">{stage.name}</div>
                      </div>
                      <div className="text-[10px] sm:text-xs 2xl:text-sm font-black w-8 2xl:w-10 text-right text-[#000F1B]">{stage.progress_pct || 0}%</div>
                    </div>

                    <div className="w-[70%] shrink-0 pl-4 relative h-5 2xl:h-6 flex items-center">
                      {hasDates && (
                        <div className="absolute h-3 2xl:h-4 rounded shadow-sm overflow-hidden" style={{ left: `${leftPct}%`, width: `${widthPct}%`, minWidth: '4px' }}>
                          <div className={`h-full ${barColor} relative`}>
                            {isActive && stage.progress_pct > 0 && <div className="absolute top-0 left-0 h-full bg-white/30" style={{ width: `${stage.progress_pct}%` }} />}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {substages.length > 0 && (
                    <div className="ml-4 md:ml-6 border-l-2 border-black/10 space-y-1 pt-1">
                      {substages.map((sub, sIdx) => {
                        const subStart = sub.start_date ? new Date(sub.start_date) : sStart;
                        const subEnd = sub.actual_end_date ? new Date(sub.actual_end_date) : sub.planned_end_date ? new Date(sub.planned_end_date) : sEnd;
                        const subHasDates = subStart && subEnd;
                        const subLeft = subHasDates ? Math.max(0, ((subStart - startDate) / totalMs) * 100) : 0;
                        const subWidth = subHasDates ? Math.max(0.5, ((subEnd - subStart) / totalMs) * 100) : 0;
                        const subColor = sub.status === "completed" ? "bg-emerald-400" : sub.status === "in_progress" ? "bg-[#FFA500]" : "bg-slate-200";

                        return (
                          <div key={sIdx} className="flex items-center hover:bg-[#F9FAFB] transition relative py-1">
                            <div className="absolute top-1/2 left-0 w-3 2xl:w-4 border-t-2 border-black/10" />
                            <div className="w-[30%] shrink-0 pl-6 pr-2 flex items-center gap-2 min-w-0">
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-[10px] sm:text-xs 2xl:text-sm text-gray-500 truncate">{sub.name}</div>
                              </div>
                              <span className="text-[10px] sm:text-xs 2xl:text-sm font-bold text-gray-400">{sub.progress_pct || 0}%</span>
                            </div>
                            <div className="w-[70%] shrink-0 pl-4 relative h-3 2xl:h-4 flex items-center">
                              {subHasDates && <div className={`absolute h-1.5 2xl:h-2 rounded-full ${subColor} opacity-90`} style={{ left: `${subLeft}%`, width: `${subWidth}%`, minWidth: '2px' }} />}
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
// MONTHLY PROGRESS (Responsive Chart)
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
    return data.slice(-8); // Show last 8 months for responsiveness
  };
  
  const chartData = calculateChartData();

  const handleDownloadReport = async (monthStr) => {
    toast.info(`Generating ${monthStr} Report...`);
    const formattedMonth = monthStr.replace(" ", "-").toLowerCase();
    window.open(`${API_BASE}/portal/my-project/${project.id}/monthly-report/${formattedMonth}/pdf`, "_blank");
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-4 md:p-6 2xl:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 flex-wrap gap-4">
          <h3 className="font-bold text-base md:text-lg 2xl:text-xl text-[#000F1B]">Planned vs Actual Progression</h3>
          <div className="flex gap-4 text-[10px] md:text-xs 2xl:text-sm font-bold uppercase tracking-wider text-gray-500">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-200 rounded-sm" /> Planned</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#FF5A00] rounded-sm" /> Actual</div>
          </div>
        </div>

        {/* Responsive Chart Height */}
        <div className="relative h-48 sm:h-64 lg:h-80 2xl:h-96 w-full mt-4 border-l-2 border-b-2 border-black/10 pb-6 pl-8 2xl:pl-12">
          <div className="absolute left-0 top-0 bottom-6 w-6 2xl:w-10 flex flex-col justify-between text-[10px] md:text-xs 2xl:text-sm font-bold text-gray-400 text-right pr-2">
            <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
          </div>
          <div className="absolute left-8 2xl:left-12 right-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none z-0">
            {[100, 75, 50, 25].map(val => <div className="w-full border-t border-black/5 border-dashed" key={val}></div>)}
          </div>

          <div className="absolute left-8 2xl:left-12 right-0 top-0 bottom-6 flex items-end justify-around px-2 z-10">
            {chartData.map((d, i) => (
              <div key={i} className="flex gap-1 md:gap-2 h-full items-end group relative w-full justify-center cursor-pointer">
                <div className="absolute -top-12 md:-top-14 bg-[#000F1B] text-white text-[10px] md:text-xs 2xl:text-sm font-bold px-3 py-1.5 md:py-2 rounded-lg shadow-xl hidden group-hover:block z-20 whitespace-nowrap text-center">
                  <div className="text-white/60 mb-1">{d.fullLabel}</div>
                  <span className="text-slate-300">Plan: {d.planned}%</span> <span className="mx-1 opacity-40">|</span> <span className="text-[#FF5A00]">Act: {d.actual}%</span>
                </div>
                <div className="w-4 sm:w-6 md:w-8 2xl:w-12 bg-slate-200 rounded-t-md transition-all duration-700 ease-out group-hover:bg-slate-300" style={{ height: `${d.planned}%` }}></div>
                <div className="w-4 sm:w-6 md:w-8 2xl:w-12 bg-gradient-to-t from-[#FF5A00] to-[#FFA500] rounded-t-md shadow-[0_-2px_10px_rgba(255,90,0,0.3)] transition-all duration-700 ease-out group-hover:brightness-110" style={{ height: `${d.actual}%` }}></div>
              </div>
            ))}
          </div>

          <div className="absolute left-8 2xl:left-12 right-0 bottom-[-10px] md:bottom-[-12px] h-6 flex justify-around items-end text-[10px] md:text-xs 2xl:text-sm font-bold text-gray-500 uppercase tracking-wider">
            {chartData.map((d, i) => <div key={i} className="text-center w-full">{d.label}</div>)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-black/5 bg-[#F9FAFB]">
          <h3 className="text-sm md:text-base 2xl:text-lg font-bold text-[#000F1B]">Monthly Archive</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm 2xl:text-base min-w-[600px]">
            <thead className="text-gray-400 border-b border-black/5 bg-white">
              <tr>
                <th className="px-4 py-3 md:py-4 font-bold uppercase tracking-wider">Month</th>
                <th className="px-4 py-3 md:py-4 font-bold uppercase tracking-wider text-center">Planned</th>
                <th className="px-4 py-3 md:py-4 font-bold uppercase tracking-wider text-center">Actual</th>
                <th className="px-4 py-3 md:py-4 font-bold uppercase tracking-wider text-center hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 md:py-4 font-bold uppercase tracking-wider text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {[...chartData].reverse().map((d) => (
                <tr key={d.fullLabel} className="hover:bg-black/[0.02] transition-colors">
                  <td className="px-4 py-3 md:py-4 font-bold text-[#000F1B]">{d.fullLabel}</td>
                  <td className="px-4 py-3 md:py-4 text-center font-medium text-gray-500">{d.planned}%</td>
                  <td className="px-4 py-3 md:py-4 text-center font-black text-[#FF5A00]">{d.actual}%</td>
                  <td className="px-4 py-3 md:py-4 text-center hidden sm:table-cell">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] md:text-xs 2xl:text-sm font-bold uppercase tracking-wider ${d.status === 'On Track' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      <Circle className="w-2 h-2 fill-current" /> {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 md:py-4 text-right">
                    <button onClick={() => handleDownloadReport(d.fullLabel)} className="inline-flex items-center justify-center gap-1.5 text-[10px] md:text-xs 2xl:text-sm font-bold text-white bg-[#000F1B] hover:bg-[#FF5A00] px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition shadow-sm">
                      <Download className="w-3 h-3 md:w-4 md:h-4" /> PDF
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
  
  // 1. Get Daily Report Photos
  reports.forEach(rep => { 
    (rep.photos || []).forEach(p => {
      const imgUrl = typeof p === 'string' ? p : (p.url || p.absoluteUrl);
      if (imgUrl) {
        photos.push({ url: imgUrl, caption: p.caption || "Site Update", date: rep.date, category: "Daily Update" });
      }
    }); 
  });
  
  // 2. Get Stage Photos
  stages.forEach(stg => { 
    (stg.photos || []).forEach(p => {
      const imgUrl = typeof p === 'string' ? p : (p.url || p.absoluteUrl);
      if (imgUrl) {
        photos.push({ url: imgUrl, caption: `${stg.name} Progress`, date: stg.updated_at || stg.start_date, category: stg.name });
      }
    }); 
  });

  if (photos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-black/5 grid place-items-center mb-4">
          <ImageIcon className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="font-bold text-lg md:text-xl text-[#000F1B]">No photos available</h3>
        <p className="text-sm text-gray-400 mt-2 max-w-md">Images and site progress captures will appear here once uploaded by the engineering team.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-4 md:p-6 2xl:p-8 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/5 pb-4 gap-4">
        <div>
          <h3 className="text-sm md:text-base 2xl:text-xl font-bold text-[#000F1B]">Site Gallery</h3>
          <p className="text-xs md:text-sm 2xl:text-base text-gray-400 font-medium mt-1">{photos.length} visual records</p>
        </div>
        
        <div className="flex items-center gap-1 bg-[#F5F6F8] p-1 rounded-lg border border-black/5 self-start sm:self-auto">
          <button onClick={() => setViewMode("card")} className={`p-2 rounded-md transition ${viewMode === "card" ? "bg-white shadow-sm text-[#FF5A00]" : "text-gray-400 hover:text-[#000F1B]"}`} title="Grid View">
            <LayoutGrid className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button onClick={() => setViewMode("list")} className={`p-2 rounded-md transition ${viewMode === "list" ? "bg-white shadow-sm text-[#FF5A00]" : "text-gray-400 hover:text-[#000F1B]"}`} title="List View">
            <List className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
          {photos.map((img, idx) => (
            <div key={idx} className="group rounded-xl border border-black/5 overflow-hidden bg-black/5 relative aspect-square hover:shadow-lg transition-all duration-300">
              <img src={resolveMediaUrl(img.url)} alt="Site Progress" className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <span className="text-white text-xs md:text-sm font-bold truncate mb-1">{img.caption}</span>
                <div className="flex items-center justify-between text-white/80 text-[10px] md:text-xs font-semibold">
                  <span className="truncate pr-2">{img.category}</span>
                  <span className="shrink-0">{img.date ? new Date(img.date).toLocaleDateString("en-IN") : "Recent"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs md:text-sm 2xl:text-base min-w-[800px]">
            <thead className="bg-[#F9FAFB] text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-bold rounded-tl w-20">Preview</th>
                <th className="px-4 py-3 font-bold">Caption</th>
                <th className="px-4 py-3 font-bold">Category</th>
                <th className="px-4 py-3 font-bold text-right rounded-tr">Upload Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {photos.map((img, idx) => (
                <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-2">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden border border-black/10 bg-gray-100">
                      <img src={resolveMediaUrl(img.url)} alt="" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-4 py-2 font-bold text-[#000F1B]">{img.caption}</td>
                  <td className="px-4 py-2 text-[#FF5A00] font-semibold text-[10px] md:text-xs uppercase tracking-wider">{img.category}</td>
                  <td className="px-4 py-2 text-right font-medium text-gray-500">{img.date ? new Date(img.date).toLocaleDateString("en-IN") : "—"}</td>
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
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-[#FF5A00]/10 grid place-items-center mb-4">
          <FileText className="w-8 h-8 text-[#FF5A00]" />
        </div>
        <h3 className="font-bold text-lg md:text-xl text-[#000F1B]">No verified reports</h3>
        <p className="text-sm text-gray-400 mt-2 max-w-md">Check back later when site updates are published by the PM.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      
      {/* Header Controls */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-black/5 shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-sm md:text-base 2xl:text-xl text-[#000F1B] flex items-center gap-2">
            <HardHat className="w-4 h-4 md:w-5 md:h-5 text-[#FF5A00]" /> Daily Progress Report
          </h3>
          <p className="text-xs md:text-sm 2xl:text-base text-gray-500 font-medium mt-1">PM-verified daily site updates & logs</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full sm:w-auto bg-[#F5F6F8] border border-black/10 rounded-xl px-4 py-2.5 text-xs md:text-sm font-bold text-[#000F1B] focus:outline-none focus:border-[#FF5A00] cursor-pointer">
            {reports.map(r => <option key={r.id} value={r.date}>{new Date(r.date).toLocaleDateString("en-IN", { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</option>)}
          </select>
          <button onClick={handleDownloadFullPDF} className="w-full sm:w-auto px-5 py-2.5 bg-[#000F1B] hover:bg-[#FF5A00] text-white text-xs md:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
            <Download className="w-4 h-4" /> Download PDF Report
          </button>
        </div>
      </div>

      {/* Report Body */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          
          <div className="lg:col-span-4 space-y-4 md:space-y-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <h4 className="text-[10px] md:text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Site Status</h4>
              <div className="flex items-center gap-2 text-emerald-700 font-black text-sm md:text-base">
                <CheckCircle2 className="w-5 h-5 fill-current" /> {report.overall_status}
              </div>
              {report.status_notes && <p className="text-xs md:text-sm text-emerald-800 mt-3 font-medium leading-relaxed bg-emerald-100/50 p-3 rounded-lg border border-emerald-200/50">"{report.status_notes}"</p>}
            </div>
            
            <div className="bg-white border border-black/5 shadow-sm rounded-2xl p-5">
              <h4 className="font-bold text-xs md:text-sm text-[#000F1B] mb-3 uppercase tracking-wide border-b border-black/5 pb-2">Work Completed Today</h4>
              <ul className="space-y-2.5">
                {(report.work_completed || []).map((work, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm font-medium text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> <span className="leading-relaxed">{work}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white border border-black/5 shadow-sm rounded-2xl p-5">
              <h4 className="font-bold text-xs md:text-sm text-[#000F1B] mb-3 uppercase tracking-wide border-b border-black/5 pb-2">Planned Tomorrow</h4>
              <ul className="space-y-2.5">
                {(report.planned_tomorrow || []).map((work, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm font-medium text-gray-500">
                    <Circle className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" /> <span className="leading-relaxed">{work}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white border border-black/5 shadow-sm rounded-2xl p-5 md:p-6 2xl:p-8">
            <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-3">
              <h4 className="font-bold text-xs md:text-sm 2xl:text-base text-[#000F1B] uppercase tracking-wider">Site Execution Images</h4>
              <span className="text-[10px] md:text-xs font-bold text-gray-500 bg-[#F5F6F8] px-3 py-1 rounded-lg">{(report.photos || []).length} photos attached</span>
            </div>
            
            {(report.photos || []).length === 0 ? (
              <div className="text-center py-16 text-sm italic text-gray-400 border-2 border-dashed border-black/5 rounded-xl bg-gray-50">No photos attached for this date.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {(report.photos || []).map((p, i) => {
                   const u = typeof p === 'string' ? p : p.url;
                   return (
                    <div key={i} className="group rounded-xl border border-black/5 bg-[#F9FAFB] overflow-hidden hover:shadow-md transition duration-300">
                      <div className="aspect-video bg-black/5 overflow-hidden relative">
                        <img src={resolveMediaUrl(u)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        {p.time && <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm shadow-sm">{p.time}</div>}
                      </div>
                      <div className="p-3 text-xs md:text-sm font-bold text-[#000F1B] truncate" title={p.caption}>{p.caption || "Site update"}</div>
                    </div>
                  );
                })}
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
    pending: { label: "Pending", color: "text-gray-500 bg-[#F5F6F8] border-black/10", Icon: Circle }
  };
  const c = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-wider border ${c.color}`}>
      <c.Icon className="w-3 h-3 md:w-3.5 md:h-3.5" />
      {c.label}
    </span>
  );
}

function KpiBlock({ title, value, subtitle, icon: Icon, accent }) {
  return (
    <div className="bg-white rounded-xl border border-black/5 p-3 sm:p-4 2xl:p-6 shadow-sm hover:shadow-md transition relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 lg:w-1.5 h-full transition-all group-hover:w-2" style={{ background: accent }} />
      <div className="flex items-start justify-between gap-2 mb-2 pl-2">
        <div className="text-[10px] sm:text-xs 2xl:text-sm font-bold text-gray-500 uppercase tracking-wider leading-tight">{title}</div>
        <Icon className="w-4 h-4 2xl:w-6 2xl:h-6 shrink-0 opacity-80" style={{ color: accent }} />
      </div>
      <div className="pl-2">
        <div className="text-lg sm:text-xl lg:text-2xl 2xl:text-4xl font-black text-[#000F1B] leading-none mb-1">{value}</div>
        <div className="text-[10px] sm:text-xs 2xl:text-sm font-semibold text-gray-400">{subtitle}</div>
      </div>
    </div>
  );
}
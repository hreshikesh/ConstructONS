import React, { useState } from "react";
import { 
  TrendingUp, Calendar, CheckCircle2, PlayCircle, Circle, 
  Download, Image as ImageIcon, FileText, HardHat
} from "lucide-react";
import { usePortal } from "../context/PortalContext";
import { resolveMediaUrl } from "../../../lib/mediaUrl";
import { toast } from "sonner";
import { API_BASE } from "../../../lib/api";

const TABS = ["Overview", "Site Schedule", "Monthly Progress", "Project Photos", "Daily Progress Report"];

export default function ProgressPage() {
  const { project } = usePortal();
  const [activeTab, setActiveTab] = useState("Overview");

  if (!project) {
    return <div className="p-10 flex justify-center"><div className="w-6 h-6 border-2 border-[#FF5A00] border-t-transparent rounded-full animate-spin" /></div>;
  }

  // --- REAL KPI CALCULATIONS ---
  const stages = project.stages || [];
  const totalWeight = stages.length || 1;
  const overallProgress = Math.round(stages.reduce((sum, s) => sum + (Number(s.progress_pct) || 0), 0) / totalWeight);
  const stagesCompleted = stages.filter(s => s.status === "completed").length;
  
  const startDate = new Date(project.start_date || project.created_at || Date.now());
  const expectedDate = project.expected_completion ? new Date(project.expected_completion) : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
  const today = new Date();
  
  const daysElapsed = Math.max(0, Math.floor((today - startDate) / (1000 * 60 * 60 * 24)));
  const totalDays = Math.max(1, Math.floor((expectedDate - startDate) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, Math.floor((expectedDate - today) / (1000 * 60 * 60 * 24)));

  const approvedReports = (project.daily_reports || []).filter(r => r.is_approved).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="max-w-[1400px] mx-auto space-y-4 font-['Poppins'] pb-10">
      
      {/* Header & Tabs */}
      <div>
        <h1 className="text-xl font-bold text-[#000F1B] mb-2">Project Progress</h1>
        <div className="flex overflow-x-auto no-scrollbar border-b border-black/5">
          {TABS.map(tab => (
            <button
              key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-[11px] font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab ? "border-[#FF5A00] text-[#000F1B]" : "border-transparent text-[#111111]/50 hover:text-[#000F1B]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <KpiBlock title="Overall Progress" value={`${overallProgress}%`} subtitle={overallProgress >= 100 ? "Completed" : "On Track"} 
          icon={<div className="w-7 h-7 rounded-full border-[3px] border-[#F2F2F2] border-t-[#FF5A00] flex items-center justify-center text-[8px] font-bold text-[#000F1B]">{overallProgress}%</div>} />
        <KpiBlock title="Stages Completed" value={stagesCompleted} subtitle={`Out of ${stages.length}`} icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />} />
        <KpiBlock title="Days Elapsed" value={daysElapsed} subtitle={`of ${totalDays} days`} icon={<Calendar className="w-6 h-6 text-blue-500" />} />
        <KpiBlock title="Days Remaining" value={daysRemaining} subtitle="Estimated" icon={<Calendar className="w-6 h-6 text-amber-500" />} />
        <KpiBlock title="Expected Delivery" value={expectedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })} subtitle="Forecast Date" icon={<TrendingUp className="w-6 h-6 text-[#FF5A00]" />} />
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "Overview" && <OverviewTab project={project} stages={stages} />}
        {activeTab === "Site Schedule" && <SiteScheduleTab stages={stages} startDate={startDate} expectedDate={expectedDate} />}
        {activeTab === "Monthly Progress" && <MonthlyProgressTab project={project} startDate={startDate} expectedDate={expectedDate} overallProgress={overallProgress} />}
        {activeTab === "Project Photos" && <ProjectPhotosTab reports={approvedReports} stages={stages} />}
        {activeTab === "Daily Progress Report" && <DailyProgressTab reports={approvedReports} />}
      </div>
    </div>
  );
}

// ============================================================================
// COMPACT TAB COMPONENTS
// ============================================================================

function OverviewTab({ project, stages }) {
  const currentStageIdx = stages.findIndex(s => s.status === "in_progress");
  const team = project.team_directory || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-8 bg-white rounded-xl border border-black/5 shadow-sm p-4">
        <h3 className="text-[11px] font-bold text-[#000F1B] uppercase tracking-wider mb-3">Construction Stages</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] whitespace-nowrap">
            <thead className="text-[#111111]/40 border-b border-black/5">
              <tr>
                <th className="pb-2 font-semibold px-2">#</th>
                <th className="pb-2 font-semibold px-2">Stage</th>
                <th className="pb-2 font-semibold px-2">Status</th>
                <th className="pb-2 font-semibold px-2 w-[120px]">Progress</th>
                <th className="pb-2 font-semibold px-2 text-right">Planned End</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {stages.map((stage, i) => {
                const isActive = stage.status === "in_progress";
                const isCompleted = stage.status === "completed";
                const pct = Number(stage.progress_pct) || 0;
                return (
                  <tr key={i} className={`transition-colors ${isActive ? "bg-[#FF5A00]/5" : "hover:bg-[#F9FAFB]"}`}>
                    <td className="py-2 px-2 text-[#111111]/40 font-mono">{(i + 1).toString().padStart(2, '0')}</td>
                    <td className={`py-2 px-2 font-bold ${isActive ? "text-[#FF5A00]" : "text-[#000F1B]"}`}>{stage.name}</td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1.5">
                        {isCompleted ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : isActive ? <PlayCircle className="w-3 h-3 text-[#FF5A00]" /> : <Circle className="w-3 h-3 text-[#111111]/20" />}
                        <span className={`font-semibold ${isCompleted ? "text-emerald-600" : isActive ? "text-[#FF5A00]" : "text-[#111111]/40"}`}>
                          {isCompleted ? "Completed" : isActive ? "In Progress" : "Pending"}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-[#F2F2F2] rounded-full overflow-hidden"><div className={`h-full rounded-full ${isCompleted ? "bg-emerald-500" : "bg-[#FF5A00]"}`} style={{ width: `${pct}%` }} /></div>
                        <span className="text-[9px] font-bold w-6 text-right">{pct}%</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right text-[#111111]/60">{stage.expected_date ? new Date(stage.expected_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "TBD"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white rounded-xl border border-black/5 shadow-sm p-4">
          <h3 className="text-[9px] font-bold text-[#111111]/40 uppercase tracking-widest mb-3">Current Stage</h3>
          {currentStageIdx !== -1 ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <PlayCircle className="w-4 h-4 text-[#FF5A00]" />
                <h4 className="text-xs font-bold text-[#000F1B]">{stages[currentStageIdx].name}</h4>
              </div>
              <p className="text-[10px] text-[#111111]/70 leading-relaxed">{stages[currentStageIdx].description}</p>
            </div>
          ) : <div className="text-[10px] text-[#111111]/40 italic">No active stage.</div>}
        </div>

        <div className="bg-white rounded-xl border border-black/5 shadow-sm p-4">
          <h3 className="text-[9px] font-bold text-[#111111]/40 uppercase tracking-widest mb-3">Project Team</h3>
          <div className="space-y-3">
            {team.filter(t => t.status !== "Pending").slice(0, 4).map((member, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                {member.avatar || member.photo ? <img src={resolveMediaUrl(member.avatar || member.photo)} alt="" className="w-7 h-7 rounded-full object-cover border border-black/5" /> : <div className="w-7 h-7 rounded-full bg-[#F2F2F2] flex items-center justify-center text-[#000F1B] font-bold text-[10px]">{member.name?.[0] || "?"}</div>}
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-[#000F1B] truncate">{member.name}</div>
                  <div className="text-[9px] text-[#111111]/50 truncate">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SiteScheduleTab({ stages, startDate, expectedDate }) {
  const totalMs = expectedDate - startDate || 1;
  const msPerDay = 1000 * 60 * 60 * 24;

  return (
    <div className="bg-white rounded-xl border border-black/5 shadow-sm p-4 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[#000F1B]">Gantt Schedule</h3>
        <div className="flex items-center gap-3 text-[9px] font-semibold text-[#111111]/60 uppercase tracking-wider">
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" /> Done</div>
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-[#FF5A00] rounded-sm" /> Active</div>
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-slate-200 rounded-sm" /> Pending</div>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-[700px]">
          {/* Table Header */}
          <div className="flex text-[9px] font-bold text-[#111111]/40 uppercase tracking-wider border-b border-black/5 pb-1 mb-2">
            <div className="w-[30%] shrink-0">Stage</div>
            <div className="w-[20%] shrink-0">Timeline</div>
            <div className="w-[50%] shrink-0 pl-3 border-l border-black/5">Duration Map</div>
          </div>

          {/* Gantt Rows */}
          <div className="space-y-1.5 relative">
            {/* TODAY marker line */}
            <div
              className="absolute top-0 bottom-0 w-px bg-red-500 z-0 border-r border-dashed border-red-200"
              style={{ left: `${Math.max(0, Math.min(100, ((new Date() - startDate) / totalMs) * 100))}%`, marginLeft: '50%' }}
            >
              <div className="absolute -top-2 -translate-x-1/2 bg-red-500 text-white text-[7px] font-bold px-1 rounded">TODAY</div>
            </div>

            {stages.map((stage, idx) => {
              // Strictly date-driven: check if real dates exist
              const hasRealDates = Boolean(stage.started_at || stage.expected_date || stage.completed_at);

              const sStart = stage.started_at ? new Date(stage.started_at) : stage.expected_date ? new Date(stage.expected_date) : startDate;
              const sEnd = stage.completed_at ? new Date(stage.completed_at) : stage.expected_date ? new Date(stage.expected_date) : sStart;

              let leftPct = Math.max(0, ((sStart - startDate) / totalMs) * 100);
              let widthPct = Math.max(1, ((sEnd - sStart) / totalMs) * 100);
              if (leftPct + widthPct > 100) widthPct = 100 - leftPct;

              const isCompleted = stage.status === "completed";
              const isActive = stage.status === "in_progress";
              const durationDays = Math.max(1, Math.floor((sEnd - sStart) / msPerDay));

              return (
                <div key={idx} className="flex items-center text-[11px] relative z-10 hover:bg-black/[0.02] py-1">
                  <div className="w-[30%] shrink-0 pr-3 font-semibold text-[#000F1B] truncate">
                    {idx + 1}. {stage.name}
                  </div>

                  <div className="w-[20%] shrink-0 pr-3 text-[9px] text-[#111111]/60 flex gap-1.5">
                    {hasRealDates ? (
                      <>
                        <span>{sStart.toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })}</span>
                        <span>-</span>
                        <span>{sEnd.toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })}</span>
                      </>
                    ) : (
                      <span className="italic text-[#111111]/30">Dates Pending</span>
                    )}
                  </div>

                  {/* Visual Bar Container */}
                  <div className="w-[50%] shrink-0 pl-3 border-l border-black/5 relative h-4 bg-transparent">
                    {hasRealDates ? (
                      <div
                        className={`absolute top-0.5 bottom-0.5 rounded shadow-sm transition-all duration-300 ${
                          isCompleted ? "bg-emerald-500" : isActive ? "bg-[#FF5A00]" : "bg-slate-200"
                        }`}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      />
                    ) : (
                      <div className="h-full flex items-center">
                        <span className="text-[8px] font-semibold text-[#111111]/30 bg-black/5 px-2 py-0.5 rounded">
                          Target date unassigned
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthlyProgressTab({ project, startDate, expectedDate, overallProgress }) {
  
  const calculateChartData = () => {
    // REAL DB SNAPSHOTS ONLY
    const dbRecords = project.monthly_progress || [];
    const data = [];
    
    let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const today = new Date();
    const totalDurationMonths = Math.max(1, (expectedDate.getFullYear() - startDate.getFullYear()) * 12 + (expectedDate.getMonth() - startDate.getMonth()));
    
    let monthIndex = 0;
    let lastKnownActual = 0; // Carry over progress if nothing happened in a month
    
    while (current <= today && monthIndex <= totalDurationMonths) {
      const monthLabel = current.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      
      // Mathematical straight-line plan (standard construction forecasting)
      const plannedPct = Math.min(100, Math.round(((monthIndex + 1) / totalDurationMonths) * 100));
      
      // REAL ACTUAL: Check if DB has a snapshot for this exact month
      const dbRecord = dbRecords.find(r => r.month === monthLabel);
      
      if (dbRecord) {
        lastKnownActual = dbRecord.actual_pct;
      }

      data.push({
        label: current.toLocaleDateString("en-US", { month: "short" }),
        fullLabel: monthLabel,
        planned: plannedPct,
        actual: lastKnownActual, // 100% real data
        status: lastKnownActual >= plannedPct - 5 ? "On Track" : "Delayed"
      });
      
      current.setMonth(current.getMonth() + 1);
      monthIndex++;
    }
    return data.slice(-8); // Limit to last 8 months for UI compactness
  };
  
  const chartData = calculateChartData();

  const handleDownloadReport = async (monthStr) => {
    toast.info(`Generating ${monthStr} Report PDF...`);
    const formattedMonth = monthStr.replace(" ", "-").toLowerCase();
    window.open(`${API_BASE}/portal/my-project/${project.id}/monthly-report/${formattedMonth}/pdf`, "_blank");
  };

  return (
    <div className="space-y-4">
      {/* 📊 BAR CHART */}
      <div className="bg-white rounded-xl border border-black/5 shadow-sm p-5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-sm text-[#000F1B]">Planned vs Actual Progress</h3>
          <div className="flex gap-4 text-[10px] font-semibold text-[#111111]/60">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-slate-200 rounded-sm" /> Planned</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[#FF5A00] rounded-sm" /> Actual</div>
          </div>
        </div>

        <div className="relative h-48 w-full max-w-4xl mx-auto mt-4">
          <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[9px] text-[#111111]/40 text-right pr-2 z-10">
            <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
          </div>

          <div className="absolute left-8 right-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none z-0">
            {[100, 75, 50, 25, 0].map(val => <div className="w-full border-t border-black/5" key={val}></div>)}
          </div>

          <div className="absolute left-8 right-0 top-0 bottom-6 flex items-end justify-around px-2 z-10">
            {chartData.map((d, i) => (
              <div key={i} className="flex gap-1 h-full items-end group relative w-full justify-center">
                <div className="absolute -top-8 bg-[#000F1B] text-white text-[10px] px-2 py-1 rounded shadow-lg hidden group-hover:block z-20 whitespace-nowrap">
                  <strong>{d.fullLabel}</strong><br/>
                  Planned: {d.planned}% | Actual: {d.actual}%
                </div>
                <div className="w-2.5 sm:w-4 md:w-6 bg-slate-200 rounded-t transition-all duration-500 ease-out group-hover:opacity-80" style={{ height: `${d.planned}%` }}></div>
                <div className="w-2.5 sm:w-4 md:w-6 bg-[#FF5A00] rounded-t transition-all duration-500 ease-out group-hover:opacity-80" style={{ height: `${d.actual}%` }}></div>
              </div>
            ))}
          </div>

          <div className="absolute left-8 right-0 bottom-0 h-6 flex justify-around items-end text-[10px] font-semibold text-[#111111]/50">
            {chartData.map((d, i) => <div key={i} className="text-center w-full">{d.label}</div>)}
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-black/5 flex justify-between items-center bg-[#F9FAFB]">
          <h3 className="text-sm font-bold text-[#000F1B]">Monthly Reports Archive</h3>
        </div>
        <table className="w-full text-left text-[11px] whitespace-nowrap">
          <thead className="text-[#111111]/40 border-b border-black/5">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Month</th>
              <th className="px-4 py-2.5 font-semibold text-center">Planned</th>
              <th className="px-4 py-2.5 font-semibold text-center">Actual (Verified)</th>
              <th className="px-4 py-2.5 font-semibold text-center">Status</th>
              <th className="px-4 py-2.5 font-semibold text-right">Report Document</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {[...chartData].reverse().map((d) => (
              <tr key={d.fullLabel} className="hover:bg-black/[0.02]">
                <td className="px-4 py-3 font-bold text-[#000F1B]">{d.fullLabel}</td>
                <td className="px-4 py-3 text-center">{d.planned}%</td>
                <td className="px-4 py-3 text-center font-bold text-[#FF5A00]">{d.actual}%</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center justify-center gap-1 font-semibold ${d.status === 'On Track' ? 'text-emerald-600' : 'text-amber-500'}`}>
                    <Circle className="w-2 h-2 fill-current" /> {d.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDownloadReport(d.fullLabel)} className="inline-flex items-center gap-1.5 text-[9px] font-bold text-[#000F1B] hover:text-[#FF5A00] border border-black/10 hover:border-[#FF5A00] bg-white px-2.5 py-1.5 rounded transition uppercase tracking-wider">
                    <Download className="w-3 h-3" /> Download PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function ProjectPhotosTab({ reports, stages }) {
  let photos = [];
  reports.forEach(rep => { (rep.photos || []).forEach(p => photos.push({ url: p.url, caption: p.caption || "Site Update", date: rep.date })); });
  if (photos.length === 0) {
    stages.forEach(stg => { (stg.photos || []).forEach(p => photos.push({ url: p, caption: `${stg.name} Progress`, date: stg.updated_at })); });
  }

  if (photos.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-black/5 shadow-sm p-10 flex flex-col items-center justify-center text-center">
        <ImageIcon className="w-8 h-8 text-[#111111]/20 mb-2" />
        <h3 className="font-bold text-sm text-[#000F1B]">No photos yet</h3>
        <p className="text-[10px] text-[#111111]/50 mt-1">Images will appear here once the engineer uploads them.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-black/5 shadow-sm p-4">
      <h3 className="text-sm font-bold text-[#000F1B] mb-4">Project Gallery</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {photos.map((img, idx) => (
          <div key={idx} className="group rounded-lg border border-black/5 overflow-hidden bg-black/5 relative aspect-square">
            <img src={resolveMediaUrl(img.url)} alt="Site Progress" className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
              <span className="text-white text-[9px] font-bold truncate">{img.caption}</span>
              <span className="text-white/70 text-[8px]">{new Date(img.date).toLocaleDateString("en-IN")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DailyProgressTab({ reports }) {
  const [selectedDate, setSelectedDate] = useState(reports[0]?.date || "");
  const report = reports.find(r => r.date === selectedDate);

  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-black/5 shadow-sm p-10 flex flex-col items-center justify-center text-center">
        <FileText className="w-8 h-8 text-[#111111]/20 mb-2" />
        <h3 className="font-bold text-sm text-[#000F1B]">No approved reports</h3>
        <p className="text-[10px] text-[#111111]/50 mt-1">Check back later when the PM approves the first report.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-black/5 shadow-sm">
        <h3 className="font-bold text-sm text-[#000F1B] flex items-center gap-2"><HardHat className="w-4 h-4 text-[#FF5A00]" /> Daily Report</h3>
        <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-[#F9FAFB] border border-black/10 rounded-md px-2 py-1.5 text-[11px] font-bold text-[#000F1B] focus:outline-none">
          {reports.map(r => <option key={r.id} value={r.date}>{new Date(r.date).toLocaleDateString("en-IN", { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</option>)}
        </select>
      </div>

      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-3">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
              <h4 className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider mb-1">Site Status</h4>
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 fill-current" /> {report.overall_status}
              </div>
              <p className="text-[9px] text-emerald-600 mt-1.5 leading-relaxed">{report.status_notes}</p>
            </div>
            <div className="bg-white border border-black/5 shadow-sm rounded-xl p-4">
              <h4 className="font-bold text-[11px] text-[#000F1B] mb-2 uppercase tracking-wide">Work Completed</h4>
              <ul className="space-y-1.5">
                {(report.work_completed || []).map((work, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[10px] text-[#111111]/70">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" /> <span>{work}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-black/5 shadow-sm rounded-xl p-4">
              <h4 className="font-bold text-[11px] text-[#000F1B] mb-2 uppercase tracking-wide">Planned Tomorrow</h4>
              <ul className="space-y-1.5">
                {(report.planned_tomorrow || []).map((work, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[10px] text-[#111111]/70">
                    <Circle className="w-3 h-3 text-[#111111]/30 shrink-0 mt-0.5" /> <span>{work}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white border border-black/5 shadow-sm rounded-xl p-4">
            <h4 className="font-bold text-[11px] text-[#000F1B] mb-3 uppercase tracking-wide">Site Images</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(report.photos || []).map((p, i) => (
                <div key={i} className="group">
                  <div className="aspect-video rounded-lg bg-black/5 overflow-hidden border border-black/5 mb-1.5">
                    <img src={resolveMediaUrl(p.url)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <div className="text-[9px] font-bold text-[#000F1B] truncate">{p.caption}</div>
                  <div className="text-[8px] text-[#111111]/40">{p.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiBlock({ title, value, subtitle, icon }) {
  return (
    <div className="bg-white rounded-xl border border-black/5 p-3 shadow-sm flex flex-col justify-between hover:shadow-md transition">
      <div className="flex items-start justify-between gap-1 mb-2">
        <div className="text-[9px] font-bold text-[#111111]/50 uppercase tracking-wider leading-tight">{title}</div>
        <div className="shrink-0 scale-75 origin-top-right">{icon}</div>
      </div>
      <div>
        <div className="text-lg font-black text-[#000F1B] leading-none mb-0.5">{value}</div>
        <div className="text-[9px] font-medium text-[#111111]/40">{subtitle}</div>
      </div>
    </div>
  );
}
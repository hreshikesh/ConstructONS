import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar, Flag, CloudRain, Droplets, Wind, CheckCircle2,
  Clock, ShieldAlert, ChevronRight, Building2, MapPin, Sun, Cloud
} from "lucide-react";
import axios from "axios";

export default function DashboardHeaders({ user, project }) {
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const hasCoords = project?.site_lat != null && project?.site_lng != null && !Number.isNaN(Number(project.site_lat));
  const lat = hasCoords ? Number(project.site_lat) : null;
  const lng = hasCoords ? Number(project.site_lng) : null;

  useEffect(() => {
    if (!lat || !lng) { setWeather(null); return; }
    setWeatherLoading(true);
    axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=precipitation_probability_max,temperature_2m_max,temperature_2m_min,weathercode&forecast_days=3&timezone=auto`)
      .then((res) => {
        setWeather({
          ...res.data.current_weather,
          rainChance: res.data.daily?.precipitation_probability_max?.[0] ?? 0,
          days: (res.data.daily?.time || []).slice(0, 3).map((t, i) => ({
            date: t, max: res.data.daily?.temperature_2m_max?.[i], min: res.data.daily?.temperature_2m_min?.[i], rain: res.data.daily?.precipitation_probability_max?.[i],
          })),
        });
      })
      .catch(() => setWeather(null))
      .finally(() => setWeatherLoading(false));
  }, [lat, lng]);

  const stages = project?.stages || [];
  const materials = project?.materials || [];
  const quality = project?.quality_inspections || [];
  const drawings = project?.drawings || [];
  const today = new Date();

  const completedStages = stages.filter((s) => s.status === "completed").length;
  const progressVal = stages.length ? Math.round(stages.reduce((sum, s) => sum + (Number(s.progress_pct) || 0), 0) / stages.length) : 0;
  const currentStage = stages.find((s) => s.status === "in_progress");
  const expectedCompletionDate = project.expected_completion || (stages.length > 0 ? stages[stages.length - 1]?.expected_date : null);

  const healthData = [
    { key: "Schedule", status: stages.some((s) => s.status !== "completed" && s.expected_date && new Date(s.expected_date) < today) ? "At Risk" : "On Track" },
    { key: "Cost", status: project.amount_spent > project.contract_value && project.contract_value > 0 ? "At Risk" : "On Track" },
    { key: "Procurement", status: materials.some((m) => m.status === "pending") ? "Attention" : "On Track" },
    { key: "Quality", status: quality.some((q) => q.status === "rectification") ? "At Risk" : "On Track" },
    { key: "Approvals", status: drawings.some((d) => d.status === "pending") ? "Attention" : "On Track" },
  ];

  const overallHealth = healthData.some((h) => h.status === "At Risk") ? "At Risk" : healthData.some((h) => h.status === "Attention") ? "Attention" : "On Track";
  const hColors = {
    "On Track": { text: "text-emerald-700", bg: "bg-emerald-50", icon: CheckCircle2, ring: "#10B981" },
    "Attention": { text: "text-amber-600", bg: "bg-amber-50", icon: Clock, ring: "#F59E0B" },
    "At Risk": { text: "text-red-600", bg: "bg-red-50", icon: ShieldAlert, ring: "#EF4444" },
  };
  const HealthIcon = hColors[overallHealth].icon;
  const formatDate = (date) => date ? new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <div className="space-y-3 font-['Poppins']">
      
      {/* Ultra-compact Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-black/5 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#000F1B] leading-none">Welcome back, {user?.name?.split(" ")[0]}!</h1>
          <p className="text-[10px] text-[#111111]/60 mt-1">Here's how your dream home is progressing this week.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#111111]/40" />
            <div>
              <div className="text-[8px] text-[#111111]/50 font-bold uppercase tracking-wider">Project Start</div>
              <div className="text-[11px] font-bold text-[#000F1B]">{formatDate(project.start_date || project.created_at)}</div>
            </div>
          </div>
          <div className="w-px h-6 bg-black/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-[#111111]/40" />
            <div>
              <div className="text-[8px] text-[#111111]/50 font-bold uppercase tracking-wider">Forecast Completion</div>
              <div className="text-[11px] font-bold text-[#000F1B]">{formatDate(expectedCompletionDate)}</div>
            </div>
          </div>
          <div className={`hidden sm:flex px-3 py-1 rounded-lg text-[10px] font-bold ${hColors[overallHealth].bg} ${hColors[overallHealth].text}`}>
            {overallHealth}
          </div>
        </div>
      </div>

      {/* Row 1 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        
        {/* Project Health */}
        <div className="bg-white rounded-2xl border border-black/5 p-4 shadow-sm flex flex-col h-[180px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-bold text-[#000F1B]">Project Health</h2>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-1 flex-1">
            <div className="relative w-14 h-14 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="#F2F2F2" strokeWidth="6" fill="none" />
                <circle cx="28" cy="28" r="24" stroke={hColors[overallHealth].ring} strokeWidth="6" fill="none" strokeDasharray="150" strokeDashoffset={0} strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className={`flex items-center gap-1 text-sm font-bold ${hColors[overallHealth].text}`}>
                <HealthIcon className="w-4 h-4" /> {overallHealth}
              </div>
              <p className="text-[10px] text-[#111111]/60 mt-0.5 leading-tight">
                {overallHealth === "On Track" ? "All key areas are within plan." : "Some areas require attention."}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1 pt-2 mt-auto">
            {healthData.map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div className={`w-full py-0.5 text-center rounded text-[8px] font-bold uppercase tracking-wider ${hColors[h.status].bg} ${hColors[h.status].text}`}>
                  {h.status === "On Track" ? "OK" : "!"}
                </div>
                <div className="text-[8px] font-semibold text-[#111111]/60 truncate w-full text-center">{h.key}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white rounded-2xl border border-black/5 p-4 shadow-sm flex flex-col h-[180px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-bold text-[#000F1B]">Overall Progress</h2>
            </div>
            <Link to="/portal/timeline" className="text-[10px] font-bold text-blue-600 hover:underline">Timeline</Link>
          </div>
          <div className="flex items-center gap-4 mt-1 flex-1">
            <div className="relative w-14 h-14 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="#F2F2F2" strokeWidth="6" fill="none" />
                <circle cx="28" cy="28" r="24" stroke="#10B981" strokeWidth="6" fill="none" strokeDasharray="150" strokeDashoffset={150 - (progressVal / 100) * 150} strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#000F1B]">{progressVal}%</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-bold text-[#111111]/40 uppercase tracking-wider mb-0.5">Current Stage</div>
              <div className="text-xs font-bold text-[#000F1B] truncate leading-tight">{currentStage ? currentStage.name : "Awaiting Start"}</div>
              {currentStage && <span className="inline-block mt-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded">In Progress</span>}
            </div>
          </div>
          <div className="pt-2 mt-auto text-[9px] font-semibold text-[#111111]/60 flex justify-between">
            <span>{completedStages} of {stages.length} stages completed</span>
          </div>
        </div>

        {/* Site Weather */}
        <div className="bg-white rounded-2xl border border-black/5 p-4 shadow-sm flex flex-col h-[180px]">
          <div className="flex items-center gap-1.5 mb-1">
            <CloudRain className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-bold text-[#000F1B]">Site Weather</h2>
          </div>
          {!hasCoords ? (
            <div className="flex-1 flex flex-col justify-center text-[10px] text-[#111111]/50 text-center"><p>Weather unavailable.</p></div>
          ) : weatherLoading ? (
            <div className="flex-1 grid place-items-center text-[10px] text-[#111111]/50">Loading forecast...</div>
          ) : weather ? (
            <>
              <div className="flex justify-between items-center flex-1">
                <div className="flex items-center gap-2">
                  {weather.rainChance > 40 ? <CloudRain className="w-10 h-10 text-blue-400" /> : weather.weathercode === 0 ? <Sun className="w-10 h-10 text-amber-400" /> : <Cloud className="w-10 h-10 text-slate-400" />}
                  <div>
                    <div className="text-2xl font-black text-[#000F1B] leading-none">{weather.temperature ?? "--"}°</div>
                    <div className="text-[9px] font-semibold text-[#111111]/50 mt-0.5">Cloudy</div>
                  </div>
                </div>
                <div className="space-y-1 text-[9px] font-semibold text-[#111111]/60">
                  <div className="flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-400" /> {weather.rainChance ?? 0}% Rain</div>
                  <div className="flex items-center gap-1"><Wind className="w-3 h-3 text-gray-400" /> {weather.windspeed ?? "--"} km/h</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5 mt-auto pt-2">
                {weather.days?.length > 0 && weather.days.map((d) => (
                  <div key={d.date} className="rounded bg-[#F9FAFB] border border-black/5 p-1 text-center">
                    <div className="text-[8px] font-bold text-[#111111]/50 uppercase">{new Date(d.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short" })}</div>
                    <div className="text-[10px] font-bold text-[#000F1B] leading-none my-0.5">{d.max}°</div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
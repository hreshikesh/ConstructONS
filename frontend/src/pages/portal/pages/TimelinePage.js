import React from "react";
import { GitBranch, CheckCircle2, PlayCircle, Circle, Calendar, FileText, Camera } from "lucide-react";
import { usePortal } from "../context/PortalContext";
import ComingSoon from "../components/ComingSoon";

export default function TimelinePage() {
  const { project } = usePortal();

  if (!project) return <ComingSoon title="Timeline" icon={GitBranch} />;

  const stages = project.stages || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-['Poppins'] pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#000F1B] grid place-items-center shrink-0">
          <GitBranch className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#000F1B] tracking-tight">Project Timeline</h1>
          <p className="text-sm text-[#111111]/60 mt-0.5">Chronological construction journey and stage history.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 sm:p-8">
        <div className="space-y-6">
          {stages.length === 0 ? (
            <div className="text-sm text-[#111111]/50 text-center py-10">No timeline data recorded yet.</div>
          ) : (
            stages.map((stage, i) => {
              const isCompleted = stage.status === "completed";
              const isInProgress = stage.status === "in_progress";
              const hasPhotos = stage.photos && stage.photos.length > 0;
              const hasDocs = stage.documents && stage.documents.length > 0;
              
              return (
                <div key={i} className="relative flex items-start gap-4 sm:gap-6">
                  {/* Vertical Track */}
                  {i !== stages.length - 1 && (
                    <div className="absolute left-[13px] top-8 bottom-[-24px] w-[2px] bg-[#F2F2F2]" />
                  )}
                  
                  {/* Status Node */}
                  <div className="relative z-10 shrink-0 mt-1">
                    {isCompleted ? <CheckCircle2 className="w-7 h-7 text-[#10B981] bg-white" /> :
                     isInProgress ? <PlayCircle className="w-7 h-7 text-[#FF5A00] bg-white" /> :
                     <Circle className="w-7 h-7 text-[#111111]/20 bg-white" />}
                  </div>
                  
                  {/* Stage Content Card */}
                  <div className={`flex-1 min-w-0 rounded-xl p-4 sm:p-5 transition ${
                    isInProgress ? "bg-[#FF5A00]/5 border border-[#FF5A00]/20" : 
                    isCompleted ? "bg-white border border-emerald-100" : 
                    "bg-white border border-black/5 opacity-60"
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${
                          isCompleted ? "text-emerald-600" : isInProgress ? "text-[#FF5A00]" : "text-[#111111]/40"
                        }`}>
                          Stage {i + 1}
                        </span>
                        <h3 className="text-base font-bold text-[#000F1B] mt-0.5">{stage.name}</h3>
                        <p className="text-xs text-[#111111]/60 mt-1">{stage.description}</p>
                      </div>
                      
                      {/* Dates */}
                      <div className="shrink-0 flex flex-col items-start sm:items-end gap-1 text-[10px] text-[#111111]/50 font-medium">
                        {stage.started_at && (
                          <div className="flex items-center gap-1"><Calendar className="w-3 h-3"/> Started: {new Date(stage.started_at).toLocaleDateString()}</div>
                        )}
                        {stage.completed_at && (
                          <div className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-3 h-3"/> Finished: {new Date(stage.completed_at).toLocaleDateString()}</div>
                        )}
                        {stage.expected_date && !isCompleted && (
                          <div className="flex items-center gap-1">Expected: {stage.expected_date}</div>
                        )}
                      </div>
                    </div>

                    {/* Site Engineer Notes */}
                    {stage.notes && (
                      <div className="mt-4 p-3 rounded-lg bg-black/5 text-xs text-[#000F1B] leading-relaxed whitespace-pre-wrap">
                        <strong className="block text-[10px] uppercase tracking-wider text-[#111111]/50 mb-1">Site Notes</strong>
                        {stage.notes}
                      </div>
                    )}

                    {/* Attachments (Photos/Docs) */}
                    {(hasPhotos || hasDocs) && (
                      <div className="mt-4 pt-4 border-t border-black/5">
                        {hasPhotos && (
                          <div className="mb-3">
                            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-[#000F1B] mb-2">
                              <Camera className="w-3.5 h-3.5 text-[#FF5A00]" /> Progress Photos
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                              {stage.photos.map((url, pid) => (
                                <a key={pid} href={url} target="_blank" rel="noreferrer" className="shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-black/10 hover:border-[#FF5A00] transition">
                                  <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {hasDocs && (
                          <div>
                            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-[#000F1B] mb-2">
                              <FileText className="w-3.5 h-3.5 text-[#FF5A00]" /> Stage Documents
                            </div>
                            <div className="flex flex-col gap-1.5">
                              {stage.documents.map((doc, did) => (
                                <a key={did} href={doc.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-semibold text-[#111111]/70 hover:text-[#FF5A00] transition">
                                  <FileText className="w-3.5 h-3.5" /> {doc.name || `Document ${did+1}`}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
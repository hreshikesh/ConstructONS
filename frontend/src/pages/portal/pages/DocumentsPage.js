import React, { useState, useMemo, useEffect } from "react";
import { Search, FileText, Download, FolderArchive, ChevronLeft, ChevronRight, X, Maximize, Star, Share2 } from "lucide-react";
import { usePortal } from "../context/PortalContext";
import { resolveMediaUrl } from "../../../lib/mediaUrl";

const CATEGORIES = ["All Categories", "Drawings", "Contracts & Agreements", "BOQ & Estimates", "Invoices & Payments", "Approvals", "Reports", "Test Certificates", "Warranties", "Manuals", "Government / Statutory", "Handover Documents", "Site Photos", "Other"];
const STATUSES = ["All Status", "Current", "Approved", "Under Review", "Signed", "Paid", "Passed", "Valid", "Superseded"];

const fmtDate = (d) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); } 
  catch { return "—"; }
};

export default function DocumentsPage() {
  const { project } = usePortal();
  
  // Filters
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All Categories");
  const [stageFilter, setStageFilter] = useState("All Stages");
  const [statusFilter, setStatusFilter] = useState("All Status");
  
  // UI State
  const [selectedId, setSelectedId] = useState(null);
  const [drawerTab, setDrawerTab] = useState("Details"); // Details | Revisions

  const documents = project?.documents || [];
  
  // Dynamically load stages
  const projectStages = useMemo(() => {
    const names = (project?.stages || []).map(s => s.name);
    return ["All Stages", "General", ...names];
  }, [project]);

  // Data Prep
  const filteredDocs = useMemo(() => {
    return documents.filter(d => {
      const q = search.toLowerCase();
      const matchSearch = !q || (d.name||"").toLowerCase().includes(q) || (d.description||"").toLowerCase().includes(q);
      const matchCat = catFilter === "All Categories" || (d.category || "Other") === catFilter;
      const matchStage = stageFilter === "All Stages" || (d.stage || "General") === stageFilter;
      const matchStatus = statusFilter === "All Status" || (d.status || "Current") === statusFilter;
      return matchSearch && matchCat && matchStage && matchStatus;
    }).sort((a,b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
  }, [documents, search, catFilter, stageFilter, statusFilter]);

  // Keep selection in sync
  useEffect(() => {
    if (window.innerWidth >= 768) {
      if (filteredDocs.length > 0 && !selectedId) setSelectedId(filteredDocs[0].id);
      else if (filteredDocs.length === 0) setSelectedId(null);
    }
  }, [filteredDocs, selectedId]);

  const selectedDoc = documents.find(d => d.id === selectedId);
  const latestUrl = selectedDoc?.versions?.[selectedDoc.versions.length - 1]?.url || selectedDoc?.url;

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (["approved", "current", "signed", "paid", "passed", "valid"].includes(s)) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (["under review"].includes(s)) return "text-amber-700 bg-amber-50 border-amber-200";
    if (["superseded"].includes(s)) return "text-gray-600 bg-gray-100 border-gray-200";
    return "text-[#FF5A00] bg-[#FF5A00]/10 border-[#FF5A00]/20";
  };

  const resetFilters = () => {
    setSearch(""); setCatFilter("All Categories"); setStageFilter("All Stages"); setStatusFilter("All Status");
  };

  if (!project) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] font-['Poppins'] bg-[#F5F6F8]">
      
      {/* HEADER & RIBBON (Hidden on mobile if detail drawer is open) */}
      <div className={`shrink-0 bg-white border-b border-gray-200 px-3 md:px-5 pt-4 pb-2 z-10 ${selectedId ? 'hidden md:block' : 'block'}`}>
        <div className="mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-[#000F1B]">Documents</h1>
          <p className="text-[10px] md:text-[11px] text-gray-500 mt-0.5">Your complete project document vault. Access all project-related documents in one place.</p>
        </div>

        {/* KPI Ribbon */}
        <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 mb-3">
          {[
            { label: "All Documents", count: documents.length, color: "text-[#1A73E8]", icon: FolderArchive },
            { label: "Drawings", count: documents.filter(d=>d.category==="Drawings").length, color: "text-[#FF5A00]", icon: FileText },
            { label: "Contracts", count: documents.filter(d=>d.category==="Contracts & Agreements").length, color: "text-emerald-600", icon: FileText },
            { label: "Estimates", count: documents.filter(d=>d.category==="BOQ & Estimates").length, color: "text-blue-600", icon: FileText },
            { label: "Invoices", count: documents.filter(d=>d.category==="Invoices & Payments").length, color: "text-purple-600", icon: FileText },
          ].map((k, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-3 min-w-[140px] flex items-center gap-3 shadow-sm shrink-0">
              <k.icon className={`w-5 h-5 ${k.color}`} />
              <div>
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{k.label}</div>
                <div className="text-lg font-black text-[#000F1B] leading-none mt-1">{k.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WORKSPACE */}
      <div className="flex-1 flex overflow-hidden p-0 md:p-4 gap-4">
        
        {/* LEFT PANE: TABLE */}
        <div className={`flex-1 flex-col bg-white md:border border-gray-200 md:rounded-xl shadow-sm overflow-hidden ${selectedId ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Filters Bar */}
          <div className="p-2 border-b border-gray-100 flex flex-wrap items-center gap-2 bg-gray-50 shrink-0">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input type="text" placeholder="Search documents..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-[10px] border border-gray-200 rounded outline-none focus:border-[#FF5A00]" />
            </div>
            <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} className="text-[10px] border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-[#FF5A00] bg-white cursor-pointer w-[120px]">
              {CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
            <select value={stageFilter} onChange={e=>setStageFilter(e.target.value)} className="text-[10px] border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-[#FF5A00] bg-white cursor-pointer w-[110px] hidden sm:block">
              {projectStages.map(s=><option key={s}>{s}</option>)}
            </select>
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="text-[10px] border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-[#FF5A00] bg-white cursor-pointer w-[100px] hidden sm:block">
              {STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
            <button onClick={resetFilters} className="text-[10px] font-bold text-gray-500 hover:text-black px-2">Reset</button>
          </div>

          <div className="flex-1 overflow-auto bg-[#F5F6F8] md:bg-white">
            <table className="hidden sm:table w-full text-left text-[10px] min-w-[600px] border-collapse">
              <thead className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3 font-bold text-gray-500">Name</th>
                  <th className="py-2.5 px-3 font-bold text-gray-500">Category</th>
                  <th className="py-2.5 px-3 font-bold text-gray-500">Stage</th>
                  <th className="py-2.5 px-3 font-bold text-gray-500 text-center">Revision</th>
                  <th className="py-2.5 px-3 font-bold text-gray-500">Date</th>
                  <th className="py-2.5 px-3 font-bold text-gray-500 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDocs.map(d => {
                  const isSelected = selectedId === d.id;
                  return (
                    <tr key={d.id} onClick={() => setSelectedId(d.id)} className={`cursor-pointer transition-colors ${isSelected ? "bg-[#FF5A00]/5 hover:bg-[#FF5A00]/10" : "hover:bg-gray-50"}`}>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          {isSelected && <div className="absolute left-0 w-1 h-6 bg-[#FF5A00] rounded-r" />}
                          <FileText className={`w-4 h-4 shrink-0 ${d.category?.includes("Drawing") ? "text-red-500" : d.category?.includes("Contract") ? "text-emerald-500" : "text-[#1A73E8]"}`} />
                          <span className="font-bold text-[#000F1B] truncate max-w-[180px]">{d.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-gray-600">{d.category || "Other"}</td>
                      <td className="py-2.5 px-3 text-gray-600">{d.stage || "—"}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-gray-500">{d.current_version ? `R0${d.current_version}` : "—"}</td>
                      <td className="py-2.5 px-3 text-gray-600">{fmtDate(d.uploaded_at)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${getStatusColor(d.status)}`}>
                          {d.status || "Current"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile View */}
            <div className="sm:hidden space-y-2 p-3">
              {filteredDocs.map(d => (
                <div key={d.id} onClick={() => setSelectedId(d.id)} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm cursor-pointer">
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#FF5A00] shrink-0" />
                      <h4 className="font-bold text-[11px] text-[#000F1B] truncate">{d.name}</h4>
                    </div>
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[7px] font-bold uppercase border ${getStatusColor(d.status)}`}>{d.status || "Current"}</span>
                  </div>
                  <div className="text-[9px] text-gray-500 flex gap-2">
                    <span>{d.category || "Other"}</span> • <span>{d.current_version ? `R0${d.current_version}` : "-"}</span> • <span>{fmtDate(d.uploaded_at)}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredDocs.length === 0 && (
              <div className="text-center py-16 text-[11px] text-gray-400">
                <FolderArchive className="w-8 h-8 mx-auto mb-2 opacity-20" /> No documents found.
              </div>
            )}
          </div>
          <div className="p-2 border-t border-gray-100 bg-white text-[9px] font-semibold text-gray-500 flex justify-between shrink-0">
            <span>Showing {filteredDocs.length} of {documents.length}</span>
          </div>
        </div>

        {/* RIGHT PANE: PREVIEW & DETAILS */}
        <div className={`w-full md:w-[350px] lg:w-[450px] xl:w-[500px] flex-col bg-white md:border border-gray-200 md:rounded-xl shadow-sm overflow-hidden shrink-0 ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
          {selectedDoc ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              
              <div className="p-3 border-b border-gray-100 bg-white shrink-0 relative flex justify-between items-center">
                <button onClick={() => setSelectedId(null)} className="md:hidden flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-[#FF5A00] bg-gray-50 px-2 py-1 rounded">
                  <ChevronLeft className="w-3.5 h-3.5" /> Back
                </button>
                <div className="hidden md:flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-bold text-[#000F1B] max-w-[250px] truncate">{selectedDoc.name}</h2>
                  <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${getStatusColor(selectedDoc.status)}`}>{selectedDoc.status || "Current"}</span>
                </div>
                <button onClick={() => setSelectedId(null)} className="hidden md:flex p-1 hover:bg-gray-100 text-gray-400 rounded transition"><X className="w-4 h-4" /></button>
              </div>

              {/* Inline Preview */}
              <div className="h-[220px] sm:h-[300px] bg-gray-100 border-b border-gray-200 relative flex items-center justify-center p-2 shrink-0 group">
                {latestUrl ? (
                  latestUrl.toLowerCase().includes('.pdf') ? (
                    <iframe src={`${resolveMediaUrl(latestUrl)}#toolbar=0&navpanes=0`} className="w-full h-full border-0 bg-white shadow-sm rounded" title="preview" />
                  ) : (
                    <img src={resolveMediaUrl(latestUrl)} alt="Preview" className="max-w-full max-h-full object-contain drop-shadow-sm rounded" />
                  )
                ) : (
                  <div className="text-[10px] font-bold text-gray-400 flex flex-col items-center"><FileText className="w-8 h-8 mb-1 opacity-20"/> No preview available</div>
                )}
                
                {/* Actions Overlay */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={resolveMediaUrl(latestUrl)} target="_blank" rel="noreferrer" className="w-7 h-7 bg-white/90 backdrop-blur border border-gray-200 rounded grid place-items-center text-gray-700 hover:text-[#FF5A00] shadow-sm"><Maximize className="w-3.5 h-3.5"/></a>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100 shrink-0 px-2">
                {["Details", "Revisions"].map(t => (
                  <button key={t} onClick={() => setDrawerTab(t)} className={`px-4 py-2.5 text-[10px] font-bold relative transition ${drawerTab === t ? "text-[#000F1B]" : "text-gray-400 hover:text-gray-700"}`}>
                    {t} {t==="Revisions" && `(${selectedDoc.versions?.length||1})`}
                    {drawerTab === t && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF5A00]" />}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4 bg-white">
                {drawerTab === "Details" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-y-3 gap-x-2 text-[10px]">
                      <div className="col-span-1 text-gray-500 font-medium">File Name</div>
                      <div className="col-span-2 font-bold text-[#000F1B] break-all">{selectedDoc.name}</div>
                      
                      <div className="col-span-1 text-gray-500 font-medium">Category</div>
                      <div className="col-span-2 text-gray-900">{selectedDoc.category || "—"}</div>

                      <div className="col-span-1 text-gray-500 font-medium">Stage</div>
                      <div className="col-span-2 text-gray-900">{selectedDoc.stage || "—"}</div>

                      <div className="col-span-1 text-gray-500 font-medium">Revision</div>
                      <div className="col-span-2 text-gray-900 font-bold text-[#FF5A00]">{selectedDoc.current_version ? `R0${selectedDoc.current_version}` : "—"}</div>

                      <div className="col-span-1 text-gray-500 font-medium">Uploaded On</div>
                      <div className="col-span-2 text-gray-900">{fmtDate(selectedDoc.uploaded_at)}</div>

                      <div className="col-span-1 text-gray-500 font-medium">Status</div>
                      <div className="col-span-2">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${getStatusColor(selectedDoc.status)}`}>{selectedDoc.status || "Current"}</span>
                      </div>
                    </div>

                    {selectedDoc.description && (
                      <div className="pt-3 border-t border-gray-100">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description</div>
                        <p className="text-[10px] text-gray-700 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">{selectedDoc.description}</p>
                      </div>
                    )}

                    <div className="pt-4 flex flex-col gap-2">
                      <a href={resolveMediaUrl(latestUrl)} target="_blank" rel="noreferrer" className="w-full py-2 bg-[#000F1B] hover:bg-[#FF5A00] text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition">
                        <Download className="w-3.5 h-3.5" /> Download Document
                      </a>
                      <div className="flex gap-2">
                        <button className="flex-1 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-[10px] font-bold hover:bg-gray-50 flex items-center justify-center gap-1.5"><Share2 className="w-3 h-3"/> Share</button>
                        <button className="flex-1 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-[10px] font-bold hover:bg-gray-50 flex items-center justify-center gap-1.5"><Star className="w-3 h-3"/> Favorite</button>
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === "Revisions" && (
                  <div className="space-y-2">
                    {[...(selectedDoc.versions || [])].reverse().map((v, i) => {
                      const isCurrent = v.version === selectedDoc.current_version;
                      return (
                        <div key={i} className={`p-3 rounded-lg border flex items-center justify-between ${isCurrent ? "bg-[#FF5A00]/5 border-[#FF5A00]/20" : "bg-gray-50 border-gray-200"}`}>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`text-[11px] font-bold ${isCurrent ? "text-[#000F1B]" : "text-gray-600"}`}>Revision R0{v.version}</span>
                              {isCurrent && <span className="text-[8px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded uppercase">Current</span>}
                            </div>
                            <div className="text-[9px] text-gray-500">{fmtDate(v.uploaded_at)}</div>
                          </div>
                          <a href={resolveMediaUrl(v.url)} target="_blank" rel="noreferrer" className="w-7 h-7 bg-white border border-gray-200 rounded grid place-items-center text-gray-500 hover:text-[#000F1B] transition shadow-sm">
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-[#F9FAFB]">
              <FolderArchive className="w-12 h-12 opacity-20 mb-3 text-[#FF5A00]" />
              <p className="text-sm font-bold text-[#000F1B] mb-1">No Document Selected</p>
              <p className="text-[10px] max-w-[200px]">Select a file from the vault to view details, revisions, and download.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
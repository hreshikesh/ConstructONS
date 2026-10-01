import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { 
  Plus, Search, Download, CheckCircle2, AlertTriangle, 
  X, ChevronLeft, FileBox, Home, Grid, Zap, Droplet, Wind, 
  Armchair, TreePine, FileText, Clock, Loader2, History, ListTodo, PenTool
} from "lucide-react";
import { usePortal } from "../context/PortalContext";
import { resolveMediaUrl } from "../../../lib/mediaUrl";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000") + "/api";
const api = axios.create({ baseURL: API_BASE, withCredentials: true });

const fmtDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return "—"; }
};

const getCategoryIcon = (cat) => {
  const map = {
    "Architectural": Home, "Structural": Grid, "Electrical": Zap,
    "Plumbing": Droplet, "HVAC": Wind, "Interior": Armchair, "Landscape": TreePine,
  };
  return map[cat] || FileText;
};

const CATEGORIES = [
  "All Drawings", "Architectural", "Structural", "Electrical", 
  "Plumbing", "HVAC", "Interior", "Landscape", "Others"
];

export default function DrawingsPage() {
  const { project, refreshProject } = usePortal();
  
  // Navigation View State
  const [currentView, setCurrentView] = useState("library"); // "library" | "requests"
  
  // Filter & Search
  const [activeTab, setActiveTab] = useState("All Drawings");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  const [selectedId, setSelectedId] = useState(null);
  
  // Modals & Forms
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject' | 'new_request'
  const [comment, setComment] = useState("");
  const [requestForm, setRequestForm] = useState({ category: "", title: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);

  const drawings = project?.drawings || [];
  const requestsHistory = project?.drawing_requests || [];

  const sortedDrawings = useMemo(() => {
    return [...drawings].sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (b.status === "pending" && a.status !== "pending") return 1;
      return new Date(b.uploaded_at) - new Date(a.uploaded_at);
    });
  }, [drawings]);

  const filteredDrawings = useMemo(() => {
    return sortedDrawings.filter(d => {
      const matchSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTab = activeTab === "All Drawings" || (d.category || "Others") === activeTab;
      const matchStatus = statusFilter === "All" || d.status === statusFilter.toLowerCase();
      return matchSearch && matchTab && matchStatus;
    });
  }, [sortedDrawings, searchQuery, activeTab, statusFilter]);

  // Keep selected drawing in sync (Auto-select first on Desktop)
  useEffect(() => {
    if (currentView === "library" && window.innerWidth >= 768) {
      if (filteredDrawings.length > 0 && !selectedId) {
        setSelectedId(filteredDrawings[0].id);
      } else if (filteredDrawings.length === 0) {
        setSelectedId(null);
      }
    }
  }, [filteredDrawings, selectedId, currentView]);

  const selectedDrawing = drawings.find(d => d.id === selectedId);
  const pendingCount = drawings.filter(d => d.status === "pending").length;

  const handleDecision = async (decision) => {
    if (!selectedDrawing) return;
    setSubmitting(true);
    try {
      await api.post(`/portal/my-project/drawings/${selectedDrawing.id}/decision`, {
        decision: decision,
        comment: comment
      });
      toast.success(decision === "approved" ? "Drawing Approved" : "Changes Requested");
      await refreshProject?.();
      setModalType(null);
      setComment("");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Action failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestNew = async () => {
    if (!requestForm.category || !requestForm.title) {
      toast.error("Please fill required fields");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/portal/my-project/drawings/request`, requestForm);
      toast.success("Drawing request submitted to design team.");
      setModalType(null);
      setRequestForm({ category: "", title: "", reason: "" });
      await refreshProject?.();
      setCurrentView("requests"); // Switch to requests tab automatically
    } catch {
      toast.error("Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusConfig = (status) => {
    const map = {
      approved: { label: "APPROVED", color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
      pending: { label: "UNDER REVIEW", color: "text-amber-700 bg-amber-50 border-amber-200", icon: Clock },
      rejected: { label: "CHANGES REQ.", color: "text-red-700 bg-red-50 border-red-200", icon: AlertTriangle },
    };
    return map[status] || { label: "UNKNOWN", color: "text-gray-600 bg-gray-100 border-gray-200", icon: FileText };
  };

  if (!project) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] font-['Poppins'] bg-[#F5F6F8]">
      
      {/* 1. HEADER */}
      <div className={`shrink-0 bg-white border-b border-gray-200 px-4 md:px-6 pt-5 pb-0 shadow-sm z-10 ${selectedId && currentView === "library" ? 'hidden md:block' : 'block'}`}>
        
        {/* Top Title & View Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#000F1B]">Drawings</h1>
            <p className="text-[10px] md:text-xs text-gray-500 mt-1">Access approved drawings or request new designs from the team.</p>
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner w-full md:w-auto">
            <button 
              onClick={() => setCurrentView("library")}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${currentView === "library" ? "bg-white text-[#000F1B] shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
            >
              <Grid className="w-4 h-4" /> Library & Approvals
            </button>
            <button 
              onClick={() => setCurrentView("requests")}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${currentView === "requests" ? "bg-white text-[#000F1B] shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
            >
              <ListTodo className="w-4 h-4" /> My Requests
            </button>
          </div>
        </div>

        {/* Category Ribbon */}
        {currentView === "library" && (
          <div className="flex overflow-x-auto no-scrollbar gap-4 md:gap-6 border-b border-transparent">
            {CATEGORIES.map(cat => {
              const Icon = getCategoryIcon(cat);
              const count = cat === "All Drawings" ? drawings.length : drawings.filter(d => (d.category || "Others") === cat).length;
              const isActive = activeTab === cat;
              
              return (
                <button
                  key={cat} onClick={() => setActiveTab(cat)}
                  className={`flex items-center gap-2 pb-3 border-b-2 transition-colors whitespace-nowrap ${isActive ? "border-[#FF5A00] text-[#000F1B]" : "border-transparent text-gray-500 hover:text-gray-800"}`}
                >
                  <Icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isActive ? "text-[#FF5A00]" : ""}`} />
                  <span className="text-xs md:text-sm font-semibold">{cat}</span>
                  <span className="text-[9px] md:text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden p-0 md:p-4 gap-4">
        
        {/* =======================================================
            VIEW A: DRAWING LIBRARY & APPROVALS (Split Pane)
        ======================================================= */}
        {currentView === "library" && (
          <>
            {/* LEFT PANE: LIST */}
            <div className={`flex-1 flex-col bg-white md:border border-gray-200 md:rounded-xl shadow-sm overflow-hidden ${selectedId ? 'hidden md:flex' : 'flex'}`}>
              
              <div className="p-3 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50 shrink-0">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" placeholder="Search drawings..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-[#FF5A00] transition shadow-sm"
                  />
                </div>
                <select 
                  value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="w-full sm:w-auto text-xs font-semibold bg-white border border-gray-200 rounded-lg px-2 py-1.5 outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="pending">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Changes Requested</option>
                </select>
              </div>

              <div className="flex-1 overflow-auto p-3 space-y-2.5 bg-[#F5F6F8] md:bg-white">
                {filteredDrawings.length === 0 ? (
                  <div className="text-center py-12 text-sm text-gray-400">No drawings found matching your filters.</div>
                ) : (
                  filteredDrawings.map((d) => {
                    const conf = getStatusConfig(d.status);
                    const isSelected = selectedId === d.id;
                    const dwgNo = `DWG-${d.id.substring(4, 7).toUpperCase()}`;
                    
                    return (
                      <div 
                        key={d.id} onClick={() => setSelectedId(d.id)}
                        className={`bg-white p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected ? "border-[#FF5A00] shadow-md ring-1 ring-[#FF5A00]/20" : "border-gray-200 shadow-sm hover:border-[#FF5A00]/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[10px] font-black text-gray-400">{dwgNo}</span>
                              <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${conf.color}`}>
                                {conf.label}
                              </span>
                            </div>
                            <h4 className="font-bold text-[#000F1B] text-sm truncate">{d.name}</h4>
                          </div>
                          <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0 hidden sm:block">
                            <img src={resolveMediaUrl(d.versions?.[d.versions.length-1]?.url)} alt="" className="w-full h-full object-cover opacity-80" />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-semibold text-gray-500">
                          <span className="text-[#FF5A00] uppercase tracking-wider">{d.category || "General"}</span>
                          <span>•</span>
                          <span>Rev: V{d.current_version}</span>
                          <span>•</span>
                          <span>{fmtDate(d.uploaded_at)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              <div className="p-3 border-t border-gray-100 bg-white text-[10px] sm:text-xs font-semibold text-gray-500 flex justify-between items-center shrink-0">
                <span>Showing {filteredDrawings.length} of {drawings.length}</span>
                {pendingCount > 0 && <span className="text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded">{pendingCount} Awaiting Approval</span>}
              </div>
            </div>

            {/* RIGHT PANE: VIEWER & DETAILS (SCROLL FIXED) */}
            <div className={`w-full md:w-[400px] lg:w-[500px] xl:w-[650px] flex-col bg-white md:border border-gray-200 md:rounded-xl shadow-sm overflow-hidden shrink-0 ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
              {selectedDrawing ? (
                <>
                  {/* Fixed Header */}
                  <div className="p-3 sm:p-4 border-b border-gray-100 shrink-0 bg-white z-10 shadow-sm relative">
                    <button 
                      onClick={() => setSelectedId(null)} 
                      className="md:hidden flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-[#FF5A00] mb-3 bg-gray-50 px-2 py-1 rounded w-max"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back to List
                    </button>

                    <div className="flex justify-between items-start mb-2">
                      <div className="pr-2">
                        <h2 className="text-base sm:text-lg font-bold text-[#000F1B] leading-tight flex flex-wrap items-center gap-2">
                          {`DWG-${selectedDrawing.id.substring(4, 7).toUpperCase()}`} - {selectedDrawing.name}
                          {selectedDrawing.status === "approved" && (
                            <span className="text-[9px] font-bold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">Current Approved</span>
                          )}
                        </h2>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1 font-medium">
                          {selectedDrawing.category || "General"} &nbsp;|&nbsp; 
                          Revision V{selectedDrawing.current_version} &nbsp;|&nbsp; 
                          {fmtDate(selectedDrawing.uploaded_at)}
                        </p>
                      </div>
                      
                      {selectedDrawing.versions?.length > 0 && (
                        <a 
                          href={resolveMediaUrl(selectedDrawing.versions[selectedDrawing.versions.length-1].url)} 
                          target="_blank" rel="noreferrer"
                          className="p-2 sm:px-3 sm:py-1.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition shadow-sm shrink-0"
                        >
                          <Download className="w-4 h-4" /> <span className="hidden sm:block">Download</span>
                        </a>
                      )}
                    </div>

                    {selectedDrawing.status === "pending" && (
                      <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-amber-800">
                          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                          <div>
                            <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Awaiting Your Approval</div>
                            <div className="text-[9px] sm:text-[10px] opacity-80">Please review this drawing and provide your decision.</div>
                          </div>
                        </div>
                        <div className="flex w-full sm:w-auto items-center gap-2">
                          <button onClick={() => setModalType("reject")} className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 bg-white border border-amber-300 text-amber-700 text-[10px] sm:text-xs font-bold rounded shadow-sm hover:bg-amber-100 transition text-center">Request Changes</button>
                          <button onClick={() => setModalType("approve")} className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 bg-emerald-600 text-white text-[10px] sm:text-xs font-bold rounded shadow-sm hover:bg-emerald-700 transition text-center">Approve Drawing</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Scrollable Content Body (Image + History combined so it scrolls naturally) */}
                  <div className="flex-1 overflow-y-auto bg-white flex flex-col">
                    
                    {/* Viewer Area */}
                    <div className="h-[250px] sm:h-[400px] shrink-0 bg-gray-100 border-b border-gray-200 relative flex items-center justify-center p-2">
                      {selectedDrawing.versions?.length > 0 ? (
                        (() => {
                          const url = resolveMediaUrl(selectedDrawing.versions[selectedDrawing.versions.length-1].url);
                          if (url.toLowerCase().includes('.pdf')) {
                            return <iframe src={`${url}#toolbar=0&navpanes=0`} className="w-full h-full rounded shadow-sm border border-gray-200 bg-white" title="viewer" />
                          } else {
                            return <img src={url} alt="drawing preview" className="max-w-full max-h-full object-contain drop-shadow-md rounded" />
                          }
                        })()
                      ) : (
                        <div className="text-gray-400 text-sm font-semibold flex flex-col items-center gap-2">
                          <FileBox className="w-10 h-10 opacity-30" /> No file uploaded yet
                        </div>
                      )}
                    </div>

                    {/* Metadata & History */}
                    <div className="p-4 sm:p-5 space-y-6">
                      <div>
                        <div className="flex justify-between items-end mb-2.5 border-b border-gray-100 pb-1.5">
                          <h3 className="text-[11px] font-bold text-[#000F1B] uppercase tracking-wider flex items-center gap-1.5"><History className="w-3.5 h-3.5 text-[#FF5A00]" /> Revision Logs</h3>
                        </div>
                        <div className="space-y-2">
                          {[...(selectedDrawing.versions || [])].reverse().map((v, i) => (
                            <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold text-gray-900">Version {v.version}</span>
                                  <span className="text-[10px] font-semibold text-gray-500">• {fmtDate(v.uploaded_at)}</span>
                                </div>
                                {v.client_comment ? (
                                  <p className="text-[10px] text-gray-600 italic border-l-2 border-[#FF5A00]/50 pl-2 mt-1">"{v.client_comment}"</p>
                                ) : (
                                  <span className="text-[9px] text-gray-400 italic">No feedback provided</span>
                                )}
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-200">
                                {v.client_decision === "approved" ? <span className="text-[9px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Approved</span> :
                                 v.client_decision === "rejected" ? <span className="text-[9px] font-bold uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">Rejected</span> :
                                 <span className="text-[9px] font-bold uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">Pending</span>}
                                
                                <a href={resolveMediaUrl(v.url)} target="_blank" rel="noreferrer" className="p-1.5 rounded bg-white border border-gray-300 text-gray-600 hover:text-[#1A73E8] hover:border-blue-400 transition shadow-sm">
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-[11px] font-bold text-[#000F1B] uppercase tracking-wider mb-2 border-b border-gray-100 pb-1.5">Drawing Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs">
                          <div className="flex justify-between border-b border-gray-50 pb-1.5"><span className="text-gray-500 font-medium">Drawing No.</span><span className="font-bold text-gray-900">{`DWG-${selectedDrawing.id.substring(4, 7).toUpperCase()}`}</span></div>
                          <div className="flex justify-between border-b border-gray-50 pb-1.5"><span className="text-gray-500 font-medium">Discipline</span><span className="font-bold text-gray-900">{selectedDrawing.category}</span></div>
                          <div className="flex justify-between border-b border-gray-50 pb-1.5 col-span-1 sm:col-span-2"><span className="text-gray-500 font-medium">Title</span><span className="font-bold text-gray-900">{selectedDrawing.name}</span></div>
                          <div className="flex justify-between border-b border-gray-50 pb-1.5"><span className="text-gray-500 font-medium">Upload Date</span><span className="font-bold text-gray-900">{fmtDate(selectedDrawing.uploaded_at)}</span></div>
                        </div>
                      </div>
                    </div>

                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-[#F9FAFB]">
                  <FileBox className="w-16 h-16 opacity-20 mb-4" />
                  <p className="text-lg font-bold text-gray-600 mb-1">No Drawing Selected</p>
                  <p className="text-xs max-w-xs">Select a drawing from the list on the left to view its details and provide approval.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* =======================================================
            VIEW B: MY REQUESTS HISTORY (TABLE LEDGER FORMAT)
        ======================================================= */}
        {currentView === "requests" && (
          <div className="flex-1 bg-white md:border border-gray-200 md:rounded-xl shadow-sm overflow-hidden flex flex-col animate-in fade-in duration-300">
            
            <div className="p-4 md:p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#000F1B] flex items-center justify-center shadow-sm shrink-0">
                  <PenTool className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#000F1B]">Drawing Requests History</h2>
                  <p className="text-[10px] text-gray-500">Track the status of drawings you have requested from the design team.</p>
                </div>
              </div>
              <button 
                onClick={() => setModalType("new_request")}
                className="w-full sm:w-auto px-5 py-2 bg-[#1A73E8] hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Request New Drawing
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              {requestsHistory.length === 0 ? (
                <div className="text-center py-20 max-w-lg mx-auto">
                  <FileBox className="w-12 h-12 mx-auto mb-3 opacity-20 text-gray-500" />
                  <p className="text-sm font-bold text-gray-700 mb-1">No requests yet</p>
                  <p className="text-xs text-gray-500">If you need a specific drawing that isn't in your library, request it here.</p>
                </div>
              ) : (
                <div className="min-w-[600px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                      <tr>
                        <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date requested</th>
                        <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Request Details</th>
                        <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[...requestsHistory].reverse().map(req => (
                        <tr key={req.id} className="hover:bg-gray-50/80 transition-colors bg-white">
                          <td className="py-4 px-5 align-top w-40">
                            <div className="text-xs font-bold text-gray-900">{new Date(req.requested_at).toLocaleDateString("en-GB", {day: '2-digit', month: 'short', year: 'numeric'})}</div>
                          </td>
                          <td className="py-4 px-5 align-top">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{req.category}</span>
                              <h4 className="text-xs font-bold text-[#000F1B]">{req.title}</h4>
                            </div>
                            {req.reason && <p className="text-[11px] text-gray-600 mt-1 max-w-lg">"{req.reason}"</p>}
                          </td>
                          <td className="py-4 px-5 align-top text-center w-48">
                            {req.status === "pending" && <span className="inline-flex items-center justify-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg w-full"><Clock className="w-3.5 h-3.5"/> Pending Design</span>}
                            {req.status === "fulfilled" && <span className="inline-flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg w-full"><CheckCircle2 className="w-3.5 h-3.5"/> Fulfilled</span>}
                            {req.status === "dismissed" && <span className="inline-flex items-center justify-center gap-1.5 text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg w-full"><X className="w-3.5 h-3.5"/> Dismissed</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ==========================================
          MODALS
      ========================================== */}
      
      {/* 1. APPROVE MODAL */}
      {modalType === "approve" && selectedDrawing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden font-['Poppins']">
            <div className="p-4 bg-[#10B981] flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Approve Drawing</h3>
              <button onClick={() => setModalType(null)} className="p-1 hover:bg-black/10 rounded-full transition"><X className="w-4 h-4"/></button>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
                <div className="font-bold text-[#000F1B] mb-1">{selectedDrawing.name}</div>
                <div className="text-[10px] sm:text-xs text-gray-500">Revision: V{selectedDrawing.current_version} &nbsp;|&nbsp; Date: {fmtDate(selectedDrawing.uploaded_at)}</div>
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                By approving this drawing, you confirm that you have reviewed the current revision and are agreeable to proceed with execution based on this design.
              </p>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Approval Comments (Optional)</label>
                <textarea 
                  rows="3" 
                  value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="Add any specific notes or conditions for this approval..."
                  className="w-full border border-gray-200 rounded-lg p-3 text-xs sm:text-sm focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none transition resize-none bg-gray-50 focus:bg-white"
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
              <button onClick={() => setModalType(null)} className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition">Cancel</button>
              <button onClick={() => handleDecision("approved")} disabled={submitting} className="px-5 py-2 text-xs font-bold bg-[#10B981] hover:bg-emerald-600 text-white rounded-lg shadow-sm transition flex items-center gap-2">
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. REQUEST CHANGES MODAL */}
      {modalType === "reject" && selectedDrawing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden font-['Poppins']">
            <div className="p-4 bg-red-600 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Request Changes</h3>
              <button onClick={() => setModalType(null)} className="p-1 hover:bg-black/10 rounded-full transition"><X className="w-4 h-4"/></button>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
                <div className="font-bold text-[#000F1B] mb-1">{selectedDrawing.name}</div>
                <div className="text-[10px] sm:text-xs text-gray-500">Revision: V{selectedDrawing.current_version} &nbsp;|&nbsp; Date: {fmtDate(selectedDrawing.uploaded_at)}</div>
              </div>
              <p className="text-[10px] sm:text-xs font-medium text-red-800 bg-red-50 p-3 rounded-lg border border-red-100">
                Please specify what changes are required. This will be sent directly to the design team for revision.
              </p>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Required Changes <span className="text-red-500">*</span></label>
                <textarea 
                  rows="4" 
                  value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="e.g. Increase bedroom 2 wardrobe width to 600mm..."
                  className="w-full border border-gray-200 rounded-lg p-3 text-xs sm:text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition resize-none bg-gray-50 focus:bg-white"
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
              <button onClick={() => setModalType(null)} className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition">Cancel</button>
              <button 
                onClick={() => handleDecision("rejected")} 
                disabled={submitting || !comment.trim()} 
                className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. REQUEST NEW DRAWING MODAL */}
      {modalType === "new_request" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-['Poppins']">
            <div className="p-4 bg-[#1A73E8] flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2"><Plus className="w-5 h-5"/> Request New Drawing</h3>
              <button onClick={() => setModalType(null)} className="p-1 hover:bg-black/10 rounded-full transition"><X className="w-4 h-4"/></button>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              <p className="text-[10px] sm:text-xs text-gray-500 mb-2">Can't find what you need? Request a new drawing from the design team.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Drawing Category <span className="text-red-500">*</span></label>
                  <select 
                    value={requestForm.category} onChange={e => setRequestForm({...requestForm, category: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm focus:border-blue-500 outline-none cursor-pointer bg-gray-50 focus:bg-white"
                  >
                    <option value="">Select category...</option>
                    {CATEGORIES.filter(c => c !== "All Drawings").map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Drawing Title / Description <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={requestForm.title} onChange={e => setRequestForm({...requestForm, title: e.target.value})}
                  placeholder="e.g. Wardrobe detail for Bedroom 2"
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm focus:border-blue-500 outline-none bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Reason for Request (Optional)</label>
                <textarea 
                  rows="3" 
                  value={requestForm.reason} onChange={e => setRequestForm({...requestForm, reason: e.target.value})}
                  placeholder="Please describe what you need..."
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm focus:border-blue-500 outline-none resize-none bg-gray-50 focus:bg-white"
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
              <button onClick={() => setModalType(null)} className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition">Cancel</button>
              <button 
                onClick={handleRequestNew} 
                disabled={submitting || !requestForm.category || !requestForm.title} 
                className="px-5 py-2 text-xs font-bold bg-[#1A73E8] hover:bg-blue-700 text-white rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
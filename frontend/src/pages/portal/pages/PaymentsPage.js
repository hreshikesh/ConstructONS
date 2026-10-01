import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { 
  IndianRupee, TrendingUp, Download, Receipt, 
  FileText, CheckCircle2, Clock, Info, Search,
  ShieldCheck, Check
} from "lucide-react";
import { usePortal } from "../context/PortalContext";
import { resolveMediaUrl } from "../../../lib/mediaUrl";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000") + "/api";

const fmtDate = (d) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); } 
  catch { return "—"; }
};

export default function PaymentsPage() {
  const { project } = usePortal();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState("invoices"); // 'invoices' | 'schedule' | 'variations'
  
  // Filters & Selection
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [stageFilter, setStageFilter] = useState("All");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  // 1. Commercial Calculations
  const baseContract = Number(project?.contract_value) || 0;
  
  const variations = useMemo(() => {
    return [...(project?.variations || [])].sort((a, b) => new Date(b.approved_at || b.created_at || 0) - new Date(a.approved_at || a.created_at || 0));
  }, [project]);

  const approvedVariations = useMemo(() => {
    return variations.filter(v => v.status === "approved").reduce((sum, v) => sum + (Number(v.amount) || 0), 0);
  }, [variations]);

  const totalProjectValue = baseContract + approvedVariations;

  const invoices = useMemo(() => {
    return [...(project?.invoices || [])].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [project]);

  const activeInvoices = useMemo(() => invoices.filter(i => i.status !== "void"), [invoices]);
  
  const totalInvoiced = useMemo(() => {
    return activeInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  }, [activeInvoices]);
  
  const totalPaid = Number(project?.amount_spent) || 0;
  const outstandingAmount = Math.max(0, totalInvoiced - totalPaid);

  // Percentages for Progress Bars
  const invoicedPct = totalProjectValue > 0 ? Math.min(100, Math.round((totalInvoiced / totalProjectValue) * 100)) : 0;
  const paidPct = totalInvoiced > 0 ? Math.min(100, Math.round((totalPaid / totalInvoiced) * 100)) : 0;
  const outstandingPct = totalInvoiced > 0 ? Math.min(100, Math.round((outstandingAmount / totalInvoiced) * 100)) : 0;

  // 2. Upcoming & History Split (LATEST FIRST)
  const upcomingInvoices = useMemo(() => {
    return activeInvoices
      .filter(i => i.status === "upcoming" || i.status === "due_soon" || i.status === "partially_paid")
      .sort((a, b) => new Date(b.due_date || b.date) - new Date(a.due_date || a.date));
  }, [activeInvoices]);

  const filteredInvoices = useMemo(() => {
    return activeInvoices.filter(i => {
      const q = searchQuery.toLowerCase();
      const matchQuery = !q || (i.number || "").toLowerCase().includes(q) || (i.description || "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || (i.status || "").toLowerCase() === statusFilter.toLowerCase();
      const matchStage = stageFilter === "All" || (i.stage || "General") === stageFilter;
      return matchQuery && matchStatus && matchStage;
    }).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [activeInvoices, searchQuery, statusFilter, stageFilter]);

  // Default selection
  const selectedInvoice = invoices.find(i => i.id === selectedInvoiceId) || upcomingInvoices[0] || filteredInvoices[0];

  // Payments allocated to the currently selected invoice (Sorted latest first)
  const allocatedReceipts = useMemo(() => {
    if (!selectedInvoice) return [];
    return (project?.payments_log || [])
      .filter(p => p.invoice_id === selectedInvoice.id)
      .sort((a, b) => new Date(b.date || b.logged_at || 0) - new Date(a.date || a.logged_at || 0));
  }, [project, selectedInvoice]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase text-emerald-700 bg-emerald-50 border border-emerald-200"><CheckCircle2 className="w-2.5 h-2.5" /> Paid</span>;
      case "partially_paid":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase text-amber-700 bg-amber-50 border border-amber-200">Partially Paid</span>;
      case "overdue":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase text-red-700 bg-red-50 border border-red-200">Overdue</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase text-[#FF5A00] bg-[#FF5A00]/10 border border-[#FF5A00]/20">Upcoming</span>;
    }
  };

  // Safe early return AFTER all hooks
  if (!project) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] font-['Poppins'] bg-[#F5F6F8] overflow-y-auto p-3 sm:p-4 lg:px-12">
      
      {/* 1. TOP HEADER & INFO BANNER */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 shadow-sm mb-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-[#000F1B]">Payments</h1>
          <p className="text-[10px] text-gray-500 mt-0.5">Track your project payments, invoices and payment history in one place.</p>
        </div>
        <div className="bg-[#FF5A00]/5 border border-[#FF5A00]/20 rounded-lg p-2.5 flex items-start gap-2 max-w-md shrink-0">
          <Info className="w-3.5 h-3.5 text-[#FF5A00] shrink-0 mt-0.5" />
          <p className="text-[9px] text-[#000F1B] font-medium leading-relaxed">
            This section shows all invoices raised for your project, your verified payment receipts and the outstanding amount as per agreement.
          </p>
        </div>
      </div>

      {/* 2. TOP 5 KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 mb-4">
        
        {/* Total Project Value */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Total Project Value</span>
            <FileText className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <div>
            <div className="text-base font-black text-[#000F1B]">₹ {totalProjectValue.toLocaleString('en-IN')}</div>
            <div className="text-[8px] font-semibold text-gray-400 mt-0.5">(As per Agreement)</div>
          </div>
        </div>

        {/* Approved Variations */}
        <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] font-bold text-amber-800 uppercase tracking-wider">Approved Variations</span>
            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center"><TrendingUp className="w-3 h-3 text-[#FF5A00]" /></div>
          </div>
          <div>
            <div className="text-base font-black text-[#FF5A00]">₹ {approvedVariations.toLocaleString('en-IN')}</div>
            <div className="text-[8px] font-semibold text-amber-700/70 mt-0.5">{approvedVariations > 0 ? "Approved Scope Changes" : "No variations"}</div>
          </div>
        </div>

        {/* Total Invoiced */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Total Invoiced</span>
            <Receipt className="w-3.5 h-3.5 text-[#000F1B]" />
          </div>
          <div>
            <div className="text-base font-black text-[#000F1B]">₹ {totalInvoiced.toLocaleString('en-IN')}</div>
            <div className="flex items-center justify-between text-[8px] font-bold text-gray-400 mt-1">
              <span>of ₹{totalProjectValue.toLocaleString('en-IN')}</span>
              <span className="text-[#000F1B]">{invoicedPct}%</span>
            </div>
            <div className="w-full h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-[#000F1B]" style={{ width: `${invoicedPct}%` }} />
            </div>
          </div>
        </div>

        {/* Total Paid */}
        <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-3 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] font-bold text-emerald-800 uppercase tracking-wider">Total Paid</span>
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-emerald-600" /></div>
          </div>
          <div>
            <div className="text-base font-black text-emerald-700">₹ {totalPaid.toLocaleString('en-IN')}</div>
            <div className="flex items-center justify-between text-[8px] font-bold text-emerald-600/80 mt-1">
              <span>Receipts Verified</span>
              <span>{paidPct}%</span>
            </div>
            <div className="w-full h-1 bg-emerald-100 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-emerald-600" style={{ width: `${paidPct}%` }} />
            </div>
          </div>
        </div>

        {/* Outstanding Amount */}
        <div className="bg-red-50/40 border border-red-200/60 rounded-xl p-3 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] font-bold text-red-800 uppercase tracking-wider">Outstanding Amount</span>
            <Clock className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div>
            <div className="text-base font-black text-red-600">₹ {outstandingAmount.toLocaleString('en-IN')}</div>
            <div className="flex items-center justify-between text-[8px] font-bold text-red-500 mt-1">
              <span>Unpaid Invoices</span>
              <span>{outstandingPct}%</span>
            </div>
            <div className="w-full h-1 bg-red-100 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-red-500" style={{ width: `${outstandingPct}%` }} />
            </div>
          </div>
        </div>

      </div>

      {/* 3. TABS NAVIGATION */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-3 bg-white px-3 pt-2 rounded-t-xl shrink-0">
        <button 
          onClick={() => setActiveTab("invoices")} 
          className={`pb-2 text-xs font-bold transition-all relative ${activeTab === "invoices" ? "text-[#000F1B]" : "text-gray-400 hover:text-gray-700"}`}
        >
          Invoices & Payments
          {activeTab === "invoices" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF5A00]" />}
        </button>

        <button 
          onClick={() => setActiveTab("schedule")} 
          className={`pb-2 text-xs font-bold transition-all relative ${activeTab === "schedule" ? "text-[#000F1B]" : "text-gray-400 hover:text-gray-700"}`}
        >
          Payment Schedule
          {activeTab === "schedule" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF5A00]" />}
        </button>

        <button 
          onClick={() => setActiveTab("variations")} 
          className={`pb-2 text-xs font-bold transition-all relative ${activeTab === "variations" ? "text-[#000F1B]" : "text-gray-400 hover:text-gray-700"}`}
        >
          Agreement & Variations
          {activeTab === "variations" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF5A00]" />}
        </button>
      </div>

      {/* =========================================================
          TAB 1: INVOICES & PAYMENTS (Split View)
      ========================================================= */}
      {activeTab === "invoices" && (
        <div className="flex-1 flex flex-col lg:flex-row gap-3 items-start">

          {/* LEFT 60%: Upcoming + History Tables */}
          <div className="flex-1 w-full space-y-3">

            {/* Upcoming Payments Card */}
            {upcomingInvoices.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#000F1B]">Upcoming Payments</h3>
                  <span className="text-[9px] font-bold text-[#FF5A00] bg-[#FF5A00]/10 px-2 py-0.5 rounded">{upcomingInvoices.length} Due</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[10px]">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase font-bold">
                      <tr>
                        <th className="py-2 px-3">Invoice #</th>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3">Due Date</th>
                        <th className="py-2 px-3">Amount</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {upcomingInvoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-[#000F1B]">{inv.number}</td>
                          <td className="py-2.5 px-3 font-bold text-gray-800">{inv.description}</td>
                          <td className="py-2.5 px-3 text-gray-600">{fmtDate(inv.due_date)}</td>
                          <td className="py-2.5 px-3 font-bold text-[#FF5A00]">₹ {Number(inv.amount).toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-3">{getStatusBadge(inv.status)}</td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => setSelectedInvoiceId(inv.id)}
                              className="px-2.5 py-1 bg-[#000F1B] hover:bg-[#FF5A00] text-white text-[9px] font-bold rounded shadow-sm transition"
                            >
                              View Invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Invoice & Payment History Table (Latest First) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-[#000F1B]">Invoice and Payment History</h3>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text" placeholder="Search invoice..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-7 pr-2 py-1 text-[9px] bg-white border border-gray-200 rounded outline-none focus:border-[#FF5A00]"
                    />
                  </div>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-[9px] font-bold bg-white border border-gray-200 rounded px-2 py-1 outline-none">
                    <option value="All">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px]">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase font-bold">
                    <tr>
                      <th className="py-2 px-3">Invoice #</th>
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3">Stage</th>
                      <th className="py-2 px-3">Invoice Date</th>
                      <th className="py-2 px-3">Due Date</th>
                      <th className="py-2 px-3">Amount</th>
                      <th className="py-2 px-3">Paid</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredInvoices.length === 0 ? (
                      <tr><td colSpan="9" className="py-8 text-center text-gray-400 italic">No invoices found matching filter.</td></tr>
                    ) : (
                      filteredInvoices.map(inv => (
                        <tr 
                          key={inv.id} 
                          className={`hover:bg-gray-50 transition cursor-pointer ${selectedInvoice?.id === inv.id ? "bg-[#FF5A00]/5 border-l-2 border-l-[#FF5A00]" : ""}`} 
                          onClick={() => setSelectedInvoiceId(inv.id)}
                        >
                          <td className="py-2.5 px-3 font-mono font-bold text-[#000F1B]">{inv.number}</td>
                          <td className="py-2.5 px-3 font-bold text-gray-800 max-w-[150px] truncate" title={inv.description}>{inv.description}</td>
                          <td className="py-2.5 px-3 text-gray-500">{inv.stage || "—"}</td>
                          <td className="py-2.5 px-3 text-gray-500">{fmtDate(inv.date)}</td>
                          <td className="py-2.5 px-3 text-gray-500">{fmtDate(inv.due_date)}</td>
                          <td className="py-2.5 px-3 font-bold text-gray-900">₹ {Number(inv.amount).toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-600">₹ {Number(inv.paid_amount || 0).toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-3">{getStatusBadge(inv.status)}</td>
                          <td className="py-2.5 px-3 text-right">
                            <button onClick={() => setSelectedInvoiceId(inv.id)} className="text-[#FF5A00] font-bold text-[9px] hover:underline">View</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* RIGHT 40%: Invoice Details Drawer & Auto-Loaded Receipts */}
          <div className="w-full lg:w-[360px] xl:w-[420px] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden shrink-0">
            {selectedInvoice ? (
              <div className="p-4 space-y-4">

                {/* Drawer Header */}
                <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-[#FF5A00]" />
                      <h3 className="text-sm font-bold text-[#000F1B]">{selectedInvoice.number}</h3>
                      {getStatusBadge(selectedInvoice.status)}
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium">{selectedInvoice.description}</div>
                  </div>

                  <button
                    onClick={() => {
                      toast.info("Generating PDF Invoice...");
                      const url = `${API_BASE}/portal/my-project/${project.id}/invoices/${selectedInvoice.id}/pdf`;
                      window.open(url, "_blank");
                    }}
                    className="px-2.5 py-1.5 bg-[#FF5A00]/10 border border-[#FF5A00]/20 text-[#FF5A00] text-[9px] font-bold rounded flex items-center gap-1 hover:bg-[#FF5A00] hover:text-white transition shadow-sm"
                  >
                    <Download className="w-3 h-3" /> View / Download PDF
                  </button>
                </div>

                {/* Details Breakdown */}
                <div className="grid grid-cols-2 gap-y-2 text-[10px] bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-gray-500">Invoice Date</div>
                  <div className="font-bold text-gray-900 text-right">{fmtDate(selectedInvoice.date)}</div>

                  <div className="text-gray-500">Due Date</div>
                  <div className="font-bold text-gray-900 text-right">{fmtDate(selectedInvoice.due_date)}</div>

                  <div className="text-gray-500">Invoice Amount</div>
                  <div className="font-bold text-gray-900 text-right">₹ {Number(selectedInvoice.amount).toLocaleString('en-IN')}</div>

                  <div className="text-gray-500">Paid Amount</div>
                  <div className="font-bold text-emerald-600 text-right">₹ {Number(selectedInvoice.paid_amount || 0).toLocaleString('en-IN')}</div>

                  <div className="text-gray-500">Outstanding Amount</div>
                  <div className="font-bold text-red-600 text-right">₹ {Math.max(0, Number(selectedInvoice.amount) - Number(selectedInvoice.paid_amount || 0)).toLocaleString('en-IN')}</div>

                  <div className="text-gray-500">Stage</div>
                  <div className="font-bold text-gray-900 text-right">{selectedInvoice.stage || "General"}</div>
                </div>

                {/* AUTO-LOADED PAYMENT RECEIPTS (LATEST FIRST) */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Payment Receipts
                    </h4>
                    <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                      {allocatedReceipts.length} Recorded
                    </span>
                  </div>

                  {allocatedReceipts.length === 0 ? (
                    <div className="text-[9px] text-gray-400 italic bg-gray-50 p-3 rounded-lg text-center border border-dashed border-gray-200">
                      No payment receipts logged for this invoice yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {allocatedReceipts.map((p, idx) => (
                        <div key={idx} className="bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-200/80 flex justify-between items-center text-[10px]">
                          <div>
                            <div className="font-black text-emerald-800 text-xs">₹ {Number(p.amount).toLocaleString('en-IN')}</div>
                            <div className="text-[9px] font-semibold text-gray-600 mt-0.5">
                              {p.method} • <span className="font-mono">{p.reference || "No Ref"}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[8px] font-bold text-emerald-700 uppercase bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-0.5 mb-1">
                              <Check className="w-2.5 h-2.5"/> Verified
                            </div>
                            <div className="text-gray-500 text-[8px] font-medium">{fmtDate(p.date || p.logged_at)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">Select an invoice to view full breakdown and receipts.</div>
            )}
          </div>

        </div>
      )}

      {/* =========================================================
          TAB 2: PAYMENT SCHEDULE (LATEST FIRST)
      ========================================================= */}
      {activeTab === "schedule" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-xs font-bold text-[#000F1B]">Milestone Payment Schedule</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Contractually agreed milestone schedule as per agreement.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px]">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase font-bold">
                <tr>
                  <th className="py-2.5 px-4">Milestone</th>
                  <th className="py-2.5 px-4">Stage</th>
                  <th className="py-2.5 px-4">Target Date</th>
                  <th className="py-2.5 px-4">Milestone Amount</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(project.payment_schedule || []).length === 0 ? (
                  <tr><td colSpan="5" className="py-8 text-center text-gray-400 italic">No milestone schedule uploaded.</td></tr>
                ) : (
                  [...(project.payment_schedule || [])]
                    .sort((a, b) => new Date(b.due_date || 0) - new Date(a.due_date || 0))
                    .map((ms, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-bold text-[#000F1B]">{ms.name}</td>
                        <td className="py-3 px-4 text-[#FF5A00] font-semibold">{ms.stage || "General"}</td>
                        <td className="py-3 px-4 text-gray-600">{fmtDate(ms.due_date)}</td>
                        <td className="py-3 px-4 font-bold text-gray-900">₹ {Number(ms.amount).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4">{getStatusBadge(ms.status)}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: AGREEMENT & VARIATIONS (LATEST FIRST)
      ========================================================= */}
      {activeTab === "variations" && (
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="text-xs font-bold text-[#000F1B] mb-2 uppercase tracking-wider">Commercial Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="text-[9px] font-bold text-gray-500 uppercase">Original Agreement</div>
                <div className="text-sm font-black text-[#000F1B] mt-1">₹ {baseContract.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <div className="text-[9px] font-bold text-amber-800 uppercase">Approved Variations</div>
                <div className="text-sm font-black text-[#FF5A00] mt-1">+ ₹ {approvedVariations.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <div className="text-[9px] font-bold text-emerald-800 uppercase">Current Approved Project Value</div>
                <div className="text-sm font-black text-emerald-700 mt-1">₹ {totalProjectValue.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xs font-bold text-[#000F1B]">Approved Scope Variations</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px]">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase font-bold">
                  <tr>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4">Approval Date</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {variations.length === 0 ? (
                    <tr><td colSpan="4" className="py-8 text-center text-gray-400 italic">No variations recorded.</td></tr>
                  ) : (
                    variations.map((v, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-bold text-gray-900">{v.description}</td>
                        <td className="py-3 px-4 font-bold text-[#FF5A00]">+ ₹ {Number(v.amount).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-gray-500">{fmtDate(v.approved_at || v.created_at)}</td>
                        <td className="py-3 px-4"><span className="text-[8px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">{v.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, IndianRupee, Plus, CheckCircle2, Trash2, X, Download, Save, ArrowRight } from "lucide-react";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000") + "/api";
const api = axios.create({ baseURL: API_BASE, withCredentials: true });

export default function FinanceTab({ project, onSaved }) {
    const [activeTab, setActiveTab] = useState("invoices"); 
    const [loading, setLoading] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);

    const [contractValue, setContractValue] = useState(project.contract_value || 0);

    const dynamicStages = useMemo(() => {
        if (!project?.stages) return [];
        return project.stages.map(s => s.name).filter(Boolean);
    }, [project]);

    const [invoiceForm, setInvoiceForm] = useState({
        number: `INV-${String((project.invoices?.length || 0) + 1).padStart(3, '0')}`,
        description: "", stage: "General", date: new Date().toISOString().split("T")[0],
        due_date: "", amount: "", status: "upcoming", milestone_id: ""
    });

    const [variationForm, setVariationForm] = useState({
        description: "", amount: "", status: "approved"
    });

    const [paymentForm, setPaymentForm] = useState({
        amount: "", date: new Date().toISOString().split("T")[0], method: "Bank Transfer", reference: "", notes: "", invoice_id: ""
    });

    const [milestoneForm, setMilestoneForm] = useState({
        name: "", stage: "General", due_date: "", amount: "", status: "pending"
    });

    const [invoiceSettings, setInvoiceSettings] = useState({
        invoice_gst_percent: 0,
        invoice_bank_details: "ConstructONS Pvt. Ltd.\nBank: HDFC Bank\nA/C: 50200000000000\nIFSC: HDFC0001234",
        invoice_footer_notes: "Thank you for building with ConstructONS. Late payments may attract a penalty of 1.5% per month."
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const { data } = await api.get('/site-settings');
                if (data) {
                    setInvoiceSettings({
                        invoice_gst_percent: data.invoice_gst_percent || 0,
                        invoice_bank_details: data.invoice_bank_details || "ConstructONS Pvt. Ltd.\nBank: HDFC Bank\nA/C: 50200000000000\nIFSC: HDFC0001234",
                        invoice_footer_notes: data.invoice_footer_notes || "Thank you for building with ConstructONS. Late payments may attract a penalty of 1.5% per month."
                    });
                }
            } catch (e) { console.error("Could not load site settings"); }
        };
        loadSettings();
        setContractValue(project.contract_value || 0);
    }, [project]);

    const saveBaseSettings = async () => {
        setSavingSettings(true);
        try {
            await api.put(`/admin/projects/${project.id}`, { contract_value: Number(contractValue) || 0 });
            toast.success("Contract value updated");
            onSaved();
        } catch { toast.error("Update failed"); } finally { setSavingSettings(false); }
    };

    const saveInvoiceSettings = async () => {
        setSavingSettings(true);
        try {
            await api.put('/site-settings', invoiceSettings);
            toast.success("Invoice PDF settings saved globally");
        } catch { toast.error("Failed to save settings"); } finally { setSavingSettings(false); }
    };

    const handleCreateInvoice = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            await api.post(`/admin/projects/${project.id}/invoices`, {
                ...invoiceForm, amount: Number(invoiceForm.amount) || 0
            });
            toast.success("Invoice raised");
            setInvoiceForm({ number: `INV-${String((project.invoices?.length || 0) + 2).padStart(3, '0')}`, description: "", stage: "General", date: new Date().toISOString().split("T")[0], due_date: "", amount: "", status: "upcoming", milestone_id: "" });
            onSaved();
        } catch (err) { toast.error(err?.response?.data?.detail || "Failed to raise invoice"); } finally { setLoading(false); }
    };

    const raiseInvoiceFromMilestone = (ms) => {
        setInvoiceForm(prev => ({
            ...prev,
            description: ms.name,
            stage: ms.stage || "General",
            amount: ms.amount,
            due_date: ms.due_date || new Date().toISOString().split("T")[0],
            milestone_id: ms.id
        }));
        setActiveTab("invoices");
        window.scrollTo({ top: 0, behavior: "smooth" });
        toast.info("Invoice form pre-filled from milestone.");
    };

    // --- NEW: Function to auto-fill payment from invoice ---
    const recordPaymentForInvoice = (inv) => {
        const remainingAmount = Number(inv.amount) - Number(inv.paid_amount || 0);
        setPaymentForm(prev => ({
            ...prev,
            amount: remainingAmount,
            invoice_id: inv.id,
            date: new Date().toISOString().split("T")[0]
        }));
        setActiveTab("payments");
        window.scrollTo({ top: 0, behavior: "smooth" });
        toast.info(`Payment form pre-filled for ${inv.number}`);
    };

    const handleCreateVariation = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            await api.post(`/admin/projects/${project.id}/variations`, {
                ...variationForm, amount: Number(variationForm.amount) || 0
            });
            toast.success("Variation logged");
            setVariationForm({ description: "", amount: "", status: "approved" });
            onSaved();
        } catch (err) { toast.error(err?.response?.data?.detail || "Failed to log variation"); } finally { setLoading(false); }
    };

    const savePayment = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            await api.post(`/admin/projects/${project.id}/payments`, {
                amount: Number(paymentForm.amount), date: paymentForm.date,
                method: paymentForm.method, reference: paymentForm.reference,
                notes: paymentForm.notes, invoice_id: paymentForm.invoice_id || null
            });
            toast.success("Payment logged & Invoice updated!");
            setPaymentForm({ amount: "", date: new Date().toISOString().split("T")[0], method: "Bank Transfer", reference: "", notes: "", invoice_id: "" });
            onSaved();
        } catch (err) { toast.error(err?.response?.data?.detail || "Failed to log payment"); }
        finally { setLoading(false); }
    };

    const handleAddMilestone = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            await api.post(`/admin/projects/${project.id}/payment-schedule`, { 
                ...milestoneForm, amount: Number(milestoneForm.amount) || 0 
            });
            toast.success("Milestone added to schedule");
            setMilestoneForm({ name: "", stage: "General", due_date: "", amount: "", status: "pending" });
            onSaved();
        } catch (err) { toast.error(err?.response?.data?.detail || "Failed to add milestone"); } finally { setLoading(false); }
    };

    const deleteInvoice = async (id) => {
        if (!window.confirm("Delete this invoice?")) return;
        try { await api.delete(`/admin/projects/${project.id}/invoices/${id}`); toast.success("Invoice deleted"); onSaved(); } catch { toast.error("Failed"); }
    };

    const deletePayment = async (payId) => {
        if (!window.confirm("Reverse this payment?")) return;
        try { await api.delete(`/admin/projects/${project.id}/payments/${payId}`); toast.success("Payment reversed"); onSaved(); } catch { toast.error("Failed"); }
    };

    const deleteMilestone = async (msId) => {
        if (!window.confirm("Delete this milestone?")) return;
        try { await api.delete(`/admin/projects/${project.id}/payment-schedule/${msId}`); toast.success("Milestone deleted"); onSaved(); } catch { toast.error("Failed"); }
    };

    // Metrics
    const baseContract = project.contract_value || 0;
    const approvedVariations = (project.variations || []).filter(v => v.status === "approved").reduce((sum, v) => sum + (Number(v.amount) || 0), 0);
    const totalProjectValue = baseContract + approvedVariations;

    const invoices = project.invoices || [];
    const totalInvoiced = invoices.filter(i => i.status !== "void").reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const totalPaid = project.amount_spent || 0;
    const outstanding = Math.max(0, totalInvoiced - totalPaid);

    return (
        <div className="space-y-4 font-['Poppins']">

            {/* Financial Overview Strip */}
            <div className="bg-[#000F1B] rounded-xl p-4 text-white shadow-sm grid grid-cols-2 md:grid-cols-5 gap-3 border-t-2 border-[#FF5A00]">
                <div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Base Contract</div>
                    <div className="text-sm font-black text-white mt-0.5">₹ {baseContract.toLocaleString('en-IN')}</div>
                </div>
                <div>
                    <div className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Approved Variations</div>
                    <div className="text-sm font-black text-amber-400 mt-0.5">+ ₹ {approvedVariations.toLocaleString('en-IN')}</div>
                </div>
                <div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Total Invoiced</div>
                    <div className="text-sm font-black text-white mt-0.5">₹ {totalInvoiced.toLocaleString('en-IN')}</div>
                </div>
                <div>
                    <div className="text-[9px] font-bold text-[#FF5A00] uppercase tracking-wider">Total Paid</div>
                    <div className="text-sm font-black text-[#FF5A00] mt-0.5">₹ {totalPaid.toLocaleString('en-IN')}</div>
                </div>
                <div>
                    <div className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Outstanding</div>
                    <div className="text-sm font-black text-emerald-400 mt-0.5">₹ {outstanding.toLocaleString('en-IN')}</div>
                </div>
            </div>

            {/* Tabs Header */}
            <div className="flex items-center gap-4 border-b border-gray-200 overflow-x-auto no-scrollbar">
                <button onClick={() => setActiveTab("invoices")} className={`pb-2 text-xs font-bold whitespace-nowrap relative ${activeTab === "invoices" ? "text-[#000F1B]" : "text-gray-400 hover:text-gray-700"}`}>
                    Invoices ({invoices.length})
                    {activeTab === "invoices" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF5A00]" />}
                </button>
                <button onClick={() => setActiveTab("schedule")} className={`pb-2 text-xs font-bold whitespace-nowrap relative ${activeTab === "schedule" ? "text-[#000F1B]" : "text-gray-400 hover:text-gray-700"}`}>
                    Payment Schedule ({(project.payment_schedule || []).length})
                    {activeTab === "schedule" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF5A00]" />}
                </button>
                <button onClick={() => setActiveTab("variations")} className={`pb-2 text-xs font-bold whitespace-nowrap relative ${activeTab === "variations" ? "text-[#000F1B]" : "text-gray-400 hover:text-gray-700"}`}>
                    Variations ({(project.variations || []).length})
                    {activeTab === "variations" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF5A00]" />}
                </button>
                <button onClick={() => setActiveTab("payments")} className={`pb-2 text-xs font-bold whitespace-nowrap relative ${activeTab === "payments" ? "text-[#000F1B]" : "text-gray-400 hover:text-gray-700"}`}>
                    Receipts ({(project.payments_log || []).length})
                    {activeTab === "payments" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF5A00]" />}
                </button>
                <button onClick={() => setActiveTab("master")} className={`pb-2 text-xs font-bold whitespace-nowrap relative ${activeTab === "master" ? "text-[#000F1B]" : "text-gray-400 hover:text-gray-700"}`}>
                    Contract Setup
                    {activeTab === "master" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF5A00]" />}
                </button>
                <button onClick={() => setActiveTab("settings")} className={`pb-2 text-xs font-bold whitespace-nowrap relative ${activeTab === "settings" ? "text-[#000F1B]" : "text-gray-400 hover:text-gray-700"}`}>
                    Invoice Settings
                    {activeTab === "settings" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF5A00]" />}
                </button>
            </div>

            {/* TAB 1: INVOICES */}
            {activeTab === "invoices" && (
                <div className="space-y-4 animate-in fade-in">
                    <div className={`p-4 rounded-xl border shadow-sm transition-colors ${invoiceForm.milestone_id ? "bg-amber-50 border-amber-300" : "bg-white border-gray-200"}`}>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-bold text-[#000F1B] uppercase tracking-wider">Raise New Invoice</h3>
                            {invoiceForm.milestone_id && <span className="text-[9px] font-bold text-amber-700 bg-amber-200 px-2 py-0.5 rounded uppercase tracking-wider">From Schedule Milestone</span>}
                        </div>
                        <form onSubmit={handleCreateInvoice} className="grid grid-cols-2 md:grid-cols-7 gap-3 items-end text-xs">
                            <div><label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Invoice #</label><input required value={invoiceForm.number} onChange={e => setInvoiceForm({ ...invoiceForm, number: e.target.value })} className="w-full p-2 border border-gray-200 rounded-lg font-bold outline-none focus:border-[#FF5A00] bg-white" /></div>
                            <div className="md:col-span-2"><label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Description *</label><input required value={invoiceForm.description} onChange={e => setInvoiceForm({ ...invoiceForm, description: e.target.value })} placeholder="e.g. Phase 3 Structure" className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-[#FF5A00] bg-white" /></div>
                            <div>
                                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Stage</label>
                                <select value={invoiceForm.stage} onChange={e => setInvoiceForm({ ...invoiceForm, stage: e.target.value })} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-[#FF5A00] bg-white">
                                    <option value="General">General</option>
                                    {dynamicStages.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div><label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Amount (₹) *</label><input type="number" required value={invoiceForm.amount} onChange={e => setInvoiceForm({ ...invoiceForm, amount: e.target.value })} className="w-full p-2 border border-gray-200 rounded-lg font-bold text-[#FF5A00] outline-none focus:border-[#FF5A00] bg-white" /></div>
                            <div><label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Due Date *</label><input type="date" required value={invoiceForm.due_date} onChange={e => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-[#FF5A00] bg-white" /></div>
                            <button type="submit" disabled={loading} className="bg-[#000F1B] hover:bg-[#FF5A00] text-white font-bold py-2 px-3 rounded-lg transition flex items-center justify-center gap-1 shadow-sm">
                                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Raise
                            </button>
                        </form>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-[11px] min-w-[850px]">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
                                    <tr><th className="p-3">Invoice #</th><th className="p-3">Description</th><th className="p-3">Due Date</th><th className="p-3">Amount</th><th className="p-3">Paid</th><th className="p-3 text-center">Status</th><th className="p-3 text-right">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {invoices.length === 0 ? (
                                        <tr><td colSpan="7" className="p-8 text-center text-gray-400 italic">No invoices raised yet.</td></tr>
                                    ) : (
                                        // Sorted latest first by date
                                        [...invoices].sort((a,b)=>new Date(b.date) - new Date(a.date)).map(inv => (
                                            <tr key={inv.id} className="hover:bg-gray-50 transition">
                                                <td className="p-3 font-mono font-bold text-[#000F1B]">{inv.number}</td>
                                                <td className="p-3 font-bold text-gray-800">{inv.description}</td>
                                                <td className="p-3 text-gray-500">{inv.due_date}</td>
                                                <td className="p-3 font-bold text-gray-900">₹ {Number(inv.amount).toLocaleString('en-IN')}</td>
                                                <td className="p-3 font-bold text-emerald-600">₹ {Number(inv.paid_amount || 0).toLocaleString('en-IN')}</td>
                                                <td className="p-3 text-center">
                                                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${inv.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{inv.status.replace("_", " ")}</span>
                                                </td>
                                                <td className="p-3 text-right whitespace-nowrap">
                                                    {inv.status !== "paid" && (
                                                      <button onClick={() => recordPaymentForInvoice(inv)} className="bg-emerald-600 text-white px-2 py-1 rounded text-[9px] font-bold hover:bg-emerald-700 transition mr-2 inline-flex items-center gap-1">
                                                        <IndianRupee className="w-2.5 h-2.5" /> Record Payment
                                                      </button>
                                                    )}
                                                    <button
                                                        onClick={() => window.open(`${API_BASE}/admin/projects/${project.id}/invoices/${inv.id}/pdf`, "_blank")}
                                                        className="text-[#1A73E8] p-1.5 hover:bg-blue-50 rounded-lg mr-2 font-bold text-[9px] uppercase tracking-wider transition border border-transparent"
                                                    >
                                                        Preview PDF
                                                    </button>
                                                    <button onClick={() => deleteInvoice(inv.id)} className="text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: PAYMENT SCHEDULE */}
            {activeTab === "schedule" && (
                <div className="space-y-4 animate-in fade-in">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-xs font-bold text-[#000F1B] mb-3 uppercase tracking-wider">Add Milestone to Schedule</h3>
                        <form onSubmit={handleAddMilestone} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end text-xs">
                            <div className="md:col-span-2"><label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Milestone Name *</label><input required value={milestoneForm.name} onChange={e => setMilestoneForm({ ...milestoneForm, name: e.target.value })} placeholder="e.g. Upon Plinth Completion" className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-[#FF5A00]" /></div>
                            <div>
                                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Related Stage</label>
                                <select value={milestoneForm.stage} onChange={e => setMilestoneForm({ ...milestoneForm, stage: e.target.value })} className="w-full p-2 border border-gray-200 rounded-lg bg-white outline-none focus:border-[#FF5A00]">
                                    <option value="General">General</option>
                                    {dynamicStages.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div><label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Amount (₹) *</label><input type="number" required value={milestoneForm.amount} onChange={e => setMilestoneForm({ ...milestoneForm, amount: e.target.value })} className="w-full p-2 border border-gray-200 rounded-lg font-bold text-[#FF5A00] outline-none focus:border-[#FF5A00]" /></div>
                            <div><label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Target Date</label><input type="date" value={milestoneForm.due_date} onChange={e => setMilestoneForm({ ...milestoneForm, due_date: e.target.value })} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-[#FF5A00]" /></div>
                            <button type="submit" disabled={loading} className="bg-[#000F1B] hover:bg-[#FF5A00] text-white font-bold py-2 px-3 rounded-lg transition flex items-center justify-center gap-1 shadow-sm">
                                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Add Milestone
                            </button>
                        </form>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left text-[11px] min-w-[600px]">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
                                <tr><th className="p-3">Milestone</th><th className="p-3">Stage</th><th className="p-3">Target Date</th><th className="p-3">Amount</th><th className="p-3 text-center">Status</th><th className="p-3 text-right">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(project.payment_schedule || []).length === 0 ? (
                                    <tr><td colSpan="6" className="py-8 text-center text-gray-400 italic">No milestone schedule added.</td></tr>
                                ) : (
                                    (project.payment_schedule || []).map(ms => (
                                        <tr key={ms.id} className="hover:bg-gray-50 transition">
                                            <td className="p-3 font-bold text-[#000F1B]">{ms.name}</td>
                                            <td className="p-3 text-[#FF5A00] font-semibold">{ms.stage || "General"}</td>
                                            <td className="p-3 text-gray-500">{ms.due_date || "—"}</td>
                                            <td className="p-3 font-bold text-gray-900">₹ {Number(ms.amount).toLocaleString('en-IN')}</td>
                                            <td className="p-3 text-center">
                                              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${ms.status === "invoiced" ? "bg-blue-50 text-blue-700 border-blue-200" : ms.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                                                {ms.status}
                                              </span>
                                            </td>
                                            <td className="p-3 text-right whitespace-nowrap">
                                              {ms.status === "pending" ? (
                                                <button onClick={() => raiseInvoiceFromMilestone(ms)} className="px-3 py-1 bg-[#000F1B] text-white text-[9px] font-bold rounded hover:bg-[#FF5A00] transition flex items-center gap-1 shadow-sm mr-2 inline-flex">
                                                  Raise Invoice <ArrowRight className="w-3 h-3"/>
                                                </button>
                                              ) : (
                                                <span className="text-[9px] font-bold text-gray-400 mr-4 italic">Invoiced</span>
                                              )}
                                              <button onClick={() => deleteMilestone(ms.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: VARIATIONS */}
            {activeTab === "variations" && (
                <div className="space-y-4 animate-in fade-in">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-xs font-bold text-[#000F1B] mb-3 uppercase tracking-wider">Log Approved Variation / Scope Change</h3>
                        <form onSubmit={handleCreateVariation} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end text-xs">
                            <div className="sm:col-span-2"><label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Description *</label><input required value={variationForm.description} onChange={e => setVariationForm({ ...variationForm, description: e.target.value })} placeholder="e.g. Additional false ceiling in Master Bedroom" className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-[#FF5A00]" /></div>
                            <div><label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Amount (₹) *</label><input type="number" required value={variationForm.amount} onChange={e => setVariationForm({ ...variationForm, amount: e.target.value })} className="w-full p-2 border border-gray-200 rounded-lg font-bold text-amber-600 outline-none focus:border-[#FF5A00]" /></div>
                            <button type="submit" disabled={loading} className="bg-[#000F1B] hover:bg-[#FF5A00] text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-1 shadow-sm">
                                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Add Variation
                            </button>
                        </form>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left text-[11px]">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
                                <tr><th className="p-3">Description</th><th className="p-3">Amount</th><th className="p-3">Status</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(project.variations || []).length === 0 ? (
                                    <tr><td colSpan="3" className="py-8 text-center text-gray-400 italic">No variations logged.</td></tr>
                                ) : (
                                    (project.variations || []).map(v => (
                                        <tr key={v.id} className="hover:bg-gray-50 transition">
                                            <td className="p-3 font-bold text-gray-900">{v.description}</td>
                                            <td className="p-3 font-bold text-amber-600">+ ₹ {Number(v.amount).toLocaleString('en-IN')}</td>
                                            <td className="p-3"><span className="text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">{v.status}</span></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 4: PAYMENT RECEIPTS */}
            {activeTab === "payments" && (
                <div className="space-y-4 animate-in fade-in">
                    <div className={`p-4 rounded-xl border shadow-sm transition-colors ${paymentForm.invoice_id ? "bg-emerald-50 border-emerald-300" : "bg-white border-gray-200"}`}>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-bold text-[#000F1B] uppercase tracking-wider">Log Client Payment Receipt</h3>
                            {paymentForm.invoice_id && <span className="text-[9px] font-bold text-emerald-700 bg-emerald-200 px-2 py-0.5 rounded uppercase tracking-wider">Allocating to Invoice</span>}
                        </div>
                        <form onSubmit={savePayment} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end text-xs">
                            <div><label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Amount (₹) *</label><input type="number" required value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} className="w-full p-2 border border-gray-200 rounded-lg font-bold text-emerald-600 outline-none focus:border-[#FF5A00] bg-white" /></div>
                            <div>
                                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Allocate to Invoice</label>
                                <select value={paymentForm.invoice_id} onChange={e => setPaymentForm({ ...paymentForm, invoice_id: e.target.value })} className="w-full p-2 border border-gray-200 rounded-lg bg-white outline-none focus:border-[#FF5A00]">
                                    <option value="">General Payment</option>
                                    {invoices.map(i => <option key={i.id} value={i.id}>{i.number} - ₹{i.amount}</option>)}
                                </select>
                            </div>
                            <div><label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Method</label><select value={paymentForm.method} onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })} className="w-full p-2 border border-gray-200 rounded-lg bg-white outline-none focus:border-[#FF5A00]"><option>Bank Transfer</option><option>UPI</option><option>Cheque</option><option>Cash</option></select></div>
                            <div><label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Ref / UTR No.</label><input value={paymentForm.reference} onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })} placeholder="e.g. UTR12345" className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-[#FF5A00] bg-white" /></div>
                            <button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-1 shadow-sm">
                                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <IndianRupee className="w-3 h-3" />} Log Payment
                            </button>
                        </form>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left text-[11px] min-w-[600px]">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
                                <tr><th className="p-3">Date</th><th className="p-3">Amount</th><th className="p-3">Method & Ref</th><th className="p-3 text-right">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(project.payments_log || []).length === 0 ? (
                                    <tr><td colSpan="4" className="py-8 text-center text-gray-400 italic">No payments logged.</td></tr>
                                ) : (
                                    // Sort receipts latest first
                                    [...project.payments_log].sort((a,b)=>new Date(b.date) - new Date(a.date)).map(p => (
                                        <tr key={p.id} className="hover:bg-gray-50 transition">
                                            <td className="p-3 font-bold text-gray-900">{p.date}</td>
                                            <td className="p-3 font-bold text-emerald-600">₹ {Number(p.amount).toLocaleString('en-IN')}</td>
                                            <td className="p-3"><span className="font-semibold">{p.method}</span> <span className="text-gray-400 font-mono">({p.reference || "N/A"})</span></td>
                                            <td className="p-3 text-right"><button onClick={() => deletePayment(p.id)} className="text-red-500 text-[10px] font-bold hover:underline">Reverse</button></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 5: MASTER CONTRACT */}
            {activeTab === "master" && (
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm max-w-md animate-in fade-in">
                    <h3 className="text-xs font-bold text-[#000F1B] mb-3 uppercase tracking-wider">Base Contract Value</h3>
                    <div className="space-y-3 text-xs">
                        <div>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Contract Amount (₹)</label>
                            <input type="number" value={contractValue} onChange={e => setContractValue(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg font-black text-lg text-[#000F1B] outline-none focus:border-[#FF5A00]" />
                        </div>
                        <button onClick={saveBaseSettings} disabled={savingSettings} className="w-full bg-[#000F1B] hover:bg-[#FF5A00] text-white font-bold py-2.5 rounded-lg transition text-xs shadow-sm">
                            {savingSettings ? "Updating..." : "Update Base Contract"}
                        </button>
                    </div>
                </div>
            )}

            {/* TAB 6: INVOICE SETTINGS */}
            {activeTab === "settings" && (
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm max-w-2xl animate-in fade-in">
                    <div className="mb-4 border-b border-gray-100 pb-3">
                        <h3 className="text-sm font-bold text-[#000F1B] mb-1">PDF Invoice Branding & Settings</h3>
                        <p className="text-[10px] text-gray-500">Update the bank details, terms, and tax percentages that appear on automatically generated PDF invoices.</p>
                    </div>

                    <div className="space-y-4 text-xs">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Applicable GST (%)</label>
                            <input type="number" value={invoiceSettings.invoice_gst_percent} onChange={e => setInvoiceSettings({ ...invoiceSettings, invoice_gst_percent: e.target.value })} className="w-full sm:w-32 p-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#FF5A00] bg-white font-bold" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Bank Account Details (Visible on PDF)</label>
                            <textarea rows="4" value={invoiceSettings.invoice_bank_details} onChange={e => setInvoiceSettings({ ...invoiceSettings, invoice_bank_details: e.target.value })} className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#FF5A00] bg-white font-mono leading-relaxed" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Footer Notes / Terms</label>
                            <textarea rows="2" value={invoiceSettings.invoice_footer_notes} onChange={e => setInvoiceSettings({ ...invoiceSettings, invoice_footer_notes: e.target.value })} className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#FF5A00] bg-white" />
                        </div>
                        <div className="pt-2">
                            <button onClick={saveInvoiceSettings} disabled={savingSettings} className="bg-[#1A73E8] hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition shadow-sm flex items-center justify-center gap-1.5">
                                {savingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                Save Invoice Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
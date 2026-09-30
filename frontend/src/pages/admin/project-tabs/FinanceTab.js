import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, IndianRupee } from "lucide-react";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000") + "/api";
const api = axios.create({ baseURL: API_BASE, withCredentials: true });

export default function FinanceTab({ project, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  
  const [form, setForm] = useState({
    title: project.title || "", address: project.address || "",
    contract_value: project.contract_value || 0
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: "", date: new Date().toISOString().split("T")[0], method: "Bank Transfer", reference: "", notes: ""
  });

  const saveBaseSettings = async () => {
    setSavingSettings(true);
    try {
      await api.put(`/admin/projects/${project.id}`, { title: form.title, address: form.address, contract_value: Number(form.contract_value) || 0 });
      toast.success("Project settings updated"); 
      onSaved();
    } catch { toast.error("Update failed"); } finally { setSavingSettings(false); }
  };

  const savePayment = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post(`/admin/projects/${project.id}/payments`, {
        amount: Number(paymentForm.amount), date: paymentForm.date,
        method: paymentForm.method, reference: paymentForm.reference, notes: paymentForm.notes
      });
      toast.success("Payment logged & Client notified!");
      setPaymentForm({ amount: "", date: new Date().toISOString().split("T")[0], method: "Bank Transfer", reference: "", notes: "" });
      onSaved();
    } catch (err) { toast.error(err?.response?.data?.detail || "Failed to log payment"); }
    finally { setLoading(false); }
  };

  const deletePayment = async (payId) => {
    if (!window.confirm("Reverse this payment? This will deduct the amount from the Total Paid.")) return;
    try { await api.delete(`/admin/projects/${project.id}/payments/${payId}`); toast.success("Payment reversed"); onSaved(); }
    catch { toast.error("Failed to reverse payment"); }
  };

  const contractValue = project.contract_value || 0;
  const amountPaid = project.amount_spent || 0;
  const balance = contractValue - amountPaid;
  const payments = project.payments_log || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-black/5 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#000F1B] mb-4">Master Contract Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Total Contract Value (₹)</label>
              <input type="number" value={form.contract_value} onChange={e => setForm({ ...form, contract_value: e.target.value })} className="w-full px-3 py-2 border rounded-xl font-bold text-[#10B981] outline-none focus:ring-2 focus:ring-[#10B981]" />
            </div>
            <button onClick={saveBaseSettings} disabled={savingSettings} className="w-full bg-[#000F1B] hover:bg-[#FF5A00] text-white rounded-xl py-2.5 text-xs font-bold transition">
              {savingSettings ? "Saving..." : "Update Contract Value"}
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#000F1B] to-[#0a1a2e] text-white rounded-xl border border-black/5 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#FF5A00]" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-6">Financial Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-white/10 pb-3">
                <span className="text-sm font-semibold text-white/70">Contract Value</span>
                <span className="text-xl font-bold text-white">₹ {contractValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-end border-b border-white/10 pb-3">
                <span className="text-sm font-semibold text-white/70">Total Paid by Client</span>
                <span className="text-xl font-bold text-[#FF5A00]">₹ {amountPaid.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-end pt-2">
                <span className="text-sm font-semibold text-emerald-400">Balance Due</span>
                <span className="text-2xl font-black text-emerald-400">₹ {balance.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-black/5 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-[#000F1B] mb-4">Log New Client Payment</h3>
        <form onSubmit={savePayment} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1 text-emerald-600">Amount Received (₹) *</label>
            <input type="number" required value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} className="w-full px-3 py-2 border border-emerald-200 bg-emerald-50 rounded-xl font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1">Date *</label>
            <input type="date" required value={paymentForm.date} onChange={e => setPaymentForm({ ...paymentForm, date: e.target.value })} className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#FF5A00]" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1">Method *</label>
            <select value={paymentForm.method} onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })} className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#FF5A00]">
              <option>Bank Transfer</option><option>UPI</option><option>Cheque</option><option>Cash</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1">Txn / Ref No.</label>
            <input type="text" value={paymentForm.reference} onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })} className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#FF5A00]" placeholder="e.g. UTR12345" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#10B981] hover:bg-emerald-600 text-white rounded-xl py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <IndianRupee className="w-4 h-4" />} Log Receipt
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-black/5 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-black/5 bg-[#F9FAFB]"><h3 className="text-sm font-bold text-[#000F1B]">Payment History Log</h3></div>
        {payments.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#111111]/50 italic">No payments logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-[10px] uppercase tracking-wider font-bold text-[#111111]/50 border-b border-black/5">
                <tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Method & Ref</th><th className="px-5 py-3 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-[#F2F2F2]/50 transition">
                    <td className="px-5 py-3 font-semibold text-[#000F1B]">{new Date(p.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-5 py-3 font-bold text-[#10B981]">₹ {p.amount.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-[#000F1B]">{p.method}</div>
                      <div className="text-[10px] text-[#111111]/50 font-mono mt-0.5">{p.reference || "No ref"}</div>
                    </td>
                    <td className="px-5 py-3 text-right"><button onClick={() => deletePayment(p.id)} className="text-[10px] font-bold text-red-500 hover:text-red-700 transition">Reverse Payment</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
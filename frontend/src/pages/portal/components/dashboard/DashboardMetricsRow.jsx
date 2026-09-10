import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, IndianRupee, Package, Users, Activity } from "lucide-react";

export default function DashboardMetricsRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricsPlaceholder title="Cost Tracking" icon={IndianRupee} link="/portal/payments" desc="Financial modules syncing..." />
      <MetricsPlaceholder title="Material Status" icon={Package} link="/portal/materials" desc="Procurement data syncing..." />
      <MetricsPlaceholder title="Site Team" icon={Users} link="/portal/team" desc="Team assignment pending..." />
      <MetricsPlaceholder title="Recent Updates" icon={Activity} link="/portal/site-reports" desc="Daily site logs syncing..." />
    </div>
  );
}

function MetricsPlaceholder({ title, icon: Icon, link, desc }) {
  return (
    <div className="rounded-2xl bg-white border border-black/5 p-5 shadow-sm flex flex-col h-[180px]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-[#000F1B]">{title}</h2>
        <Link to={link} className="text-[10px] font-semibold text-[#111111]/50 hover:text-[#FF5A00]">
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full bg-[#F2F2F2] grid place-items-center mb-2">
          <Icon className="w-5 h-5 text-[#111111]/30" />
        </div>
        <div className="text-[10px] text-[#111111]/50 font-medium">{desc}</div>
      </div>
    </div>
  );
}
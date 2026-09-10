import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, IndianRupee, Package, Users, Activity, MessageCircle, User } from "lucide-react";
import { resolveMediaUrl } from "../../../../lib/mediaUrl";

export default function DashboardMetricsRow({ project }) {
  const team = project?.team || [];
  const displayTeam = team.slice(0, 2);
  const remainingCount = team.length > 2 ? team.length - 2 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-['Poppins']">
      <MetricsPlaceholder title="Cost Tracking" icon={IndianRupee} link="/portal/payments" desc="Financial modules syncing..." />
      <MetricsPlaceholder title="Material Status" icon={Package} link="/portal/materials" desc="Procurement data syncing..." />
      
      {/* Site Team Card — Live assigned project team (Max 2 displayed) */}
      <div className="rounded-2xl bg-white border border-black/5 p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#000F1B]">Site Team</h2>
            <Link to="/portal/team" className="text-[10px] font-semibold text-[#111111]/50 hover:text-[#FF5A00] flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {team.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-6">
              <div className="w-9 h-9 rounded-full bg-[#F2F2F2] grid place-items-center mb-1.5">
                <Users className="w-4 h-4 text-[#111111]/30" />
              </div>
              <div className="text-[10px] text-[#111111]/50 font-medium">Team assignment pending...</div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {displayTeam.map((member) => (
                <TeamRow key={member.id || member.name} member={member} />
              ))}
            </div>
          )}
        </div>

        {team.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-black/5 flex items-center justify-between text-[10px]">
            <span className="text-[#111111]/50 font-medium">
              {remainingCount > 0 
                ? `+${remainingCount} more member${remainingCount > 1 ? 's' : ''}` 
                : `${team.length} member${team.length > 1 ? 's' : ''} assigned`}
            </span>
            <Link to="/portal/team" className="font-bold text-[#FF5A00] hover:underline">
              Team Page &rarr;
            </Link>
          </div>
        )}
      </div>

      <MetricsPlaceholder title="Recent Updates" icon={Activity} link="/portal/site-reports" desc="Daily site logs syncing..." />
    </div>
  );
}

function TeamRow({ member }) {
  const cleanPhone = (member.whatsapp || member.phone || "").replace(/[^\d]/g, "");
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  return (
    <div className="flex items-center justify-between group py-0.5">
      <div className="flex items-center gap-2.5 min-w-0">
        {member.photo ? (
          <img
            src={resolveMediaUrl(member.photo)}
            alt={member.name}
            className="w-8 h-8 rounded-full object-cover border border-black/10 shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#000F1B] text-white text-[10px] font-bold grid place-items-center shrink-0">
            <User className="w-4 h-4 text-white/70" />
          </div>
        )}
        <div className="min-w-0">
          <div className="text-[10px] text-[#111111]/50 font-semibold leading-tight truncate">
            {member.designation || member.role || "Team Member"}
          </div>
          <div className="text-xs font-bold text-[#000F1B] truncate">{member.name}</div>
        </div>
      </div>

      {waUrl && (
        <a
          href={waUrl}
          target="_blank"
          rel="noreferrer"
          className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center hover:bg-emerald-600 hover:text-white transition shrink-0 ml-2"
          title={`Chat with ${member.name} on WhatsApp`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
        </a>
      )}
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
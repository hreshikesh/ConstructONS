import React from "react";
import {
  Home,
  MapPin,
  Package,
  Hash,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Crown,
} from "lucide-react";
import { usePortal } from "../context/PortalContext";
import ComingSoon from "../components/ComingSoon";
import { resolveMediaUrl } from "@/lib/mediaUrl";

export default function MyProjectPage() {
  const { user, project } = usePortal();

  if (!project) return <ComingSoon title="My Project" icon={Home} />;

  // Full location (Phase 1 fields)
  const fullLocation =
    [
      project.address,
      project.city,
      project.state,
      project.pincode ? `– ${project.pincode}` : "",
    ]
      .filter(Boolean)
      .join(", ") || "Pending Address";

  // ★ THE ONE Project Manager
  // Prefer backend-enriched `project.manager`, else fall back from team list
  const manager =
    project.manager ||
    (project.team || []).find(
      (m) => m.is_core && m.id === project.manager_id
    ) ||
    null;

  // Working team = core staff EXCEPT the manager
  const workingTeam = (project.team || []).filter(
    (m) => m.is_core && m.id !== project.manager_id
  );

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-['Poppins'] pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-[#000F1B] grid place-items-center shrink-0">
          <Home className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#000F1B] tracking-tight">
            Master Project Profile
          </h1>
          <p className="text-sm text-[#111111]/60 mt-0.5">
            Core details, location, and your dedicated ConstructONS manager.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Identity */}
        <div className="rounded-2xl bg-white border border-black/5 p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-[#000F1B] border-b border-black/5 pb-3">
            Project Identity
          </h2>

          <InfoRow icon={Home} label="Project Name" value={project.title || "Unknown"} />
          <InfoRow
            icon={Hash}
            label="Project Code"
            value={project.project_code || project.id || "Pending"}
            isMono
          />
          <InfoRow icon={MapPin} label="Full Location" value={fullLocation} />
          <InfoRow
            icon={Package}
            label="Package Linked"
            value={project.package_slug || "None"}
          />
        </div>

        {/* Client & Status + Dates */}
        <div className="rounded-2xl bg-white border border-black/5 p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-[#000F1B] border-b border-black/5 pb-3">
            Client & Timeline
          </h2>

          <InfoRow
            icon={User}
            label="Primary Client"
            value={user?.name || project.customer_name || "Unknown"}
          />
          <InfoRow
            icon={Mail}
            label="Registered Email"
            value={user?.email || project.customer_email || "Unknown"}
          />

          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#111111]/50 font-semibold mb-1">
              Status
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#10B981]/10 text-[#10B981] text-xs font-bold uppercase tracking-wider">
              {project.status || "Active"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-black/5">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-[#111111]/45 font-bold">
                Start
              </div>
              <div className="text-xs font-bold text-[#000F1B] mt-0.5">
                {fmtDate(project.start_date || project.created_at)}
              </div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-[#111111]/45 font-bold">
                Forecast End
              </div>
              <div className="text-xs font-bold text-[#000F1B] mt-0.5">
                {fmtDate(project.expected_completion)}
              </div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-[#111111]/45 font-bold">
                Agreed Date
              </div>
              <div className="text-xs font-bold text-[#000F1B] mt-0.5">
                {fmtDate(project.project_agreed_date)}
              </div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-[#111111]/45 font-bold">
                Actual Handover
              </div>
              <div className="text-xs font-bold text-[#000F1B] mt-0.5">
                {fmtDate(project.actual_completion_date)}
              </div>
            </div>
          </div>
        </div>

        {/* ★ THE ONE PROJECT MANAGER — highlighted card */}
        <div className="md:col-span-2 rounded-2xl bg-white border border-black/5 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-[#000F1B] border-b border-black/5 pb-3 flex items-center gap-2 mb-4">
            <Crown className="w-4 h-4 text-[#FF6600]" />
            Your Dedicated Project Manager
          </h2>

          {manager ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border border-[#FF6600]/25 bg-gradient-to-br from-[#FF6600]/5 to-amber-50/40">
              {manager.photo ? (
                <img
                  src={resolveMediaUrl(manager.photo)}
                  alt={manager.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#FF6600] shadow-sm shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#FF6600] text-white grid place-items-center shrink-0 shadow-sm">
                  <Crown className="w-7 h-7" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="font-bold text-lg text-[#000F1B] truncate">
                  {manager.name}
                </div>
                <div className="text-[11px] font-bold text-[#FF6600] uppercase tracking-wider mt-0.5">
                  {manager.role || "Project Manager"}
                </div>
                <p className="text-[11px] text-gray-600 mt-1.5 max-w-xl">
                  This is your primary ConstructONS contact for site updates,
                  approvals, and project decisions.
                </p>

                <div className="flex flex-wrap gap-3 mt-3">
                  {manager.email && (
                    <a
                      href={`mailto:${manager.email}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#000F1B] bg-white border border-black/10 px-3 py-1.5 rounded-lg hover:border-[#FF6600] transition"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#FF6600]" />
                      {manager.email}
                    </a>
                  )}
                  {(manager.contact || manager.whatsapp) && (
                    <a
                      href={`tel:${manager.contact || manager.whatsapp}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#000F1B] bg-white border border-black/10 px-3 py-1.5 rounded-lg hover:border-[#FF6600] transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#FF6600]" />
                      {manager.contact || manager.whatsapp}
                    </a>
                  )}
                </div>
              </div>

              <div className="hidden sm:flex flex-col items-center gap-1 px-3">
                <ShieldCheck className="w-8 h-8 text-[#FF6600]/80" />
                <span className="text-[9px] font-bold uppercase text-[#FF6600] tracking-wider">
                  Primary PM
                </span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center rounded-xl border border-dashed border-black/10 bg-[#F9FAFB]">
              <Crown className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-500">
                Project Manager will be assigned shortly
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                ConstructONS will appoint a dedicated manager for your site.
              </p>
            </div>
          )}

          {/* Supporting on-site team (not the manager) */}
          {workingTeam.length > 0 && (
            <div className="mt-6 pt-4 border-t border-black/5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                On-Site Working Team
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {workingTeam.map((staff) => (
                  <div
                    key={staff.id}
                    className="p-3 rounded-xl border border-black/5 bg-[#F9FAFB] flex items-center gap-3"
                  >
                    {staff.photo ? (
                      <img
                        src={resolveMediaUrl(staff.photo)}
                        alt={staff.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#000F1B] text-white grid place-items-center shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-[#000F1B] truncate">
                        {staff.name}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate">
                        {staff.role}
                      </div>
                      {staff.email && (
                        <div className="text-[9px] text-[#FF6600] truncate mt-0.5">
                          {staff.email}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, isMono = false }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-[#111111]/40 mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider text-[#111111]/50 font-semibold">
          {label}
        </div>
        <div
          className={`text-sm font-semibold text-[#000F1B] mt-0.5 leading-snug ${
            isMono ? "font-mono text-xs" : ""
          }`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { Menu, Search, Bell, LogOut, MapPin, X } from "lucide-react";
import { usePortal } from "../context/PortalContext";

export default function PortalTopBar() {
  const { user, project, logout, setSidebarOpen } = usePortal();
  const [searchQuery, setSearchQuery] = useState("");

  const projectTitle = project?.title || project?.name || "My Project";
  const projectLocation = project?.address || project?.location || project?.city || "Awaiting Location";
  const projectId = project?.project_id || project?.ref_number || project?.id;

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  // Function to handle future global search
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    console.log("Searching for:", searchQuery);
    // TODO: Connect this to global search endpoint once backend is ready
  };

  return (
    <header className="h-16 bg-white border-b border-black/5 sticky top-0 z-30 shrink-0">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-10 h-10 rounded-xl grid place-items-center hover:bg-[#F2F2F2] text-[#000F1B] min-h-[44px]"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Active Project Chip */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#F2F2F2]/80 border border-black/5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#000F1B] grid place-items-center shrink-0 overflow-hidden">
              {project?.cover_image || project?.image ? (
                <img src={project.cover_image || project.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold text-[#FF5A00]">CO</span>
              )}
            </div>
            <div className="min-w-0 text-left">
              <div className="text-xs font-bold text-[#000F1B] truncate max-w-[160px] lg:max-w-[220px]">
                {projectTitle}
              </div>
              <div className="text-[10px] text-[#111111]/50 flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{projectLocation}</span>
              </div>
            </div>
            {projectId && (
              <span className="hidden lg:inline text-[9px] font-mono text-[#111111]/40 border-l border-black/10 pl-2 ml-1">
                {String(projectId).slice(0, 16)}
              </span>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Working Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 w-48 lg:w-64 focus-within:ring-2 focus-within:ring-[#FF5A00] focus-within:border-[#FF5A00] transition">
            <Search className="w-4 h-4 text-[#111111]/40" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search project..."
              className="bg-transparent outline-none text-xs text-[#000F1B] w-full placeholder:text-[#111111]/40"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} className="text-[#111111]/40 hover:text-[#000F1B]">
                <X className="w-3 h-3" />
              </button>
            )}
          </form>

          <button type="button" className="relative w-10 h-10 rounded-xl grid place-items-center hover:bg-[#F2F2F2] text-[#000F1B] min-h-[44px]">
            <Bell className="w-4.5 h-4.5" />
          </button>

          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-black/5">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name || "User profile"}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border border-black/10 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#000F1B] text-white text-[10px] font-bold grid place-items-center">
                {initials}
              </div>
            )}
            <div className="hidden sm:block text-left leading-tight max-w-[120px]">
              <div className="text-xs font-semibold text-[#000F1B] truncate">{user?.name?.split(" ")[0] || "Client"}</div>
              <div className="text-[10px] text-[#111111]/45 truncate">Client Portal</div>
            </div>
            <button onClick={logout} type="button" className="w-9 h-9 rounded-xl grid place-items-center hover:bg-red-50 text-[#111111]/60 hover:text-[#FF2D00] min-h-[36px]">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
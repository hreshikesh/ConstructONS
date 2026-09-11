import React, { useState, useRef, useEffect } from "react";
import { Menu, Search, Bell, LogOut, MapPin, X, ChevronDown, Check } from "lucide-react";
import { usePortal } from "../context/PortalContext";
import { resolveMediaUrl } from "../../../lib/mediaUrl";

export default function PortalTopBar() {
  const { user, project, projectsList, switchProject, activeProjectId, logout, setSidebarOpen } = usePortal();
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const projectTitle = project?.title || project?.name || "My Project";
  const projectLocation = project?.address || project?.location || project?.city || "Awaiting Location";
  
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  // Handle outside click for dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="h-16 bg-white border-b border-black/5 sticky top-0 z-30 shrink-0 font-['Poppins']">
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

          {/* Active Project Dropdown Trigger */}
          <div className="relative hidden sm:block" ref={dropdownRef}>
            <button 
              onClick={() => projectsList?.length > 1 ? setDropdownOpen(!dropdownOpen) : null}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border min-w-0 transition ${
                projectsList?.length > 1 
                  ? "bg-white border-black/10 hover:bg-[#F2F2F2] cursor-pointer" 
                  : "bg-[#F2F2F2]/80 border-black/5 cursor-default"
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-[#000F1B] grid place-items-center shrink-0 overflow-hidden border border-black/10">
                {project?.cover_image ? (
                  <img src={resolveMediaUrl(project.cover_image)} alt="" className="w-full h-full object-cover" />
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
              {projectsList?.length > 1 && (
                <ChevronDown className={`w-4 h-4 text-[#111111]/40 transition ml-2 ${dropdownOpen ? 'rotate-180' : ''}`} />
              )}
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-black/10 shadow-2xl rounded-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 text-[10px] font-bold text-[#FF5A00] uppercase tracking-wider border-b border-black/5 mb-1">
                  Your Projects ({projectsList.length})
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {projectsList.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        switchProject(p.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#F2F2F2] transition text-left ${p.id === activeProjectId ? 'bg-[#FF5A00]/5' : ''}`}
                    >
                      <div className="min-w-0 pr-3">
                        <div className={`text-xs font-bold truncate ${p.id === activeProjectId ? 'text-[#FF5A00]' : 'text-[#000F1B]'}`}>
                          {p.title || "Unnamed Project"}
                        </div>
                        <div className="text-[10px] text-[#111111]/50 truncate mt-0.5">
                          {p.user_role} • {p.project_code || "Active"}
                        </div>
                      </div>
                      {p.id === activeProjectId && <Check className="w-4 h-4 text-[#FF5A00] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Bar */}
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
              <img src={user.picture} alt="" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full border border-black/10 object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#000F1B] text-white text-[10px] font-bold grid place-items-center">
                {initials}
              </div>
            )}
            <div className="hidden sm:block text-left leading-tight max-w-[120px]">
              <div className="text-xs font-semibold text-[#000F1B] truncate">{user?.name?.split(" ")[0] || "Client"}</div>
              <div className="text-[10px] text-[#111111]/45 truncate">Client Portal</div>
            </div>
            <button onClick={logout} type="button" className="w-9 h-9 rounded-xl grid place-items-center hover:bg-red-50 text-[#111111]/60 hover:text-[#FF2D00] min-h-[36px]" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
import React from "react";
import { Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Toaster } from "sonner";
import { PortalProvider, usePortal } from "./context/PortalContext";
import PortalSidebar from "./components/PortalSidebar";
import PortalTopBar from "./components/PortalTopBar";

function PortalShell() {
  const { loading, sidebarOpen, setSidebarOpen } = usePortal();

  if (loading) {
    return (
      <div className="h-screen w-full grid place-items-center bg-[#F2F2F2] font-['Poppins']">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5A00]" />
          <span className="text-sm font-medium text-[#111111]/70">Loading your project portal...</span>
        </div>
      </div>
    );
  }

  return (
    /* h-screen and overflow-hidden ensures the outer shell never scrolls */
    <div className="h-screen bg-[#F5F6F8] font-['Poppins'] text-[#111111] flex overflow-hidden">
      <Toaster richColors position="top-right" />
      
      {/* Sidebar handles its own fixed/sticky positioning */}
      <PortalSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* TopBar stays sticky at the top */}
        <PortalTopBar />
        
        {/* ONLY this main area scrolls */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function PortalLayout() {
  return (
    <PortalProvider>
      <PortalShell />
    </PortalProvider>
  );
}
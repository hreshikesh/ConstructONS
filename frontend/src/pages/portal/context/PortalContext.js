import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "") + "/api";

const PortalContext = createContext(null);

export function PortalProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const me = await axios.get(`${API_BASE}/customer/me`, { withCredentials: true });
      setUser(me.data);

      try {
        const pr = await axios.get(`${API_BASE}/portal/my-project`, { withCredentials: true });
        const rawProj = pr.data?.project !== undefined ? pr.data.project : pr.data;
        
        // Strict check: Only set project if it contains a valid project ID or title
        if (rawProj && (rawProj.id || rawProj.title || rawProj.project_code)) {
          setProject(rawProj);
        } else {
          setProject(null);
        }
      } catch {
        setProject(null);
      }
    } catch (e) {
      if (e?.response?.status === 401) {
        navigate("/portal/login", { replace: true });
        return;
      }
      toast.error("Failed to load your portal");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const logout = async () => {
    try {
      await axios.post(`${API_BASE}/customer/logout`, {}, { withCredentials: true });
    } catch {}
    navigate("/portal/login", { replace: true });
  };

  const value = {
    user,
    project,
    loading,
    reload: load,
    logout,
    sidebarOpen,
    setSidebarOpen,
  };

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error("usePortal must be used within PortalProvider");
  return ctx;
}
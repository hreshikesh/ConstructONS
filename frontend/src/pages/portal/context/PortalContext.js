import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "") + "/api";

const PortalContext = createContext(null);

export function PortalProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Multiple Projects Support
  const [projectsList, setProjectsList] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(localStorage.getItem("cons_active_project") || null);
  const [project, setProject] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const me = await axios.get(`${API_BASE}/customer/me`, { withCredentials: true });
      setUser(me.data);

      try {
        // 1. Fetch all projects this user has access to
        const listRes = await axios.get(`${API_BASE}/portal/my-projects-list`, { withCredentials: true });
        const list = listRes.data?.projects || [];
        setProjectsList(list);

        // 2. Determine which project to load
        let targetId = activeProjectId;
        if (list.length > 0 && (!targetId || !list.find(p => p.id === targetId))) {
          targetId = list[0].id; // Fallback to first project if stored ID is invalid
          setActiveProjectId(targetId);
          localStorage.setItem("cons_active_project", targetId);
        }

        // 3. Fetch the full active project data
        const url = targetId 
          ? `${API_BASE}/portal/my-project?project_id=${targetId}` 
          : `${API_BASE}/portal/my-project`;
          
        const pr = await axios.get(url, { withCredentials: true });
        const rawProj = pr.data?.project !== undefined ? pr.data.project : pr.data;
        
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
  }, [activeProjectId, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const logout = async () => {
    try {
      localStorage.removeItem("cons_active_project");
      await axios.post(`${API_BASE}/customer/logout`, {}, { withCredentials: true });
    } catch {}
    navigate("/portal/login", { replace: true });
  };

  const switchProject = (id) => {
    setActiveProjectId(id);
    localStorage.setItem("cons_active_project", id);
    // Reload is triggered automatically because load() depends on activeProjectId
  };

  const value = {
    user,
    project,
    projectsList,
    activeProjectId,
    switchProject,
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
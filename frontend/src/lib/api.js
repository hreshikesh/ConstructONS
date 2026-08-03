import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND_URL}/api`;

// httpOnly cookie auth — every request sends the `cons_admin_token` cookie.
// The old localStorage token is scrubbed on first load so any stale session
// is cleaned up automatically.
const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
  withCredentials: true,
});

// One-time migration: remove any legacy JWT that lingered in localStorage from
// before the httpOnly-cookie rollout so an XSS bug can't scrape it.
try {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("cons_admin_token");
  }
} catch (_) { /* SSR / storage-disabled safe */ }

// Global 401 handler — if any admin call ever sees an unauthorised response,
// bounce the user to the login page. Skipped for the public-facing endpoints
// so the homepage doesn't redirect when a leads/subscribe call rate-limits.
const ADMIN_PATH_RE = /^\/(admin|leads$|quiz-submissions|media\/upload|ai\/rewrite|packages\/[^/]+\/versions)/;
api.interceptors.response.use(
  (r) => r,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";
    if (status === 401 && ADMIN_PATH_RE.test(url) && typeof window !== "undefined") {
      const onLoginPage = window.location.pathname.startsWith("/admin/login");
      if (!onLoginPage) {
        // Full-page reload wipes any in-memory state that assumed we were logged in.
        window.location.replace("/admin/login");
      }
    }
    return Promise.reject(error);
  }
);

export const publicApi = {
  bootstrap: () => api.get("/bootstrap").then((r) => r.data),
  getHomes: () => api.get("/homes").then((r) => r.data),
  getHome: (idOrSlug) => api.get(`/homes/${idOrSlug}`).then((r) => r.data),
  getPackages: () => api.get("/packages").then((r) => r.data),
  getPackage: (idOrSlug) => api.get(`/packages/${idOrSlug}`).then((r) => r.data),
  comparePackages: () => api.get("/packages-compare").then((r) => r.data),
  brochureUrl: (slug) => `${API_BASE}/packages/${slug}/brochure.pdf`,
  personalizedBrochure: (slug, payload) =>
    api.post(`/packages/${slug}/brochure`, payload, { responseType: "blob" }).then((r) => ({
      blob: r.data,
      quoteRef: r.headers["x-quote-ref"] || r.headers["X-Quote-Ref"],
      filename:
        (r.headers["content-disposition"] || "").split("filename=")[1]?.replace(/"/g, "") ||
        `ConstructONS-${slug}.pdf`,
    })),
  recommendPackage: (payload) => api.post("/recommend", payload).then((r) => r.data),
  getBlogs: () => api.get("/blogs").then((r) => r.data),
  getBlog: (idOrSlug) => api.get(`/blogs/${idOrSlug}`).then((r) => r.data),
  getFaqs: () => api.get("/faqs").then((r) => r.data),
  getTeam: () => api.get("/team").then((r) => r.data),
  getSiteSettings: () => api.get("/site-settings").then((r) => r.data),
  submitLead: (payload) => api.post("/leads", payload).then((r) => r.data),
};

export const adminApi = {
  login: (email, password) => api.post("/admin/login", { email, password }).then((r) => r.data),
  logout: () => api.post("/admin/logout").then((r) => r.data).catch(() => ({ success: true })),
  me: () => api.get("/admin/me").then((r) => r.data),
  // Generic CRUD helpers
  list: (path) => api.get(`/${path}`).then((r) => r.data),
  get: (path, id) => api.get(`/${path}/${id}`).then((r) => r.data),
  create: (path, body) => api.post(`/${path}`, body).then((r) => r.data),
  update: (path, id, body) => api.put(`/${path}/${id}`, body).then((r) => r.data),
  remove: (path, id) => api.delete(`/${path}/${id}`).then((r) => r.data),
  // Leads
  listLeads: (status) =>
    api.get(`/leads${status ? `?status=${status}` : ""}`).then((r) => r.data),
  updateLead: (id, body) => api.put(`/leads/${id}`, body).then((r) => r.data),
  removeLead: (id) => api.delete(`/leads/${id}`).then((r) => r.data),
  updateSiteSettings: (body) => api.put("/site-settings", body).then((r) => r.data),
  // Quiz submissions
  listQuizSubmissions: (status) =>
    api.get(`/quiz-submissions${status ? `?status=${status}` : ""}`).then((r) => r.data),
  getQuizSubmission: (id) => api.get(`/quiz-submissions/${id}`).then((r) => r.data),
  updateQuizSubmission: (id, body) => api.put(`/quiz-submissions/${id}`, body).then((r) => r.data),
  removeQuizSubmission: (id) => api.delete(`/quiz-submissions/${id}`).then((r) => r.data),

  // Media (Image Upload Studio)
  uploadImage: (file, category = "general", onProgress) => {
    const form = new FormData();
    form.append("file", file);
    form.append("category", category);
    return api
      .post("/media/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      })
      .then((r) => ({
        ...r.data,
        // Absolute URL so <img src> works from any origin
        absoluteUrl: `${BACKEND_URL}${r.data.url}`,
      }));
  },
  listMedia: (category) =>
    api.get(`/media${category ? `?category=${category}` : ""}`).then((r) => r.data),

  // Package version history
  listPackageVersions: (packageId) =>
    api.get(`/packages/${packageId}/versions`).then((r) => r.data),
  getPackageVersion: (packageId, versionId) =>
    api.get(`/packages/${packageId}/versions/${versionId}`).then((r) => r.data),
  restorePackageVersion: (packageId, versionId) =>
    api.post(`/packages/${packageId}/versions/${versionId}/restore`).then((r) => r.data),

  // AI Copy Assist
  rewriteCopy: (text, purpose = "copy", tone = "on-brand") =>
    api.post("/ai/rewrite", { text, purpose, tone }).then((r) => r.data),
};

export default api;

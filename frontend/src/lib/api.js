import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({ baseURL: API_BASE, timeout: 20000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cons_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

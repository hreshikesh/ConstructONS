import React, { Suspense, lazy } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { LeadModalProvider } from "@/components/site/LeadModalProvider";
import { BrochureModalProvider } from "@/components/site/BrochureModalProvider";

const HomePage = lazy(() => import("@/pages/HomePage"));
const HomeDetailPage = lazy(() => import("@/pages/HomeDetailPage"));
const PackagesPage = lazy(() => import("@/pages/PackagesPage"));
const PackageDetailPage = lazy(() => import("@/pages/PackageDetailPage"));
const PackagesComparePage = lazy(() => import("@/pages/PackagesComparePage"));
const FindMyPackagePage = lazy(() => import("@/pages/FindMyPackagePage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const BlogListPage = lazy(() => import("@/pages/BlogListPage"));
const BlogDetailPage = lazy(() => import("@/pages/BlogDetailPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const AdminLoginPage = lazy(() => import("@/pages/admin/AdminLoginPage"));
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminLeads = lazy(() => import("@/pages/admin/AdminLeads"));
const AdminEntity = lazy(() => import("@/pages/admin/AdminEntity"));
const AdminSiteSettings = lazy(() => import("@/pages/admin/AdminSiteSettings"));
const AdminQuizSubmissions = lazy(() => import("@/pages/admin/AdminQuizSubmissions"));
const AdminPackages = lazy(() => import("@/pages/admin/AdminPackages"));
const AdminProposals = lazy(() => import("@/pages/admin/AdminProposals"));
const AdminCustomQuotes = lazy(() => import("@/pages/admin/AdminCustomQuotes"));
const AdminQuoteTemplates = lazy(() => import("@/pages/admin/AdminQuoteTemplates"));
const PublicQuotePage = lazy(() => import("@/pages/PublicQuotePage"));

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-brand-orange border-t-transparent animate-spin" />
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <LeadModalProvider>
          <BrochureModalProvider>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/homes/:slug" element={<HomeDetailPage />} />
                <Route path="/packages" element={<PackagesPage />} />
                <Route path="/packages/compare" element={<PackagesComparePage />} />
                <Route path="/packages/:slug" element={<PackageDetailPage />} />
                <Route path="/find-my-package" element={<FindMyPackagePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/blog" element={<BlogListPage />} />
                <Route path="/blog/:slug" element={<BlogDetailPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/quote/:token" element={<PublicQuotePage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="leads" element={<AdminLeads />} />
                  <Route path="quiz-submissions" element={<AdminQuizSubmissions />} />
                  <Route path="site-settings" element={<AdminSiteSettings />} />
                  <Route path="packages" element={<AdminPackages />} />
                  <Route path="proposals" element={<AdminProposals />} />
                  <Route path="custom-quotes" element={<AdminCustomQuotes />} />
                  <Route path="quote-templates" element={<AdminQuoteTemplates />} />
                  <Route path=":entity" element={<AdminEntity />} />
                </Route>
              </Routes>
            </Suspense>
            <Toaster position="top-right" richColors closeButton />
          </BrochureModalProvider>
        </LeadModalProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;

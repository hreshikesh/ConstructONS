import React, { Suspense, lazy } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { motion } from "framer-motion";
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
const AdminProjects = lazy(() => import("@/pages/admin/AdminProjects"));
const PublicQuotePage = lazy(() => import("@/pages/PublicQuotePage"));
const PortalLogin = lazy(() => import("@/pages/portal/PortalLogin"));
const PortalHome = lazy(() => import("@/pages/portal/PortalHome"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
function PageFallback() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#000F1B] selection:bg-[#FF5A00] selection:text-white font-['Poppins',sans-serif]">
      {/* Background Glow */}
      <div className="absolute h-72 w-72 rounded-full bg-[#FF5A00]/15 blur-3xl pointer-events-none" />

      {/* Animated Construction Logo */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative h-24 w-24">
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
          >
            {/* Ground Baseline */}
            <motion.path
              d="M10 85 H90"
              stroke="#ffffff"
              strokeOpacity="0.2"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Building / House Outline */}
            <motion.path
              d="M20 85 V45 L50 20 L80 45 V85 H20 Z"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />

            {/* Structural Inner Beams */}
            <motion.path
              d="M50 20 V85 M20 55 H80 M35 85 V55 M65 85 V55"
              stroke="#FF5A00"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 1.5,
                delay: 0.3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />

            {/* Construction Crane Arm Placement */}
            <motion.path
              d="M50 20 L50 8 L75 8"
              stroke="#FF5A00"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                repeatType: "loop",
                repeatDelay: 0.5,
                ease: "easeInOut",
              }}
            />

            {/* Crane Hook Block */}
            <motion.circle
              cx="75"
              cy="16"
              r="3"
              fill="#FF5A00"
              animate={{ y: [0, 6, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </svg>
        </div>

        {/* Loading Text & Shimmer Bar */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/80"
          >
            ConstructONS
          </motion.span>

          {/* Progress Bar */}
          <div className="h-1 w-32 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-[#FF5A00]"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>
      </div>
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
                <Route path="/portal/login" element={<PortalLogin />} />
                <Route path="/portal" element={<PortalHome />} />
                <Route path="*" element={<NotFoundPage />} />
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
                  <Route path="projects" element={<AdminProjects />} />
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
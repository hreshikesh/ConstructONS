import React, { Suspense, lazy, useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { LeadModalProvider } from "@/components/site/LeadModalProvider";
import { BrochureModalProvider } from "@/components/site/BrochureModalProvider";
import CookieBanner from "./components/site/CookieBanner";
import PublicAIChat from "@/components/site/PublicAIChat";

// Lazy-loaded Public Pages
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
const PublicQuotePage = lazy(() => import("@/pages/PublicQuotePage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

// Lazy-loaded Portal
const PortalLogin = lazy(() => import("@/pages/portal/PortalLogin"));
const PortalLayout = lazy(() => import("@/pages/portal/PortalLayout"));
const DashboardPage = lazy(() => import("@/pages/portal/pages/DashboardPage"));
const MyProjectPage = lazy(() => import("@/pages/portal/pages/MyProjectPage"));
const LiveCCTVPage = lazy(() => import("@/pages/portal/pages/LiveCCTVPage"));
const ProgressPage = lazy(() => import("@/pages/portal/pages/ProgressPage"));
const TimelinePage = lazy(() => import("@/pages/portal/pages/TimelinePage"));
const DrawingsPage = lazy(() => import("@/pages/portal/pages/DrawingsPage"));
const MaterialsPage = lazy(() => import("@/pages/portal/pages/MaterialsPage"));
const QualityPage = lazy(() => import("@/pages/portal/pages/QualityPage"));
const DocumentsPage = lazy(() => import("@/pages/portal/pages/DocumentsPage"));
const PaymentsPage = lazy(() => import("@/pages/portal/pages/PaymentsPage"));
const TeamPage = lazy(() => import("@/pages/portal/pages/TeamPage"));
const ApprovalsPage = lazy(() => import("@/pages/portal/pages/ApprovalsPage"));
const MessagesPage = lazy(() => import("@/pages/portal/pages/MessagesPage"));
const SiteReportsPage = lazy(() => import("@/pages/portal/pages/SiteReportsPage"));
const MaintenancePage = lazy(() => import("@/pages/portal/pages/MaintenancePage"));
const SettingsPage = lazy(() => import("@/pages/portal/pages/SettingsPage"));

// Lazy-loaded Admin
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
const AdminClientUsers = lazy(() => import("@/pages/admin/AdminClientUsers"));

/* =========================================================================
   STORYTELLING LOADER DATA & COMPONENT
   ========================================================================= */
const STORY_SCENES = [
  {
    id: 1,
    text: "Planning with clarity...",
    icon: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <motion.path d="M20 20 H80 M20 40 H80 M20 60 H80 M20 80 H80 M20 20 V80 M40 20 V80 M60 20 V80 M80 20 V80" stroke="#FFFFFF" strokeOpacity="0.1" strokeWidth="1" />
        <motion.path d="M50 20 L35 70 H65 Z" stroke="#FF5A00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: "easeInOut" }} />
        <motion.circle cx="50" cy="20" r="4" fill="#FF5A00" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} />
        <motion.path d="M35 70 Q50 80 65 70" stroke="#FF5A00" strokeWidth="2" strokeDasharray="4 4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} />
      </svg>
    )
  },
  {
    id: 2,
    text: "Building with quality...",
    icon: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <motion.path d="M20 90 V20 L60 10 M20 40 L50 30" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <motion.path d="M60 10 V40" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="3 3" initial={{ y: -15 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} />
        <motion.path d="M45 40 H75" stroke="#FF5A00" strokeWidth="6" strokeLinecap="round" initial={{ y: -15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} />
        <motion.path d="M30 85 H70 M35 75 H65" stroke="#FF5A00" strokeWidth="6" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 3,
    text: "Your dream home is arriving...",
    icon: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <motion.path d="M15 50 L50 20 L85 50 V85 H15 Z" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: "easeInOut" }} />
        <motion.path d="M40 55 L50 65 L65 40" stroke="#FF5A00" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.4, ease: "easeOut" }} />
      </svg>
    )
  }
];

function InitialSplashLoader({ onComplete }) {
  const [scene, setScene] = useState(0);

  useEffect(() => {
    // 1.4s per scene x 3 scenes = 4.2s total story duration
    const sceneTimer = setInterval(() => {
      setScene((prev) => {
        if (prev < STORY_SCENES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1400);

    // End loader after full story completes (~4.5s)
    const endTimer = setTimeout(() => {
      onComplete();
    }, 4500);

    return () => {
      clearInterval(sceneTimer);
      clearTimeout(endTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#000F1B] font-['Poppins',sans-serif] select-none"
    >
      <div className="absolute h-96 w-96 rounded-full bg-[#FF5A00]/15 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Animated Icon Container */}
        <div className="relative h-28 w-28 mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={scene}
              initial={{ opacity: 0, scale: 0.85, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -12 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0"
            >
              {STORY_SCENES[scene].icon}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Story Text */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="text-sm font-bold tracking-tight text-white mb-2">
            Construct<span className="text-[#FF5A00]">ONS™</span>
          </div>
          
          <div className="h-6 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={scene}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-xs font-semibold text-white/80 tracking-wider uppercase"
              >
                {STORY_SCENES[scene].text}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress Indicator */}
          <div className="mt-5 flex gap-1.5">
            {STORY_SCENES.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === scene ? "w-8 bg-[#FF5A00]" : "w-2 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PageFallback() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000F1B] text-white text-xs font-semibold tracking-wider uppercase">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#FF5A00] animate-ping" />
        Loading...
      </div>
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div className="App font-['Poppins',sans-serif] text-[#111111] bg-white antialiased min-h-screen flex flex-col selection:bg-[#FF5A00]/20 selection:text-[#000F1B]">
      
      {/* 🎬 Full Storytelling Splash Screen on App Mount */}
      <AnimatePresence>
        {showSplash && (
          <InitialSplashLoader onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      <BrowserRouter>
        <LeadModalProvider>
          <BrochureModalProvider>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Public */}
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

                {/* Customer Portal */}
                <Route path="/portal/login" element={<PortalLogin />} />
                <Route path="/portal" element={<PortalLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="my-project" element={<MyProjectPage />} />
                  <Route path="cctv" element={<LiveCCTVPage />} />
                  <Route path="progress" element={<ProgressPage />} />
                  <Route path="timeline" element={<TimelinePage />} />
                  <Route path="drawings" element={<DrawingsPage />} />
                  <Route path="materials" element={<MaterialsPage />} />
                  <Route path="quality" element={<QualityPage />} />
                  <Route path="documents" element={<DocumentsPage />} />
                  <Route path="payments" element={<PaymentsPage />} />
                  <Route path="team" element={<TeamPage />} />
                  <Route path="approvals" element={<ApprovalsPage />} />
                  <Route path="messages" element={<MessagesPage />} />
                  <Route path="site-reports" element={<SiteReportsPage />} />
                  <Route path="maintenance" element={<MaintenancePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Admin */}
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
                  <Route path="client-users" element={<AdminClientUsers />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>

            {/* AI Assistant */}
            <PublicAIChat />

            <CookieBanner />
            <Toaster position="top-right" richColors closeButton />
          </BrochureModalProvider>
        </LeadModalProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
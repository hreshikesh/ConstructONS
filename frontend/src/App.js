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
   ANIMATED VISUAL VECTOR SEQUENCE (DYNAMIC MOTION)
   1. Animated Working Man (Hammering & Spark action)
   2. Animated Excavator (Digging & Pivoting arm)
   3. Animated Crane (Hook lifting & Cable action)
   4. Animated Building Under Construction (Sequential line-drawing)
   5. Animated Completed Building (Spring pop & glowing window lights)
   ========================================================================= */

// 1. Man Working (Animated Body & Working Motion)
const WorkerSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-[#FF5A00] fill-current">
    {/* Body Bouncing Motion */}
    <motion.g
      animate={{ y: [0, -3, 0, -2, 0], rotate: [0, -2, 2, 0] }}
      transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
    >
      <path d="M45.1,43c0.6,0,1-0.4,1-1c0-2.2-1.8-4-4-4s-4,1.8-4,4c0,0.6,0.4,1,1,1s1-0.4,1-1c0-1.1,0.9-2,2-2s2,0.9,2,2C44.1,42.6,44.6,43,45.1,43z" />
      <path d="M56,50.4c0.2-0.5,0-1.1-0.4-1.3c-0.5-0.2-1.1,0-1.3,0.4c-0.8,1.5-2.3,2.4-4.1,2.4s-3.4-0.9-4.1-2.4c-0.2-0.5-0.8-0.7-1.3-0.4c-0.5,0.2-0.7,0.8-0.4,1.3c1.1,2.2,3.4,3.6,5.9,3.6S54.9,52.6,56,50.4z" />
      <path d="M55.1,43c0.6,0,1-0.4,1-1c0-1.1,0.9-2,2-2s2,0.9,2,2c0,0.6,0.4,1,1,1s1-0.4,1-1c0-2.2-1.8-4-4-4s-4,1.8-4,4C54.1,42.6,54.6,43,55.1,43z" />
      <path d="M89.4,80.5c-0.9-5.1-4.7-9.1-9.8-10.2l-21.6-5V60l0,0c5.4-2.9,9-8.5,9-15h1c2.8,0,5-2.2,5-5c0-1.3-0.5-2.5-1.3-3.4C73,36,74,34.6,74,33c0-1.9-1.3-3.4-3-3.9v-3c0-5.3-2.2-10.3-6-13.9V9c0-1.7-1.3-3-3-3c-1.4,0-2.6,1-2.9,2.4c-1.6-0.6-3.3-1.1-5.1-1.2V7c0-1.7-1.3-3-3-3h-2c-1.7,0-3,1.3-3,3v0.2c-1.7,0.2-3.4,0.6-5.1,1.3C40.7,7.1,39.5,6,38,6c-1.7,0-3,1.3-3,3v3.2c-3.8,3.6-6,8.6-6,13.9v3c-1.7,0.4-3,2-3,3.9c0,1.6,1,3,2.3,3.6C27.5,37.5,27,38.7,27,40c0,2.8,2.2,5,5,5h1c0,6.5,3.7,12.1,9,15l0,0v5.2l-21.6,5c-5,1.2-8.8,5.2-9.8,10.2L8,94.8c-0.1,0.3,0,0.6,0.2,0.8C8.4,95.9,8.7,96,9,96h19h16h6h6h16h19c0.3,0,0.6-0.1,0.8-0.4c0.2-0.2,0.3-0.5,0.2-0.8L89.4,80.5z M72,90H56c-0.6,0-1,0.4-1,1v3h-4v-7c8.9-0.2,18-3.4,18-10v-7.2l8,1.9V94h-4v-3C73,90.4,72.6,90,72,90z M44,90H28c-0.6,0-1,0.4-1,1v3h-4V71.7l8-1.9V77c0,3.2,2.2,5.9,6.2,7.7c3.2,1.4,7.3,2.2,11.8,2.3v7h-4v-3C45,90.4,44.6,90,44,90z M44.7,69.9C46.1,70.6,48,71,50,71c3.4,0,7-1.2,7.8-3.8L61,68l0,0c0,3.9-5.5,6-11,6s-11-2.1-11-6l0,0l3.2-0.7C42.6,68.3,43.4,69.2,44.7,69.9z M41.3,74.1c2.3,1.2,5.4,1.9,8.7,1.9c6.1,0,12.6-2.4,13-7.6l4,0.9V77c0,5.3-8.6,8-17,8s-17-2.7-17-8v-7.6l4-0.9C37.2,70.8,38.6,72.8,41.3,74.1z M68,43h-1v-6h1c1.7,0,3,1.3,3,3S69.7,43,68,43z M69,26.1V29h-6v-6h1c0.6,0,1-0.4,1-1v-6.8C67.6,18.2,69,22.1,69,26.1z M62,8c0.6,0,1,0.4,1,1v12h-2V9C61,8.4,61.4,8,62,8z M50,17c2.2,0,4,1.8,4,4s-1.8,4-4,4s-4-1.8-4-4S47.8,17,50,17z M49,6h2c0.6,0,1,0.4,1,1v8.4c-0.6-0.2-1.3-0.4-2-0.4s-1.4,0.1-2,0.4V7C48,6.4,48.4,6,49,6z M46,16.5c-1.2,1.1-2,2.7-2,4.5c0,3.3,2.7,6,6,6s6-2.7,6-6c0-1.8-0.8-3.4-2-4.5V9.1c1.7,0.2,3.4,0.7,5,1.4V22c0,0.6,0.4,1,1,1h1v6H39v-6h1c0.6,0,1-0.4,1-1V10.6c1.6-0.7,3.3-1.2,5-1.5V16.5z M37,9c0-0.6,0.4-1,1-1s1,0.4,1,1v12h-2V9z M31,26.1c0-4,1.4-7.9,4-11V22c0,0.6,0.4,1,1,1h1v6h-6V26.1z M30,31h40c1.1,0,2,0.9,2,2c0,1.1-0.9,2-2,2h-2h-2H34h-2h-2c-1.1,0-2-0.9-2-2S28.9,31,30,31z M32,43c-1.7,0-3-1.3-3-3s1.3-3,3-3h1v6H32z M35,45v-1v-7h30v7v1c0,8.3-6.7,15-15,15S35,53.3,35,45z M50,62c2.1,0,4.1-0.4,6-1.1V66c0,1.9-3.1,3-6,3s-6-1.1-6-3v-5.1C45.9,61.6,47.9,62,50,62z M12.6,80.9c0.8-4.3,4-7.7,8.2-8.7H21V94H10.2L12.6,80.9z M29,94v-2h14v2H29z M57,94v-2h14v2H57z M79,94V72.2h0.2c4.2,1,7.5,4.4,8.2,8.7L89.8,94H79z" />
    </motion.g>

    {/* Spark Particle Effect */}
    <motion.circle
      cx="70"
      cy="70"
      r="3"
      fill="#FF5A00"
      animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0], x: [0, 10, 15], y: [0, -10, -5] }}
      transition={{ repeat: Infinity, duration: 0.6 }}
    />
  </svg>
);

// 2. JCB / Excavator (Pivoting Digging Arm Motion)
const ExcavatorSVG = () => (
  <svg viewBox="0 0 400 400" className="w-full h-full stroke-[#FF5A00]" fill="none">
    {/* Base Structure */}
    <path opacity="0.5" d="M218 114C207.781 109.763 154.466 96.9807 154.003 84.1942C153.821 79.1711 163.082 56.6235 198.713 64.7485C220.618 69.7438 218.862 91.1757 216.415 100.38C215.24 104.802 209.03 107.489 206.47 111.291" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M201 117.298C184.868 158.187 136.401 145.476 150.559 100" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M96 203C150.657 211.5 190.692 213.45 245 220" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />

    {/* Digging Arm & Bucket Animation */}
    <motion.g
      animate={{ rotate: [0, -12, 6, 0] }}
      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      style={{ transformOrigin: "150px 160px" }}
    >
      <path d="M148 160C142.818 180.198 139.446 255.845 132.989 271.659C125.3 290.488 106.806 314.605 94 330.289L104.368 338" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M192 337.972C190.266 338.205 176.583 336.923 175.993 336.548C175.402 336.172 175.993 256.168 159 223.477L169.475 163" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M146 159.005C102.339 158.613 92.0143 182.286 137.795 202" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M172 165C186.105 183.05 196.892 207.331 211 224" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M258.602 205.264C258.59 210.596 247.596 234.326 252.071 238.962C267.089 254.519 327.744 243.246 297.814 215.374C289.444 207.58 275.964 204.476 261.737 203" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
    </motion.g>
  </svg>
);

// 3. Crane (Moving Cable & Lifting Hook Action)
const CraneSVG = () => (
  <svg viewBox="0 0 512 512" className="w-full h-full fill-[#FF5A00]">
    {/* Base Crane Frame */}
    <path d="M449.738,411.413c-9.809,0-17.787,7.979-17.787,17.787s7.979,17.787,17.787,17.787c9.807,0,17.787-7.979,17.787-17.787 S459.545,411.413,449.738,411.413z M449.738,434.987c-3.191,0-5.787-2.596-5.787-5.787s2.596-5.787,5.787-5.787 c3.19,0,5.787,2.596,5.787,5.787S452.929,434.987,449.738,434.987z" />
    <path d="M221.702,411.413c-9.809,0-17.788,7.979-17.788,17.787s7.979,17.787,17.788,17.787c9.808,0,17.787-7.979,17.787-17.787 S231.51,411.413,221.702,411.413z M221.702,434.987c-3.191,0-5.788-2.596-5.788-5.787s2.597-5.787,5.788-5.787 s5.787,2.596,5.787,5.787S224.894,434.987,221.702,434.987z" />
    <path d="M449.738,389.479h-60.113v-12.69h35.918h12h18.195V274.104l-18.195-13.969v-137.61h-9.211V84.057h-36.51v38.468h-82.23 l-46.759,78.251L115.357,58.75c-1.347-3.275-3.386-6.26-6.056-8.777c-5.054-4.763-11.917-7.254-18.838-6.853 c-0.738,0.044-1.49,0.156-2.308,0.346L39.674,54.793c-6.351,1.484-10.785,7.074-10.785,13.596v57.381h12V82.268l5.872,1.372 v64.857H28.082v67.488h12.271v6.86c-10.236,2.666-17.813,11.988-17.813,23.047c0,13.131,10.684,23.813,23.813,23.813 s23.813-10.683,23.813-23.812h-12c0,6.514-5.299,11.813-11.813,11.813c-6.515,0-11.813-5.299-11.813-11.813 c0-6.515,5.299-11.813,11.813-11.813h6v-18.096h12.271v-67.488h-5.864V86.443l29.402,6.869c0.811,0.188,1.563,0.301,2.297,0.344 c0.49,0.029,0.981,0.044,1.471,0.044c0.11,0,0.221-0.007,0.332-0.008l142.352,158.266v71.268h-25.409v53.563h25.409h12h35.918 v12.69H221.7c-21.903,0-39.722,17.819-39.722,39.722s17.818,39.722,39.722,39.722h228.038c21.902,0,39.721-17.819,39.721-39.722 S471.641,389.479,449.738,389.479z M437.543,275.264l6.195,4.756v84.769h-6.195V275.264z M234.614,364.788h-13.409v-29.563h13.409 V364.788z M403.822,96.057h12.51v8.52h-12.51V96.057z M403.822,116.576h12.51v5.948h-12.51V116.576z M52.625,203.985H40.082 v-43.488h12.543V203.985z M91.164,81.677c-0.003,0-0.085-0.006-0.277-0.051L42.404,70.299c-0.894-0.208-1.516-0.994-1.516-1.91 s0.622-1.702,1.516-1.91L90.88,55.152c0.199-0.046,0.281-0.052,0.288-0.053c0.27-0.016,0.539-0.023,0.807-0.023 c3.392,0,6.596,1.271,9.096,3.628c2.694,2.54,4.179,5.979,4.179,9.685s-1.484,7.144-4.179,9.684 C98.372,80.614,94.859,81.902,91.164,81.677z M239.574,239.528L105.085,90.004c1.504-0.912,2.921-1.979,4.216-3.199 c3.188-3.006,5.485-6.674,6.766-10.712l140.122,134.943L239.574,239.528z M246.614,364.788v-7.734h32.144v-12h-32.144v-21.828 v-71.913L316.4,134.524h75.422h33.721v116.397v94.132H293.848v12h131.695v7.734h-35.918H282.532H246.614z M377.625,376.788v12.69 h-83.093v-12.69H377.625z M221.7,456.922c-15.286,0-27.722-12.436-27.722-27.722s12.436-27.722,27.722-27.722 s27.722,12.436,27.722,27.722S236.986,456.922,221.7,456.922z M250.11,456.922c1.84-1.885,3.491-3.952,4.931-6.171h161.355 c1.439,2.219,3.091,4.286,4.931,6.171H250.11z M268.196,438.751h-7.942c0.758-3.062,1.168-6.259,1.168-9.551 c0-3.478-0.453-6.852-1.297-10.068h8.071c-1.493,2.951-2.34,6.282-2.34,9.81S266.703,435.8,268.196,438.751z M277.856,428.941 c0-5.409,4.4-9.81,9.81-9.81c5.408,0,9.809,4.4,9.809,9.81s-4.4,9.81-9.809,9.81C282.257,438.751,277.856,434.351,277.856,428.941 z M307.135,419.132h9.115c-1.494,2.951-2.34,6.282-2.34,9.81s0.846,6.858,2.34,9.81h-9.115c1.493-2.951,2.34-6.282,2.34-9.81 S308.628,422.083,307.135,419.132z M325.91,428.941c0-5.409,4.4-9.81,9.809-9.81c5.409,0,9.81,4.4,9.81,9.81s-4.4,9.81-9.81,9.81 C330.311,438.751,325.91,434.351,325.91,428.941z M355.188,419.132h8.49c-1.493,2.951-2.34,6.282-2.34,9.81s0.847,6.858,2.34,9.81 h-8.49c1.494-2.951,2.341-6.282,2.341-9.81S356.682,422.083,355.188,419.132z M373.338,428.941c0-5.409,4.4-9.81,9.81-9.81 s9.81,4.4,9.81,9.81s-4.4,9.81-9.81,9.81S373.338,434.351,373.338,428.941z M402.617,419.132h8.695 c-0.844,3.217-1.297,6.591-1.297,10.068c0,3.292,0.41,6.489,1.168,9.551h-8.566c1.492-2.951,2.34-6.282,2.34-9.81 S404.109,422.083,402.617,419.132z M416.729,407.132h-162.02c-1.358-2.025-2.901-3.914-4.599-5.653h32.422h107.093h31.702 C419.63,403.218,418.088,405.106,416.729,407.132z M449.738,456.922c-15.286,0-27.723-12.436-27.723-27.722 s12.437-27.722,27.723-27.722c15.285,0,27.721,12.436,27.721,27.722S465.023,456.922,449.738,456.922z" />

    {/* Moving Trolley & Cable Assembly */}
    <motion.g
      animate={{ y: [0, 20, -5, 0], x: [0, -10, 5, 0] }}
      transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
    >
      <path d="M358.953,296.724h48.537v-33.673h-48.537V296.724z M370.953,275.051h24.537v9.673h-24.537V275.051z" />
      <path d="M407.49,144.194h-82.738l-65.788,111.487H407.49V144.194z M348.045,243.682h-68.066l51.627-87.487h16.439V243.682z M395.49,243.682h-35.445v-87.487h35.445V243.682z" />
    </motion.g>
  </svg>
);

// 4. Building Under Construction (Path Drawing Blueprint Animation)
const UnderConstructionBuildingSVG = () => (
  <svg viewBox="0 -2 64 64" className="w-full h-full stroke-[#FF5A00]" fill="none">
    <motion.g
      strokeWidth="2"
      strokeDasharray="3 2"
      initial={{ pathLength: 0.1, opacity: 0.3 }}
      animate={{ pathLength: [0.1, 1, 0.8, 1], opacity: [0.4, 1, 0.8, 1] }}
      transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
    >
      <path d="M60.8,52.1 L58,52.1 L58,20.7 C58,18.5 51,12.8 51,12.8 C51,12.8 37,18.5 37,20.7 L37,56 L31,56 L31,7.9 C31,5.7 22,0 22,0 C22,0 4,5.7 4,7.9 L4,52.1 L1,52.1 C-0.1,52.1 0,53 0,54.1 C0,55.2 -0.1,56.1 1,56.1 L60.8,56.1 C62.2,56.1 62,55.2 62,54.1 C62,53 62.2,52.1 60.8,52.1 Z" />
      <path d="M22,0 L22,49.1" />
      <path d="M7,11.8 L14,8.8" />
      <path d="M7,22.6 L14,19.6" />
      <path d="M7,33.4 L14,30.5" />
      <path d="M7,44.2 L14,41.3" />
      <path d="M51,12.8 L51,49.1" />
      <path d="M40,23.6 L47,20.6" />
      <path d="M40,33.4 L47,30.5" />
      <path d="M40,44.2 L47,41.3" />
    </motion.g>
  </svg>
);

// 5. Finished Completed Building (Spring Pop & Light Polish Animation)
const CompletedBuildingSVG = () => (
  <motion.svg
    viewBox="0 0 64 64"
    className="w-full h-full stroke-[#FF5A00] fill-[#FF5A00]/10"
    fill="none"
    initial={{ scale: 0.85, y: 10, opacity: 0 }}
    animate={{ scale: 1, y: 0, opacity: 1 }}
    transition={{ type: "spring", stiffness: 220, damping: 14 }}
  >
    <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M8,56 L56,56 M12,56 L12,20 L32,8 L52,20 L52,56" />
    
    {/* Animated Glowing Windows */}
    <motion.path
      strokeWidth="2"
      strokeLinecap="round"
      d="M20,28 L26,28 M38,28 L44,28 M20,38 L26,38 M38,38 L44,38"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
    />
    
    <rect x="26" y="44" width="12" height="12" strokeWidth="2" fill="#FF5A00" className="opacity-80" />
    <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M42,12 L48,12 L48,18" />

    {/* Sparkle Glow Effect on Completion */}
    <motion.circle
      cx="32"
      cy="8"
      r="4"
      fill="#FF5A00"
      animate={{ scale: [0, 1.8, 0], opacity: [0, 0.8, 0] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
    />
  </motion.svg>
);

// 5 Dynamic Stage Visuals
const STAGES = [
  <WorkerSVG key="1" />,
  <ExcavatorSVG key="2" />,
  <CraneSVG key="3" />,
  <UnderConstructionBuildingSVG key="4" />,
  <CompletedBuildingSVG key="5" />
];

function InitialSplashLoader({ onComplete }) {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    // Cycles through 5 animated stages smoothly (0.9s per stage = 4.5s total)
    const timer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < STAGES.length - 1) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, 900);

    const finishTimeout = setTimeout(() => {
      onComplete();
    }, 4800);

    return () => {
      clearInterval(timer);
      clearTimeout(finishTimeout);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#000F1B] select-none p-4"
    >
      {/* Background Subtle Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />
      <div className="absolute h-96 w-96 rounded-full bg-[#FF5A00]/20 blur-[130px] pointer-events-none" />

      {/* Main Vector Animation Container */}
      <div className="relative z-10 flex items-center justify-center h-48 w-48 md:h-64 md:w-64 p-6 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage}
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full h-full flex items-center justify-center"
          >
            {STAGES[currentStage]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Stage Progress Indicator */}
      <div className="relative z-10 flex items-center gap-2 mt-12">
        {STAGES.map((_, idx) => (
          <motion.div
            key={idx}
            animate={{
              width: idx === currentStage ? 28 : 8,
              backgroundColor: idx <= currentStage ? "#FF5A00" : "rgba(255,255,255,0.15)"
            }}
            transition={{ duration: 0.3 }}
            className="h-2 rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
}

function PageFallback() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000F1B]">
      <div className="w-3 h-3 rounded-full bg-[#FF5A00] animate-ping" />
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div className="App font-['Poppins',sans-serif] text-[#111111] bg-white antialiased min-h-screen flex flex-col selection:bg-[#FF5A00]/20 selection:text-[#000F1B]">
      {/* 🎬 Visual Construction Vector Loader */}
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
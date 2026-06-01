/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouterProvider, useRouter } from "./components/RouterContext";
import LandingPage from "./pages/LandingPage";
import MainCatalogPage from "./pages/MainCatalogPage";
import EmployerPanel from "./pages/EmployerPanel";
import CandidateFlow from "./pages/CandidateFlow";
import AdminPanel from "./pages/AdminPanel";
import JobVacancyLanding from "./pages/JobVacancyLanding";
import CompanyLanding from "./pages/CompanyLanding";

function AppContent() {
  const { path } = useRouter();

  const segments = path.split("/").filter(Boolean);
  const isCandidateUrl = path.startsWith("/candidate") || segments.some(s => s.toLowerCase().startsWith("candidate") || s.toLowerCase().startsWith("cand"));

  if (isCandidateUrl) {
    return <CandidateFlow />;
  }

  if (/^\/employer[a-zA-Z0-9_-]*/.test(path)) {
    return <EmployerPanel />;
  }

  const reserved = ["main", "vacancy", "admin", "job", "auth", "setup", "candidate", "employer"];
  if (segments.length > 0 && !reserved.includes(segments[0])) {
    return <CompanyLanding />;
  }

  // Simple state routing map
  switch (path) {
    case "/main":
      return <LandingPage />;
    case "/vacancy":
      return <MainCatalogPage />;
    case "/admin":
      return <AdminPanel />;
    case "/job":
      return <JobVacancyLanding />;
    case "/auth":
      return <LandingPage />;
    case "/setup":
      return <EmployerPanel />;
    default:
      // Default fallback
      return <LandingPage />;
  }
}

export default function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}

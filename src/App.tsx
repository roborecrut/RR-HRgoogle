/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouterProvider, useRouter } from "./components/RouterContext";
import LandingPage from "./pages/LandingPage";
import MainCatalogPage from "./pages/MainCatalogPage";
import AuthPage from "./pages/AuthPage";
import EmployerPanel from "./pages/EmployerPanel";
import CandidateFlow from "./pages/CandidateFlow";
import AdminPanel from "./pages/AdminPanel";
import JobVacancyLanding from "./pages/JobVacancyLanding";

function AppContent() {
  const { path } = useRouter();

  if (path.startsWith("/candidate")) {
    return <CandidateFlow />;
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
      return <AuthPage />;
    case "/employer":
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

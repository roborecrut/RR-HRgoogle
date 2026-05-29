/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouterProvider, useRouter } from "./components/RouterContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import EmployerPanel from "./pages/EmployerPanel";
import CandidateFlow from "./pages/CandidateFlow";

function AppContent() {
  const { path } = useRouter();

  // Simple state routing map
  switch (path) {
    case "/main":
      return <LandingPage />;
    case "/auth":
      return <AuthPage />;
    case "/employer":
    case "/setup":
      return <EmployerPanel />;
    case "/candidate":
      return <CandidateFlow />;
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

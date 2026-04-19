import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import Homepage from "./pages/Homepage";
import { DashboardLayout } from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import MeetingRoom from "./pages/MeetingRoom";
import AnalyticsPage from "./pages/analytics";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute";

import { Toaster } from "sonner";
import { useAuthStore } from "./stores/authStore";

function App() {
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster richColors position="top-center" />
      <Routes>
        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <LandingPage />
            </PublicOnlyRoute>
          }
        />
        <Route path="/auth" element={<Navigate to="/auth/signin" replace />} />

        <Route
          path="/auth/:mode"
          element={
            <PublicOnlyRoute>
              <AuthPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="DashboardLayoutWrapper">
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/MeetingRoom" element={
            <ProtectedRoute>
              <div className="DashboardLayoutWrapper">
                <DashboardLayout>
                  <MeetingRoom />
                </DashboardLayout>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/analytics" element={
            <ProtectedRoute>
              <div className="DashboardLayoutWrapper">
                <DashboardLayout>
                  <AnalyticsPage />
                </DashboardLayout>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/profile/edit" element={
            <ProtectedRoute>
              <div className="DashboardLayoutWrapper">
                <DashboardLayout>
                  <EditProfile />
                </DashboardLayout>
              </div>
            </ProtectedRoute>
          } />
        <Route path="/settings" element={
            <ProtectedRoute>
              <div className="DashboardLayoutWrapper">
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </div>
            </ProtectedRoute>
          } />
        <Route path="/help" element={
            <ProtectedRoute>
              <div className="DashboardLayoutWrapper">
                <DashboardLayout>
                  <Help />
                </DashboardLayout>
              </div>
            </ProtectedRoute>
          } />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <div className="DashboardLayoutWrapper">
                <DashboardLayout>
                  <div>Page not found</div>
                </DashboardLayout>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/room/:roomId"
          element={
            <ProtectedRoute>
              <MeetingRoom />
            </ProtectedRoute>
          }
        />  

      </Routes>
    </BrowserRouter>
  );
}

export default App;

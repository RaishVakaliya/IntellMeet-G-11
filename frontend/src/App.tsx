import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LandingPage } from "./home/pages/LandingPage";
import { AuthPage } from "./auth/pages/AuthPage";
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "./auth/components/ProtectedRoute";
import { Toaster } from "sonner";
import { Loader2 } from "lucide-react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

const Homepage = lazy(() => import("./dashboard/pages/Homepage"));
const MeetingRoom = lazy(() => import("./meeting/pages/MeetingRoom"));
const ProfilePage = lazy(() => import("./profile/pages/ProfilePage"));
const BoardListPage = lazy(() => import("./kanban/pages/BoardListPage"));
const KanbanBoard = lazy(() => import("./kanban/pages/KanbanBoard"));

const PageLoader = () => (
  <div className="h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 text-primary animate-spin" />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-center" />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/"
            element={
              <PublicOnlyRoute>
                <LandingPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/auth"
            element={<Navigate to="/auth/signin" replace />}
          />

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
                <Homepage />
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

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/board"
            element={
              <ProtectedRoute>
                <BoardListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/board/:boardId"
            element={
              <ProtectedRoute>
                <KanbanBoard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  );
}

export default App;

// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedWorkspaceRoute from "./components/ProtectedWorkspaceRoute";

// Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Verify from "./pages/auth/Verify";
import SetPassword from "./pages/auth/SetPassword";
import GoogleSuccess from "./pages/auth/GoogleSuccess";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import WorkspacesList from "./pages/workspace/WorkspacesList";
import WorkspaceDashboard from "./pages/workspace/Dashboard";
import WorkspaceProjects from "./pages/workspace/Projects";
import WorkspaceTasks from "./pages/workspace/Tasks";
import WorkspaceMembers from "./pages/workspace/Members";

/**
 * APP COMPONENT
 * Main routing logic with theme support
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <BrowserRouter>
            <Routes>
              {/* PUBLIC ROUTES - Anyone can access */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth/verify" element={<Verify />} />
              <Route path="/auth/success" element={<GoogleSuccess />} />

              {/* PUBLIC LANDING, TERMS, PRIVACY */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />

              {/* PROTECTED ROUTES - Login required */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <Tasks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/set-password"
                element={
                  <ProtectedRoute>
                    <SetPassword />
                  </ProtectedRoute>
                }
              />

              {/* WORKSPACE ROUTES */}
              <Route
                path="/workspaces"
                element={
                  <ProtectedRoute>
                    <WorkspacesList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workspace/:workspaceId/dashboard"
                element={
                  <ProtectedRoute>
                    <ProtectedWorkspaceRoute>
                      <WorkspaceDashboard />
                    </ProtectedWorkspaceRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workspace/:workspaceId/projects"
                element={
                  <ProtectedRoute>
                    <ProtectedWorkspaceRoute>
                      <WorkspaceProjects />
                    </ProtectedWorkspaceRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workspace/:workspaceId/tasks"
                element={
                  <ProtectedRoute>
                    <ProtectedWorkspaceRoute>
                      <WorkspaceTasks />
                    </ProtectedWorkspaceRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workspace/:workspaceId/members"
                element={
                  <ProtectedRoute>
                    <ProtectedWorkspaceRoute>
                      <WorkspaceMembers />
                    </ProtectedWorkspaceRoute>
                  </ProtectedRoute>
                }
              />

              {/* TODO: Add more workspace routes later */}
              {/* /workspace/:workspaceId/settings */}
              {/* /workspace/:workspaceId/approvals */}
              {/* /workspace/:workspaceId/create-task */}

              {/* 404 - Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* Toast Notifications */}
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "var(--color-card)",
                  color: "var(--color-foreground)",
                  border: "1px solid var(--color-border)",
                },
                success: {
                  iconTheme: {
                    primary: "var(--color-primary)",
                    secondary: "#ffffff",
                  },
                },
              }}
            />
          </BrowserRouter>
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
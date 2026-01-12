// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Verify from "./pages/auth/Verify";
import SetPassword from "./pages/auth/SetPassword";
import GoogleSuccess from "./pages/auth/GoogleSuccess";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import NotFound from "./pages/NotFound";

/**
 * APP COMPONENT
 * Main routing logic with theme support
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* PUBLIC ROUTES - Anyone can access */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth/verify" element={<Verify />} />
            <Route path="/auth/success" element={<GoogleSuccess />} />

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

            {/* ROOT REDIRECT */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

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
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import GoogleSuccess from "./pages/auth/GoogleSuccess";

// Pages
import Login from "./pages/auth/Login";
import Verify from "./pages/auth/Verify";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

/**
 * APP COMPONENT
 * Main routing logic
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* PUBLIC ROUTES - Anyone can access */}
          <Route path="/login" element={<Login />} />
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

          {/* ROOT REDIRECT */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 - Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
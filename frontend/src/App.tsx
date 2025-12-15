// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import GoogleSuccess from "./pages/auth/GoogleSuccess";

// Pages
import Login from "./pages/auth/Login";
import Verify from "./pages/auth/Verify";
import Dashboard from "./pages/Dashboard";

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

/**
 * NOT FOUND PAGE
 * 404 error page
 */
const NotFound = () => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    textAlign: "center",
  }}>
    <h1 style={{ fontSize: "72px", margin: 0 }}>404</h1>
    <p style={{ fontSize: "24px", color: "#666" }}>Page not found</p>
    <a
      href="/dashboard"
      style={{
        marginTop: "20px",
        padding: "10px 20px",
        backgroundColor: "#4F46E5",
        color: "white",
        textDecoration: "none",
        borderRadius: "4px",
      }}
    >
      Go to Dashboard
    </a>
  </div>
);

export default App;
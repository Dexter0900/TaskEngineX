// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * PROTECTED ROUTE COMPONENT
 * Unauthorized users ko login page pe redirect karta
 * 
 * Usage:
 *   <Route path="/dashboard" element={
 *     <ProtectedRoute>
 *       <Dashboard />
 *     </ProtectedRoute>
 *   } />
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();

  // Loading state - jab tak auth check nahi hua
  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Agar authenticated nahi toh login pe bhejo
  if (!isAuthenticated) {
    console.log("🔒 Redirecting to login - Not authenticated");
    return <Navigate to="/login" replace />;
  }

  // Authenticated hai toh children render karo
  return <>{children}</>;
};

export default ProtectedRoute;
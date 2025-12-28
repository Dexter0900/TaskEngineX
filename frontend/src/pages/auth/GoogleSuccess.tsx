// src/pages/auth/GoogleSuccess.tsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCurrentUser } from "../../api/authApi";

/**
 * GOOGLE SUCCESS PAGE
 * Google OAuth ke baad backend redirect karta yaha
 * URL: /auth/success?token=xyz123
 */
const GoogleSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // URL se token lo
        const token = searchParams.get("token");

        if (!token) {
          console.error("No token in URL");
          navigate("/login");
          return;
        }

        console.log("🔵 Google OAuth token received");

        // Token se user data fetch karo
        // (Token already localStorage mein nahi hai, manually set karna padega)
        localStorage.setItem("token", token);

        // User data fetch karo
        const user = await getCurrentUser();

        // Auth context update
        login(token, user);

        console.log("✅ Google login successful");

        // Dashboard redirect
        navigate("/dashboard", { replace: true });
      } catch (error) {
        console.error("❌ Google callback error:", error);
        navigate("/login");
      }
    };

    handleGoogleCallback();
  }, [searchParams, login, navigate]);

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
    }}>
      <div style={{ textAlign: "center" }}>
        <h2>🔵 Completing Google Login...</h2>
        <p>Please wait...</p>
      </div>
    </div>
  );
};

export default GoogleSuccess;
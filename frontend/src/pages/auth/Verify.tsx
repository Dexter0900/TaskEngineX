// src/pages/auth/Verify.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyMagicLink } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

/**
 * VERIFY PAGE
 * Magic link token verify karta aur login karta
 * URL: /auth/verify?token=xyz123
 */
const Verify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your magic link...");

  useEffect(() => {
    const verifyToken = async () => {
      // URL se token lo
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("No token found. Please request a new magic link.");
        return;
      }

      try {
        console.log("🔍 Verifying magic link token...");

        // API call
        const response = await verifyMagicLink(token);

        console.log("✅ Magic link verified successfully");

        // Auth context mein login karo
        login(response.token, response.user);

        // Success state
        setStatus("success");
        setMessage("Login successful! Redirecting...");

        // Dashboard pe redirect (2 seconds baad)
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 2000);
      } catch (err: any) {
        console.error("❌ Magic link verification failed:", err);

        // Error state
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Invalid or expired magic link. Please request a new one."
        );
      }
    };

    verifyToken();
  }, [searchParams, login, navigate]);

  return (
    <div style={{
      maxWidth: "500px",
      margin: "100px auto",
      padding: "40px",
      textAlign: "center",
    }}>
      {/* Loading State */}
      {status === "loading" && (
        <>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
          <h2>Verifying...</h2>
          <p>{message}</p>
        </>
      )}

      {/* Success State */}
      {status === "success" && (
        <>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>✅</div>
          <h2 style={{ color: "green" }}>Success!</h2>
          <p>{message}</p>
        </>
      )}

      {/* Error State */}
      {status === "error" && (
        <>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>❌</div>
          <h2 style={{ color: "red" }}>Verification Failed</h2>
          <p>{message}</p>
          <button
            onClick={() => navigate("/login")}
            style={{
              marginTop: "20px",
              padding: "12px 24px",
              backgroundColor: "#4F46E5",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Back to Login
          </button>
        </>
      )}
    </div>
  );
};

export default Verify;
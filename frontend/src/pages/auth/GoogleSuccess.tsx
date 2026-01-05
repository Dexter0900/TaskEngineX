// src/pages/auth/GoogleSuccess.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
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
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [message, setMessage] = useState("Completing Google login...");

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const token = searchParams.get("token");

        if (!token) {
          console.error("No token in URL");
          navigate("/login");
          return;
        }

        console.log("🔵 Google OAuth token received");
        localStorage.setItem("token", token);

        const user = await getCurrentUser();
        login(token, user);

        console.log("✅ Google login successful");
        navigate("/dashboard", { replace: true });
      } catch (error) {
        console.error("❌ Google callback error:", error);
        setStatus("error");
        setMessage("Failed to complete Google login. Redirecting...");
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    handleGoogleCallback();
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {status === "loading" ? (
          <div className="bg-zinc-900 rounded-xl p-8 sm:p-10 text-center border border-zinc-800">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900">
                <div className="w-8 h-8 border-3 border-zinc-800 border-t-white rounded-full animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-3">Google Login</h2>
            <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-xl p-8 sm:p-10 text-center border border-zinc-800">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 border border-red-700/50">
                <span className="text-3xl">!</span>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-red-400 mb-3">Login Failed</h2>
            <p className="text-slate-300 text-sm mb-6">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="w-full px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Back to Login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default GoogleSuccess;
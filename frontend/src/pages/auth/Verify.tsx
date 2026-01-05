// src/pages/auth/Verify.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
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
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("No token found. Please request a new magic link.");
        return;
      }

      try {
        console.log("🔍 Verifying magic link token...");
        const response = await verifyMagicLink(token);
        console.log("✅ Magic link verified successfully");

        login(response.token, response.user);
        setStatus("success");
        setMessage("Login successful!");

        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              navigate("/dashboard", { replace: true });
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (err: any) {
        console.error("❌ Magic link verification failed:", err);
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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {status === "loading" && (
          <div className="bg-slate-800 rounded-xl p-8 sm:p-10 text-center border border-slate-700">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900">
                <div className="w-8 h-8 border-3 border-zinc-800 border-t-white rounded-full animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-3">Verifying</h2>
            <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="bg-zinc-900 rounded-xl p-8 sm:p-10 text-center border border-zinc-800">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-900/30 border border-emerald-700/50">
                <span className="text-3xl">✓</span>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-emerald-400 mb-3">Verified</h2>
            <p className="text-slate-300 text-sm mb-6">{message}</p>
            <p className="text-slate-400 text-xs">
              Redirecting in{" "}
              <span className="font-semibold text-white">{countdown}s</span>
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="bg-zinc-900 rounded-xl p-8 sm:p-10 text-center border border-zinc-800">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 border border-red-850/50">
                <span className="text-3xl">!</span>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-red-400 mb-3">Verification Failed</h2>
            <p className="text-slate-300 text-sm mb-6">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="w-full px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Back to Login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Verify;
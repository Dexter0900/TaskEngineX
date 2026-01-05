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
        setMessage("Login successful!");

        // Countdown timer
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-600 via-pink-500 to-red-500 p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md"
      >
        {/* Loading State */}
        {status === "loading" && (
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="text-7xl mb-6 inline-block"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              ⏳
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-gray-900 mb-3"
            >
              Verifying Magic Link
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-gray-600 text-base leading-relaxed mb-8"
            >
              {message}
            </motion.p>
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full bg-purple-600"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Success State */}
        {status === "success" && (
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="text-7xl mb-6 inline-block"
              animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ✅
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-emerald-600 mb-3"
            >
              Welcome Back!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-gray-600 text-base leading-relaxed mb-6"
            >
              {message}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-gray-500 text-sm font-medium"
            >
              Redirecting in{" "}
              <span className="font-bold text-purple-600 text-lg">{countdown}s</span>...
            </motion.p>
            <motion.div
              className="mt-6 h-1 bg-linear-to-r from-purple-600 to-pink-600 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 3, ease: "linear" }}
            />
          </motion.div>
        )}

        {/* Error State */}
        {status === "error" && (
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="text-7xl mb-6 inline-block"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              ❌
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-red-600 mb-3"
            >
              Verification Failed
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-gray-600 text-base leading-relaxed mb-8"
            >
              {message}
            </motion.p>
            <motion.button
              onClick={() => navigate("/login")}
              className="px-8 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Login
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Verify;
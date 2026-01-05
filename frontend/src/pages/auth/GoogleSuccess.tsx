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
        setStatus("error");
        setMessage("Failed to complete Google login. Redirecting...");
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    handleGoogleCallback();
  }, [searchParams, login, navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const bounceVariants = {
    bounce: { y: [0, -10, 0], transition: { duration: 1, repeat: Infinity } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md"
      >
        {status === "loading" ? (
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="text-7xl mb-8 inline-block"
              variants={bounceVariants}
              animate="bounce"
            >
              🔵
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Signing You In
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-gray-600 text-base leading-relaxed mb-10"
            >
              {message}
            </motion.p>
            <motion.div className="flex justify-center gap-3" variants={itemVariants}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                  animate={{ y: [0, -12, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="text-7xl mb-6 inline-block"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              ⚠️
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold text-red-600 mb-3"
            >
              Login Failed
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-gray-600 text-base leading-relaxed mb-6"
            >
              {message}
            </motion.p>
            <motion.p
              variants={itemVariants}
              className="text-gray-500 text-sm font-medium"
            >
              Redirecting to login page...
            </motion.p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default GoogleSuccess;
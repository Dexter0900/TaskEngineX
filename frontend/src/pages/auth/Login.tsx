// src/pages/auth/Login.tsx
import { useState } from "react";
import { sendMagicLink, loginWithGoogle } from "../../api/authApi";

/**
 * LOGIN PAGE
 * Google OAuth aur Magic Link dono options
 */
const Login = () => {

  // State
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /**
   * HANDLE MAGIC LINK SUBMIT
   * Email pe magic link bhejta hai
   */
  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      // API call
      const response = await sendMagicLink(email);

      // Success
      setMessage(response.message || "Check your email for login link!");
      setEmail(""); // Clear input

      console.log("✅ Magic link sent to:", email);
    } catch (err: any) {
      // Error
      console.error("❌ Magic link error:", err);
      setError(
        err.response?.data?.message || "Failed to send magic link. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * HANDLE GOOGLE LOGIN
   * Google OAuth flow start karta
   */
  const handleGoogleLogin = () => {
    console.log("🔵 Redirecting to Google OAuth...");
    loginWithGoogle();
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto", padding: "20px" }}>
      <h1>Welcome to TaskEngineX 🚀</h1>
      <p>Sign in to manage your tasks</p>

      {/* Error Message */}
      {error && (
        <div style={{ color: "red", padding: "10px", marginBottom: "10px", border: "1px solid red", borderRadius: "4px" }}>
          {error}
        </div>
      )}

      {/* Success Message */}
      {message && (
        <div style={{ color: "green", padding: "10px", marginBottom: "10px", border: "1px solid green", borderRadius: "4px" }}>
          {message}
        </div>
      )}

      {/* Google Login Button */}
      <button
        onClick={handleGoogleLogin}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "20px",
          backgroundColor: "#4285f4",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        🔵 Continue with Google
      </button>

      <div style={{ textAlign: "center", margin: "20px 0" }}>
        <span>OR</span>
      </div>

      {/* Magic Link Form */}
      <form onSubmit={handleMagicLinkSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: "5px" }}>
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: loading ? "#ccc" : "#4F46E5",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
          }}
        >
          {loading ? "Sending..." : "✨ Send Magic Link"}
        </button>
      </form>

      <p style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
        We'll send you a magic link to sign in without password
      </p>
    </div>
  );
};

export default Login;
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiUser, FiCheckCircle, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { signup, loginWithGoogle } from "../../api/authApi";
import toast from "react-hot-toast";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordsMatch = formData.password === confirmPassword && confirmPassword !== "";

  // Password strength validator
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const requirements = {
      minLength: password.length >= 8,
      hasCapital: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    if (requirements.minLength) strength++;
    if (requirements.hasCapital) strength++;
    if (requirements.hasNumber) strength++;
    if (requirements.hasSpecial) strength++;

    return { strength, requirements };
  };

  const passwordStrengthInfo = getPasswordStrength(formData.password);

  const getStrengthColor = (index: number) => {
    const strength = passwordStrengthInfo.strength;
    if (strength === 0) return "bg-gray-600";
    if (strength === 1) return index === 0 ? "bg-red-500" : "bg-gray-600";
    if (strength === 2) return index <= 1 ? "bg-orange-500" : "bg-gray-600";
    if (strength === 3) return index <= 2 ? "bg-yellow-500" : "bg-gray-600";
    return "bg-emerald-400"; // strength === 4
  };

  const getStrengthLabel = () => {
    const strength = passwordStrengthInfo.strength;
    if (strength === 0) return "";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.email ||
      !formData.password ||
      !formData.firstName ||
      !formData.lastName
    ) {
      toast.error("All fields are required");
      return;
    }

    // Check password strength requirements
    const { requirements } = passwordStrengthInfo;
    if (!requirements.minLength) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!requirements.hasCapital) {
      toast.error("Password must contain at least one capital letter (A-Z)");
      return;
    }
    if (!requirements.hasNumber) {
      toast.error("Password must contain at least one number (0-9)");
      return;
    }
    if (!requirements.hasSpecial) {
      toast.error(
        "Password must contain at least one special character (!@#$%^&*...)"
      );
      return;
    }

    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await signup(formData);
      toast.success(response.message);
      setEmailSent(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full bg-card border border-border rounded-2xl shadow-lg p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FiCheckCircle className="w-10 h-10 text-primary" />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Check Your Email!
          </h2>
          <p className="text-muted-foreground mb-6">
            We've sent a verification link to{" "}
            <span className="font-semibold text-foreground">
              {formData.email}
            </span>
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Click the link in the email to complete your registration. The link
            will expire in 15 minutes.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 w-full py-3 px-4 bg-rose-800 text-white font-medium rounded-lg hover:bg-rose-900 hover:shadow-lg transition-colors"
          >
            Back to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Create Account
          </h1>
          <p className="text-muted-foreground">
            Start managing your tasks efficiently
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
          {/* Google Button */}
          <button
            onClick={loginWithGoogle}
            className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 border-t border-border"></div>
            <span className="text-sm text-muted-foreground">or</span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  First Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-accent focus:ring-opacity-50 focus:border-accent outline-none text-foreground placeholder:text-muted-foreground caret-foreground"
                    placeholder="John"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-accent focus:ring-opacity-50 focus:border-accent outline-none text-foreground placeholder:text-muted-foreground caret-foreground"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-accent focus:ring-opacity-50 focus:border-accent outline-none text-foreground placeholder:text-muted-foreground caret-foreground"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative group">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-accent focus:ring-opacity-50 focus:border-accent outline-none text-foreground placeholder:text-muted-foreground caret-foreground"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>

                {/* Tooltip on field hover */}
                {formData.password && (
                  <div className="absolute bottom-full mb-2 left-0 bg-card border border-border rounded px-3 py-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                    <div className="text-muted-foreground mb-1">Requirements:</div>
                    <div className={`flex items-center gap-1.5 ${passwordStrengthInfo.requirements.minLength ? "text-emerald-400" : "text-muted-foreground"}`}>
                      <span>●</span>
                      <span>Min 8 chars</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordStrengthInfo.requirements.hasCapital ? "text-emerald-400" : "text-muted-foreground"}`}>
                      <span>●</span>
                      <span>1 Capital (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordStrengthInfo.requirements.hasNumber ? "text-emerald-400" : "text-muted-foreground"}`}>
                      <span>●</span>
                      <span>1 Number (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordStrengthInfo.requirements.hasSpecial ? "text-emerald-400" : "text-muted-foreground"}`}>
                      <span>●</span>
                      <span>1 Special (!@#...)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Password Strength Meter */}
              {formData.password && (
                <div className="mt-2">
                  {/* Strength Strips */}
                  <div className="flex gap-1.5 mb-2">
                    {[0, 1, 2, 3].map((index) => (
                      <motion.div
                        key={index}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex-1 h-1 rounded-full transition-colors duration-300 ${getStrengthColor(
                          index
                        )}`}
                      />
                    ))}
                  </div>

                  {/* Strength Label */}
                  <p className="text-xs font-semibold">
                    Strength: <span className="text-zinc-400">{getStrengthLabel()}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 bg-background border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-accent outline-none text-foreground placeholder:text-muted-foreground caret-foreground ${
                    confirmPassword && passwordsMatch ? "border-emerald-400 focus:ring-emerald-400/50" : confirmPassword && !passwordsMatch ? "border-red-500 focus:ring-red-500/50" : "border-input focus:ring-accent"
                  }`}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-500 mt-1">
                  Passwords don't match
                </p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1.5">
                  <span>✓</span>
                  Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !passwordsMatch || passwordStrengthInfo.strength < 4}
              className={`w-full py-3 px-4 bg-rose-800 text-white font-medium rounded-lg hover:bg-rose-900 hover:shadow-lg transition-colors ${
                loading || !passwordsMatch || passwordStrengthInfo.strength < 4 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

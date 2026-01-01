// src/api/authApi.ts
import axiosInstance from "./axios";
import type { 
  AuthResponse, 
  MagicLinkResponse, 
  User, 
  SignupData,
  LoginData,
  SetPasswordData
} from "../types";

/**
 * SIGNUP
 * User registration - sends magic link for email verification
 * 
 * @param data - Signup data (email, password, firstName, lastName)
 * @returns Success message
 */
export const signup = async (data: SignupData): Promise<MagicLinkResponse> => {
  const response = await axiosInstance.post("/auth/signup", data);
  return response.data;
};

/**
 * VERIFY MAGIC LINK
 * Magic link token verify karta aur user create karta (after signup)
 * 
 * @param token - Magic link token (URL se)
 * @returns Auth token aur user data
 */
export const verifyMagicLink = async (token: string): Promise<AuthResponse> => {
  const response = await axiosInstance.post("/auth/magic-link/verify", {
    token,
  });
  return response.data;
};

/**
 * LOGIN
 * Email/password se login
 * 
 * @param data - Login credentials (email, password)
 * @returns Auth token aur user data
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await axiosInstance.post("/auth/login", data);
  return response.data;
};

/**
 * GOOGLE LOGIN
 * Browser ko Google OAuth URL pe redirect karta
 * Backend handle karega authentication
 */
export const loginWithGoogle = () => {
  // Backend ka Google OAuth endpoint
  const googleAuthUrl = `${
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
  }/auth/google`;

  // Redirect to Google
  window.location.href = googleAuthUrl;
};

/**
 * SET PASSWORD
 * Google-only users ke liye password set karna (account linking)
 * Protected route - JWT token required
 * 
 * @param data - Password aur optional name update
 * @returns Success message
 */
export const setPassword = async (
  data: SetPasswordData
): Promise<{ message: string; success: boolean }> => {
  const response = await axiosInstance.post("/auth/set-password", data);
  return response.data;
};

/**
 * GET CURRENT USER
 * Logged-in user ka data fetch karta
 * JWT token se automatically authenticate hoga (interceptor se)
 * 
 * @returns Current user data
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await axiosInstance.get("/auth/me");
  return response.data.user;
};

/**
 * LOGOUT
 * User ko logout karta
 * Server-side logout (optional) + client-side cleanup
 */
export const logout = async (): Promise<void> => {
  try {
    // Server ko inform karo (optional - token blacklisting ke liye)
    await axiosInstance.post("/auth/logout");
  } catch (error) {
    // Agar server error bhi aaye toh local logout toh karo
    console.error("Logout API error:", error);
  } finally {
    // LocalStorage cleanup
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};
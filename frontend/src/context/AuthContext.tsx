// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User, AuthContextType } from "../types";
import { getCurrentUser } from "../api/authApi";

/**
 * AUTH CONTEXT
 * Puri app mein user state share karne ke liye
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AUTH PROVIDER COMPONENT
 * App ko wrap karta hai aur auth state provide karta
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * INITIALIZE AUTH STATE
   * Page load pe localStorage se state restore karta
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        // LocalStorage se token aur user lo
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          // Parse user data
          const parsedUser = JSON.parse(storedUser);

          // State set karo
          setToken(storedToken);
          setUser(parsedUser);

          // Verify token validity by fetching current user
          try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            // Update localStorage with fresh data
            localStorage.setItem("user", JSON.stringify(currentUser));
          } catch (error) {
            // Token invalid - clear everything
            console.error("Token verification failed:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * LOGIN FUNCTION
   * User ko login karta aur state update karta
   */
  const login = (newToken: string, newUser: User) => {
    // State update
    setToken(newToken);
    setUser(newUser);

    // LocalStorage mein save karo
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    console.log("✅ User logged in:", newUser.email);
  };

  /**
   * LOGOUT FUNCTION
   * User ko logout karta aur state clear karta
   */
  const logout = () => {
    // State clear
    setToken(null);
    setUser(null);

    // LocalStorage clear
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    console.log("👋 User logged out");
  };

  /**
   * IS AUTHENTICATED
   * Helper to check if user is logged in
   */
  const isAuthenticated = !!token && !!user;

  // Context value
  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * USE AUTH HOOK
 * Components mein auth state access karne ke liye
 * 
 * Usage: const { user, login, logout } = useAuth();
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
// src/api/axios.ts
import axios from "axios";

/**
 * BASE URL
 * Backend ka URL (environment based)
 */
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * AXIOS INSTANCE
 * Centralized configuration with interceptors
 */
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

/**
 * REQUEST INTERCEPTOR
 * Har request se pehle chalti hai
 * Purpose: JWT token automatically add karna
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // LocalStorage se token lo
    const token = localStorage.getItem("token");

    // Agar token hai toh Authorization header add karo
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug log (development mein helpful)
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);

    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 * Har response ke baad chalti hai
 * Purpose: Global error handling
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Success response (200-299)
    console.log("✅ Response:", response.status);
    return response;
  },
  (error) => {
    // Error response
    console.error("❌ Response error:", error.response?.status);

    // Handle specific errors
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          // Unauthorized - Token invalid/expired
          console.log("🔒 Unauthorized - Logging out");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          break;

        case 403:
          // Forbidden - No permission
          console.log("🚫 Forbidden - Access denied");
          break;

        case 404:
          // Not found
          console.log("🔍 Resource not found");
          break;

        case 500:
          // Server error
          console.log("💥 Server error");
          break;
      }
    } else if (error.request) {
      // Request sent but no response
      console.error("📡 No response from server");
    } else {
      // Something else happened
      console.error("⚠️ Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
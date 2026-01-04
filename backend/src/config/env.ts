import dotenv from "dotenv";
dotenv.config();

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const ENV = {
  PORT: parseInt(process.env.PORT || "5000"),
  NODE_ENV: process.env.NODE_ENV || "development",
  
  // Database
  MONGO_URI: getRequiredEnv("MONGO_URI"),
  
  // JWT
  JWT_SECRET: getRequiredEnv("JWT_SECRET") as string,
  JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN || "7d") as string,
  
  // Google OAuth
  GOOGLE_CLIENT_ID: getRequiredEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getRequiredEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
  
  // Email (for magic link)
  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || "587"),
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "noreply@taskengine.com",
  
  // Magic Link
  MAGIC_LINK_SECRET: getRequiredEnv("MAGIC_LINK_SECRET") as string,
  MAGIC_LINK_EXPIRES_IN: (process.env.MAGIC_LINK_EXPIRES_IN || "15m") as string,
  
  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
};
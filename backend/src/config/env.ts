import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "",
  MAGIC_LINK_SECRET: process.env.MAGIC_LINK_SECRET || "",
  FRONTEND_URL: process.env.FRONTEND_URL || "",
};


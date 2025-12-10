import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

// Define the payload structure
interface TokenPayload {
  userId: string;
  email: string;
}

// Generate JWT token
export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  });
};

// Generate Magic Link token
export const generateMagicLinkToken = (email: string): string => {
  return jwt.sign({ email }, ENV.MAGIC_LINK_SECRET, {
    expiresIn: ENV.MAGIC_LINK_EXPIRES_IN,
  });
};

// Verify JWT token
export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
};

// Verify Magic Link token
export const verifyMagicLinkToken = (token: string): { email: string } => {
  return jwt.verify(token, ENV.MAGIC_LINK_SECRET) as { email: string };
};
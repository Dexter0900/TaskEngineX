import jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";
import { ENV } from "../config/env.js";

// Define the payload structure
interface TokenPayload {
  userId: string;
  email: string;
}

// Magic Link Payload with user registration data
interface MagicLinkPayload {
  email: string;
  firstName: string;
  lastName: string;
  password: string; // Hashed password
}

// Generate JWT token
export const generateToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: ENV.JWT_EXPIRES_IN as any,
  };
  return jwt.sign(payload, ENV.JWT_SECRET as Secret, options);
};

// Generate Magic Link token
export const generateMagicLinkToken = (payload: MagicLinkPayload): string => {
  const options: SignOptions = {
    expiresIn: ENV.MAGIC_LINK_EXPIRES_IN as any,
  };
  return jwt.sign(payload, ENV.MAGIC_LINK_SECRET as Secret, options);
};

// Verify JWT token
export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, ENV.JWT_SECRET as Secret) as TokenPayload;
};

// Verify Magic Link token
export const verifyMagicLinkToken = (token: string): MagicLinkPayload => {
  return jwt.verify(token, ENV.MAGIC_LINK_SECRET as Secret) as MagicLinkPayload;
};
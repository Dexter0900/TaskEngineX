import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";

// Extend Request interface to include userId and userEmail
// This ensures all Request properties (body, params, query, headers, etc.) are available
export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  body: any; // Explicitly declare body
  params: any; // Explicitly declare params
  query: any; // Explicitly declare query
  headers: any; // Explicitly declare headers
}

// Middleware to authenticate JWT token
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  // Check if token is present
  if (!token) {
    res.status(401).json({ message: "Access token required" });
    return;
  }
  // Verify token
  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Export alias for workspace auth compatibility
export const authenticate = authenticateToken;

import { Request, Response } from "express";
import { User } from "../models/User.js";
import {
  generateToken,
  generateMagicLinkToken,
  verifyMagicLinkToken,
} from "../utils/jwt.js";
import { sendMagicLink } from "../utils/email.js";
import { AuthRequest } from "../middlewares/auth.js";

// Google OAuth callback
export const googleCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
    }

    // Generate JWT
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  } catch (error) {
    console.error("Google callback error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
  }
};

// Send magic link
export const sendMagicLinkEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Generate magic link token
    const token = generateMagicLinkToken(email);

    // Send email
    await sendMagicLink(email, token);

    res.json({
      message: "Magic link sent! Check your email.",
      success: true,
    });
  } catch (error) {
    console.error("Send magic link error:", error);
    res.status(500).json({ message: "Failed to send magic link" });
  }
};

// Verify magic link and login
export const verifyMagicLink = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Verify token
    const decoded = verifyMagicLinkToken(token);
    const { email } = decoded;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        email,
        name: email.split("@")[0], // Default name from email
        provider: "magic-link",
      });
    }

    // Generate JWT
    const authToken = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    res.json({
      message: "Login successful",
      token: authToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Verify magic link error:", error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

// Get current user
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("-__v");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

// Logout (client-side token removal mostly, but can blacklist tokens here)
export const logout = async (req: AuthRequest, res: Response) => {
  res.json({ message: "Logged out successfully" });
};
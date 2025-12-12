import express from "express";
import passport from "passport";
import {
  googleCallback,
  sendMagicLinkEmail,
  verifyMagicLink,
  getCurrentUser,
  logout,
} from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/auth/error" }),
  googleCallback
);

// Magic Link routes
router.post("/magic-link/send", sendMagicLinkEmail);
router.post("/magic-link/verify", verifyMagicLink);

// Protected routes
router.get("/me", authenticateToken, getCurrentUser);
router.post("/logout", authenticateToken, logout);

export default router;
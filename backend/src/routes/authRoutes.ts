import express from "express";
import passport from "passport";
import {
  googleCallback,
  signup,
  verifyMagicLink,
  login,
  getCurrentUser,
  logout,
  setPassword,
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

// Email/Password routes
router.post("/signup", signup);
router.post("/magic-link/verify", verifyMagicLink);
router.post("/login", login);

// Protected routes
router.get("/me", authenticateToken, getCurrentUser);
router.post("/set-password", authenticateToken, setPassword);
router.post("/logout", authenticateToken, logout);

export default router;
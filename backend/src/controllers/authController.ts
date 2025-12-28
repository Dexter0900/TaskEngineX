import { Request, Response } from "express";
import { User } from "../models/User.js";
import { generateToken, generateMagicLinkToken, verifyMagicLinkToken } from "../utils/jwt.js";
import { sendMagicLink } from "../utils/email.js";
import { AuthRequest } from "../middlewares/auth.js";
import bcrypt from "bcryptjs";

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

// Signup with email and password - sends magic link for verification
export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        message: "Email, password, first name, and last name are required" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If user has password, they already signed up with email
      if (existingUser.password) {
        return res.status(400).json({ 
          message: "User with this email already exists. Please login." 
        });
      }
      // If user only has Google, allow them to add password
      if (existingUser.provider.includes("google") && !existingUser.password) {
        return res.status(400).json({ 
          message: "This email is linked with Google. Use 'Set Password' to add password login.",
          code: "GOOGLE_ACCOUNT_EXISTS"
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate magic link token with user data
    const token = generateMagicLinkToken({
      email,
      firstName,
      lastName,
      password: hashedPassword,
    });

    // Send magic link email
    await sendMagicLink(email, token);

    res.json({
      message: "Verification email sent! Please check your email to complete registration.",
      success: true,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Failed to send verification email" });
  }
};

// Verify magic link and create user
export const verifyMagicLink = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Verify token and extract user data
    const decoded = verifyMagicLinkToken(token);
    const { email, firstName, lastName, password } = decoded;

    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      // If user has password already, don't allow duplicate
      if (user.password) {
        return res.status(400).json({ 
          message: "User already exists. Please login." 
        });
      }
      
      // If Google user wants to add password (account linking)
      if (user.provider.includes("google") && !user.password) {
        await User.updateOne(
          { _id: user._id },
          {
            $addToSet: { provider: "magic-link" },
            $set: { 
              password,
              firstName,
              lastName
            }
          }
        );
        
        // Fetch updated user
        user = await User.findById(user._id);
        
        if (!user) {
          return res.status(500).json({ message: "Failed to update user" });
        }
      }
    } else {
      // Create new user with verified email
      user = await User.create({
        email,
        firstName,
        lastName,
        password, // Already hashed
        provider: ["magic-link"],
      });
    }

    // Generate JWT auth token
    const authToken = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    res.status(201).json({
      message: "Email verified! Account created successfully.",
      token: authToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Verify magic link error:", error);
    res.status(400).json({ message: "Invalid or expired verification link" });
  }
};

// Login with email and password
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required" 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });
    }

    // Check if user has password (not Google-only user)
    if (!user.password) {
      return res.status(401).json({ 
        message: "This account uses Google login. Please login with Google or set a password first.",
        code: "NO_PASSWORD_SET"
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });
    }

    // Generate JWT
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to login" });
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
        firstName: user.firstName,
        lastName: user.lastName,
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

// Set password for Google-only users (account linking)
export const setPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { password, firstName, lastName } = req.body;
    
    // Validation
    if (!password) {
      return res.status(400).json({ 
        message: "Password is required" 
      });
    }
    
    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters long" 
      });
    }
    
    // Get current user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if user already has password
    if (user.password) {
      return res.status(400).json({ 
        message: "Password already set. Use change password instead." 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user with password and optionally update name
    const updateData: any = {
      password: hashedPassword,
      $addToSet: { provider: "magic-link" }
    };
    
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    
    await User.updateOne({ _id: user._id }, updateData);
    
    res.json({
      message: "Password set successfully! You can now login with email and password.",
      success: true,
    });
  } catch (error) {
    console.error("Set password error:", error);
    res.status(500).json({ message: "Failed to set password" });
  }
};
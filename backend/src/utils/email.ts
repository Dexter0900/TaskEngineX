import nodemailer from "nodemailer";
import { ENV } from "../config/env.js";

// Create transporter with error handling
let transporter: nodemailer.Transporter;

try {
  transporter = nodemailer.createTransport({
    host: ENV.EMAIL_HOST,
    port: ENV.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: ENV.EMAIL_USER,
      pass: ENV.EMAIL_PASSWORD,
    },
  });
  
  console.log("✅ Email transporter initialized");
} catch (error) {
  console.error("❌ Email transporter initialization failed:", error);
  throw error;
}

export const sendMagicLink = async (email: string, token: string) => {
  const magicLink = `${ENV.FRONTEND_URL}/auth/verify?token=${token}`;

  const mailOptions = {
    from: ENV.EMAIL_FROM,
    to: email,
    subject: "🔐 Your Magic Login Link",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to TaskEngineX! 👋</h2>
        <p>Click the button below to sign in to your account:</p>
        <a href="${magicLink}" 
           style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Sign In
        </a>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 15 minutes.
        </p>
        <p style="color: #666; font-size: 14px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Magic link sent to:", email);
  } catch (error) {
    console.error("❌ Email send failed:", error);
    throw new Error("Failed to send email");
  }
};
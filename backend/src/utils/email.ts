import { ENV } from "../config/env.js";

// Check which email service to use
const USE_SENDGRID = !!ENV.SENDGRID_API_KEY;

let sgMail: any = null;
if (USE_SENDGRID) {
  try {
    const sgMailImport = await import("@sendgrid/mail");
    sgMail = sgMailImport.default;
    sgMail.setApiKey(ENV.SENDGRID_API_KEY);
    console.log("✅ SendGrid initialized");
  } catch (error) {
    console.error("❌ SendGrid initialization failed:", error);
    console.warn("⚠️ Falling back to nodemailer");
  }
}

// Fallback to nodemailer
import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

if (!USE_SENDGRID && ENV.EMAIL_USER && ENV.EMAIL_PASSWORD) {
  try {
    transporter = nodemailer.createTransport({
      host: ENV.EMAIL_HOST,
      port: ENV.EMAIL_PORT,
      secure: true,
      auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASSWORD,
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
    });

    console.log("✅ Nodemailer transporter initialized with secure connection");
  } catch (error) {
    console.error("❌ Nodemailer transporter initialization failed:", error);
  }
} else if (!USE_SENDGRID) {
  console.warn(
    "⚠️ Email credentials not configured - email sending will be disabled"
  );
}

export const sendMagicLink = async (email: string, token: string) => {
  console.log("📧 sendMagicLink called for:", email);

  const magicLink = `${ENV.FRONTEND_URL}/auth/verify?token=${token}`;

  const htmlContent = `
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
  `;

  try {
    // Try SendGrid first
    if (USE_SENDGRID && sgMail) {
      console.log("📨 Sending via SendGrid...");
      console.log("📧 From:", ENV.EMAIL_FROM);
      console.log("📧 To:", email);

      await sgMail.send({
        to: email,
        from: {
          email: ENV.EMAIL_FROM,
          name: "TaskEngineX Team",
        },
        subject: "🔐 Your Magic Login Link",
        html: htmlContent,
      });
      console.log("✅ Email sent via SendGrid to:", email);
      return;
    }

    // Fallback to nodemailer
    if (!transporter) {
      console.warn("⚠️ Email not configured - skipping email send");
      return;
    }

    console.log("📨 Sending via Nodemailer...");
    const mailOptions = {
      from: ENV.EMAIL_FROM,
      to: email,
      subject: "🔐 Your Magic Login Link",
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent via Nodemailer to:", email);
  } catch (error: any) {
    console.error("❌ Email send failed:", error);

    // Log SendGrid specific errors
    if (error.response?.body?.errors) {
      console.error(
        "❌ SendGrid errors:",
        JSON.stringify(error.response.body.errors, null, 2)
      );
    }

    throw new Error("Failed to send email");
  }
};

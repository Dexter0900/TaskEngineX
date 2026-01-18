import { ENV } from "../config/env.js";
import { sendMagicLink } from "../utils/email.js";
import { addEmailJob } from "../config/queue.js";

/**
 * Email Service
 * - Production: Direct email send (no queue - no background workers)
 * - Development: Queue-based (for testing queue functionality)
 */

export const emailService = {
  /**
   * Send magic link email
   * - Production: Direct send
   * - Development: Queue with worker processing
   */
  async sendMagicLinkEmail(email: string, token: string) {
    const isProduction = ENV.NODE_ENV === "production";

    console.log(
      `📧 [EMAIL SERVICE] Sending magic link via ${isProduction ? "DIRECT" : "QUEUE"}`,
    );

    try {
      if (isProduction) {
        // Production: Direct send (no queue needed - single instance)
        console.log(`⚡ [EMAIL] Direct send to ${email}`);
        await sendMagicLink(email, token);
        console.log(`✅ [EMAIL] Direct send successful for ${email}`);
      } else {
        // Development: Use queue for testing
        console.log(`📤 [EMAIL] Queuing job for ${email}`);
        await addEmailJob(email, token, "magic-link");
        console.log(`✅ [EMAIL] Job queued for ${email}`);
      }

      return { success: true };
    } catch (error) {
      console.error(`❌ [EMAIL] Failed to send to ${email}:`, error);
      throw error;
    }
  },
};

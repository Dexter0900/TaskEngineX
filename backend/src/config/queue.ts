import Queue from "bull";
import { ENV } from "./env.js";
import { sendMagicLink } from "../utils/email.js";

// Redis configuration
const REDIS_CONFIG = {
  host: ENV.REDIS_HOST || "localhost",
  port: ENV.REDIS_PORT || "6379",
  ...(ENV.REDIS_PASSWORD && { password: ENV.REDIS_PASSWORD }),
};

console.log(
  "🔌 Queue connecting to Redis at:",
  REDIS_CONFIG.host,
  REDIS_CONFIG.port,
);

// Create email queue
export const emailQueue = new Queue("email", REDIS_CONFIG);

// Queue event listeners
emailQueue.on("completed", (job) => {
  console.log(`✅ [QUEUE] Email job ${job.id} completed for ${job.data.email}`);
});

emailQueue.on("failed", (job, err) => {
  console.error(`❌ [QUEUE] Email job ${job.id} failed:`, err.message);
});

emailQueue.on("error", (error) => {
  console.error("❌ [QUEUE] Queue error:", error);
});

// Process email jobs
emailQueue.process(async (job) => {
  const { email, token, type } = job.data;
  console.log(`📨 [QUEUE] Processing email job for ${email}`);

  try {
    switch (type) {
      case "magic-link":
        await sendMagicLink(email, token);
        break;
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    return { success: true, email };
  } catch (error) {
    console.error(`❌ [QUEUE] Error sending email to ${email}:`, error);
    throw error;
  }
});

// Add job to email queue with retry logic
export const addEmailJob = async (
  email: string,
  token: string,
  type: string = "magic-link",
) => {
  try {
    const job = await emailQueue.add(
      { email, token, type },
      {
        attempts: 3, // Retry 3 times if fails
        backoff: {
          type: "exponential",
          delay: 2000, // Start with 2 seconds, exponentially increase
        },
        removeOnComplete: true, // Remove job after successful completion
        removeOnFail: false, // Keep failed jobs for debugging
      },
    );

    console.log(`📤 [QUEUE] Email job added with ID: ${job.id}`);
    return job;
  } catch (error) {
    console.error("❌ [QUEUE] Failed to add email job:", error);
    throw error;
  }
};

// Graceful shutdown
export const closeQueue = async () => {
  try {
    await emailQueue.close();
    console.log("🔴 [QUEUE] Email queue closed");
  } catch (error) {
    console.error("❌ [QUEUE] Error closing queue:", error);
  }
};

import Queue from "bull";
import { ENV } from "./env.js";
import { sendMagicLink } from "../utils/email.js";

/**
 * EMAIL QUEUE - Development Only
 * Production uses direct email send (no queue needed)
 */

let emailQueue: Queue.Queue<any> | null = null;

// Initialize queue only in development
if (ENV.NODE_ENV === "development") {
  emailQueue = ENV.REDIS_URL
    ? new Queue("email", ENV.REDIS_URL, {
        redis: {
          tls: {},
        },
      })
    : new Queue("email", {
        redis: {
          host: ENV.REDIS_HOST || "127.0.0.1",
          port: Number(ENV.REDIS_PORT) || 6379,
        },
      });

  console.log(
    "🔌 [QUEUE] Connected to:",
    ENV.REDIS_URL ? "Upstash Redis" : "Local Redis",
  );

  // Queue event listeners
  emailQueue.on("completed", (job) => {
    console.log(`✅ [QUEUE] Job ${job.id} completed for ${job.data.email}`);
  });

  emailQueue.on("failed", (job, err) => {
    console.error(`❌ [QUEUE] Job ${job?.id} failed:`, err.message);
  });

  emailQueue.on("error", (error) => {
    console.error("❌ [QUEUE] Redis error:", error.message);
  });
}

/**
 * Start email worker
 */
let workerStarted = false;

export const startEmailWorker = () => {
  if (workerStarted || !emailQueue) return;
  workerStarted = true;

  console.log("🚀 [QUEUE] Email worker started");

  emailQueue!.process(async (job) => {
    const { email, token, type } = job.data;
    console.log(`📨 [QUEUE] Processing job ${job.id} - sending to ${email}`);

    switch (type) {
      case "magic-link":
        await sendMagicLink(email, token);
        break;
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    return { success: true };
  });
};

/**
 * Add job to queue (dev only)
 */
export const addEmailJob = async (
  email: string,
  token: string,
  type: string = "magic-link",
) => {
  if (!emailQueue) {
    throw new Error("[QUEUE] Queue not initialized (production mode)");
  }

  try {
    const job = await emailQueue.add(
      { email, token, type },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    console.log(`📤 [QUEUE] Job ${job.id} added for ${email}`);
    return job;
  } catch (error) {
    console.error("❌ [QUEUE] Failed to add job:", error);
    throw error;
  }
};

/**
 * Close queue
 */
export const closeQueue = async () => {
  if (!emailQueue) return;

  try {
    await emailQueue.close();
    console.log("🔴 [QUEUE] Queue closed");
  } catch (error) {
    console.error("❌ [QUEUE] Error closing queue:", error);
  }
};

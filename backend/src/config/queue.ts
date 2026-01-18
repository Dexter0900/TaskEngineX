import Queue from "bull";
import { ENV } from "./env.js";
import { sendMagicLink } from "../utils/email.js";

/**
 * -----------------------------------------
 * Redis / Queue connection
 * -----------------------------------------
 */

export const emailQueue = ENV.REDIS_URL
  ? new Queue("email", ENV.REDIS_URL, {
      redis: {
        tls: {}, // REQUIRED for rediss:// (Upstash)
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

/**
 * -----------------------------------------
 * Queue event listeners
 * -----------------------------------------
 */

emailQueue.on("completed", (job) => {
  console.log(
    `✅ [QUEUE] Job ${job.id} completed for ${job.data.email}`,
  );
});

emailQueue.on("failed", (job, err) => {
  console.error(
    `❌ [QUEUE] Job ${job?.id} failed:`,
    err.message,
  );
});

emailQueue.on("error", (error) => {
  console.error("❌ [QUEUE] Redis connection error:", error.message);
});

/**
 * -----------------------------------------
 * Worker (job processor)
 * ⚠️ Should ideally run in separate process
 * -----------------------------------------
 */

let workerRegistered = false;

export const startEmailWorker = () => {
  if (workerRegistered) return;
  workerRegistered = true;

  emailQueue.process(async (job) => {
    const { email, token, type } = job.data;

    console.log(`📨 [QUEUE] Processing email for ${email}`);

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
 * -----------------------------------------
 * Add job to queue
 * -----------------------------------------
 */

export const addEmailJob = async (
  email: string,
  token: string,
  type: "magic-link" = "magic-link",
) => {
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

  console.log(`📤 [QUEUE] Job added: ${job.id}`);
  return job;
};

/**
 * -----------------------------------------
 * Graceful shutdown
 * -----------------------------------------
 */

export const closeQueue = async () => {
  await emailQueue.close();
  console.log("🔴 [QUEUE] Queue closed");
};

import mongoose from "mongoose";
import { ENV } from "./env";

// function to connect MongoDB
export const connectDB = async () => {
  try {
    // mongoose connect returns a promise
    await mongoose.connect(ENV.MONGO_URI);

    console.log("🔥 MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // exit process if db fails
  }
};
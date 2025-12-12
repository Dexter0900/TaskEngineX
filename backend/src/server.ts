import app from "./app.js";
import { connectDB } from "./config/db.js";
import { ENV } from "./config/env.js";

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start server
    app.listen(ENV.PORT, () => {
      console.log(`✅ Server running on http://localhost:${ENV.PORT}`);
      console.log(`📝 Environment: ${ENV.NODE_ENV}`);
    });
  } catch (error) {
    console.error("❌ Server start failed:", error);
    process.exit(1);
  }
};

startServer();
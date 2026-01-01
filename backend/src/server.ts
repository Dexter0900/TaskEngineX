import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { ENV } from "./config/env.js";
import { initializeSocket } from "./config/socket.js";

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Create HTTP server
    const httpServer = http.createServer(app);

    // Initialize Socket.IO
    const io = initializeSocket(httpServer);

    // Start server
    httpServer.listen(ENV.PORT, () => {
      console.log(`✅ Server running on http://localhost:${ENV.PORT}`);
      console.log(`🔌 WebSocket ready on ws://localhost:${ENV.PORT}`);
      console.log(`📝 Environment: ${ENV.NODE_ENV}`);
    });
  } catch (error) {
    console.error("❌ Server start failed:", error);
    process.exit(1);
  }
};

startServer();
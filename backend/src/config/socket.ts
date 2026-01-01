// src/config/socket.ts
import { Server, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { ENV } from "./env.js";

/**
 * SOCKET.IO CONFIGURATION
 * Real-time task updates ke liye
 */

// Type definitions
interface JoinData {
  userId: string;
}

interface TaskEventData {
  taskId: string;
  userId: string;
  [key: string]: any;
}

/**
 * INITIALIZE SOCKET.IO
 * Express server ke saath attach karta
 */
export const initializeSocket = (httpServer: HTTPServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: ENV.FRONTEND_URL,
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Middleware - Token verification
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    const userId = socket.handshake.auth.userId;

    if (!token || !userId) {
      return next(new Error("Authentication error"));
    }

    // Attach user info to socket
    socket.data.userId = userId;
    socket.data.token = token;

    next();
  });

  /**
   * CONNECTION EVENT
   * Jab user connect kare
   */
  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`✅ User connected: ${userId} (socket: ${socket.id})`);

    /**
     * JOIN ROOM
     * User ka personal room join karta for personal updates
     */
    socket.on("join", (data: JoinData) => {
      const room = `user:${data.userId}`;
      socket.join(room);
      console.log(`👤 ${data.userId} joined room ${room}`);
    });

    /**
     * TASK EVENTS
     * Task ke changes ko broadcast karta
     */

    // Task Created
    socket.on("task:create", (data: TaskEventData) => {
      if (data.userId !== userId) return; // Security check

      const room = `user:${userId}`;
      io.to(room).emit("task:created", {
        ...data,
        timestamp: new Date().toISOString(),
      });
      console.log(`📝 Task created by ${userId}:`, data.taskId);
    });

    // Task Updated
    socket.on("task:update", (data: TaskEventData) => {
      if (data.userId !== userId) return;

      const room = `user:${userId}`;
      io.to(room).emit("task:updated", {
        ...data,
        timestamp: new Date().toISOString(),
      });
      console.log(`✏️ Task updated by ${userId}:`, data.taskId);
    });

    // Task Deleted
    socket.on("task:delete", (data: TaskEventData) => {
      if (data.userId !== userId) return;

      const room = `user:${userId}`;
      io.to(room).emit("task:deleted", {
        ...data,
        timestamp: new Date().toISOString(),
      });
      console.log(`🗑️ Task deleted by ${userId}:`, data.taskId);
    });

    // Task Status Changed
    socket.on("task:statusChange", (data: TaskEventData) => {
      if (data.userId !== userId) return;

      const room = `user:${userId}`;
      io.to(room).emit("task:statusChanged", {
        ...data,
        timestamp: new Date().toISOString(),
      });
      console.log(`🔄 Task status changed by ${userId}:`, data.taskId);
    });

    /**
     * SUBTASK EVENTS
     */

    // Subtask Created
    socket.on("subtask:create", (data: TaskEventData) => {
      if (data.userId !== userId) return;

      const room = `user:${userId}`;
      io.to(room).emit("subtask:created", {
        ...data,
        timestamp: new Date().toISOString(),
      });
      console.log(`➕ Subtask created by ${userId}:`, data.taskId);
    });

    // Subtask Toggled
    socket.on("subtask:toggle", (data: TaskEventData) => {
      if (data.userId !== userId) return;

      const room = `user:${userId}`;
      io.to(room).emit("subtask:toggled", {
        ...data,
        timestamp: new Date().toISOString(),
      });
      console.log(`☑️ Subtask toggled by ${userId}:`, data.taskId);
    });

    // Subtask Deleted
    socket.on("subtask:delete", (data: TaskEventData) => {
      if (data.userId !== userId) return;

      const room = `user:${userId}`;
      io.to(room).emit("subtask:deleted", {
        ...data,
        timestamp: new Date().toISOString(),
      });
      console.log(`❌ Subtask deleted by ${userId}:`, data.taskId);
    });

    /**
     * DISCONNECT EVENT
     * Jab user disconnect kare
     */
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${userId} (socket: ${socket.id})`);
    });

    /**
     * ERROR HANDLING
     */
    socket.on("error", (error) => {
      console.error(`⚠️ Socket error for ${userId}:`, error);
    });
  });

  return io;
};

export default initializeSocket;

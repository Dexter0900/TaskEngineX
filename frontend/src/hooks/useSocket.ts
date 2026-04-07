// src/hooks/useSocket.ts
import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { io, Socket } from "socket.io-client";

/**
 * USE SOCKET HOOK
 * Socket.IO connection manage karta
 */
export const useSocket = () => {
  const { user, token } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to socket only if user is authenticated
    if (!user || !token) return;

    // Derive socket URL from API URL, but remove /api if present
    const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const socketUrl = rawApiUrl.replace(/\/api\/?$/, "");

    socketRef.current = io(socketUrl, {
      auth: {
        token,
        userId: user.id,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connect event
    socketRef.current.on("connect", () => {
      console.log("✅ Socket connected:", socketRef.current?.id);
      socketRef.current?.emit("join", { userId: user.id });
    });

    // Disconnect event
    socketRef.current.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    // Error event
    socketRef.current.on("error", (error) => {
      console.error("⚠️ Socket error:", error);
    });

    // Cleanup
    return () => {
      socketRef.current?.disconnect();
    };
  }, [user, token]);

  return socketRef.current;
};

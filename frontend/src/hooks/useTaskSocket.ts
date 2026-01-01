// src/hooks/useTaskSocket.ts
import { useEffect } from "react";
import { useSocket } from "./useSocket";
import { useAuth } from "../context/AuthContext";

/**
 * USE TASK SOCKET HOOK
 * Task real-time updates ke liye
 */

interface TaskSocketHandlers {
  onTaskCreated?: (data: any) => void;
  onTaskUpdated?: (data: any) => void;
  onTaskDeleted?: (data: any) => void;
  onTaskStatusChanged?: (data: any) => void;
  onSubtaskCreated?: (data: any) => void;
  onSubtaskToggled?: (data: any) => void;
  onSubtaskDeleted?: (data: any) => void;
}

export const useTaskSocket = (handlers: TaskSocketHandlers) => {
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket || !user) return;

    // Task Events
    if (handlers.onTaskCreated) {
      socket.on("task:created", handlers.onTaskCreated);
    }

    if (handlers.onTaskUpdated) {
      socket.on("task:updated", handlers.onTaskUpdated);
    }

    if (handlers.onTaskDeleted) {
      socket.on("task:deleted", handlers.onTaskDeleted);
    }

    if (handlers.onTaskStatusChanged) {
      socket.on("task:statusChanged", handlers.onTaskStatusChanged);
    }

    // Subtask Events
    if (handlers.onSubtaskCreated) {
      socket.on("subtask:created", handlers.onSubtaskCreated);
    }

    if (handlers.onSubtaskToggled) {
      socket.on("subtask:toggled", handlers.onSubtaskToggled);
    }

    if (handlers.onSubtaskDeleted) {
      socket.on("subtask:deleted", handlers.onSubtaskDeleted);
    }

    // Cleanup
    return () => {
      socket.off("task:created");
      socket.off("task:updated");
      socket.off("task:deleted");
      socket.off("task:statusChanged");
      socket.off("subtask:created");
      socket.off("subtask:toggled");
      socket.off("subtask:deleted");
    };
  }, [socket, user, handlers]);

  // Function to emit events
  const emitTaskEvent = (event: string, data: any) => {
    if (socket) {
      socket.emit(event, data);
    }
  };

  return { emitTaskEvent, socket };
};

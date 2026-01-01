// src/types/index.ts

/**
 * USER TYPES
 * Backend se jo user data aata hai
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: "google" | "magic-link";
}

/**
 * AUTH RESPONSE TYPES
 * Login/Verify APIs se response
 */
export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface MagicLinkResponse {
  message: string;
  success: boolean;
}

/**
 * TASK TYPES
 * Task ka complete structure
 */
export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate?: string;  // ISO date string
  tags?: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * SUBTASK TYPES
 * Subtask ka structure
 */
export interface Subtask {
  _id: string;
  taskId: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * TASK API RESPONSES
 */
export interface TasksResponse {
  message: string;
  total: number;
  tasks: Task[];
}

export interface SingleTaskResponse {
  message: string;
  task: Task;
}

export interface TaskStatsResponse {
  message: string;
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    highPriority: number;
  };
}

/**
 * SUBTASK API RESPONSES
 */
export interface SubtasksResponse {
  success: boolean;
  subtasks: Subtask[];
  count: number;
}

export interface SingleSubtaskResponse {
  success: boolean;
  message: string;
  subtask: Subtask;
}

/**
 * API ERROR TYPE
 * Jab error aaye toh ye structure
 */
export interface ApiError {
  message: string;
  errors?: any;
}

/**
 * AUTH CONTEXT TYPE
 * Context mein kya-kya available hai
 */
export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}
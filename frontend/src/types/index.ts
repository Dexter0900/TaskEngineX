// src/types/index.ts

/**
 * USER TYPES
 * Backend se jo user data aata hai
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  provider: ("google" | "magic-link")[];
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
 * SIGNUP DATA
 * Signup form ka data
 */
export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * LOGIN DATA
 * Login form ka data
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * SET PASSWORD DATA
 * Google users ke liye password set karne ka data
 */
export interface SetPasswordData {
  password: string;
  firstName?: string;
  lastName?: string;
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
  dueDate?: string; // ISO date string
  tags?: string[];
  userId: string;
  // Workspace task fields
  workspaceId?: string | null;
  projectId?: string | null;
  assignedTo?: string | null;
  assignedBy?: string | null;
  approvalStatus?: "pending-approval" | "approved" | "rejected" | null;
  completedAt?: string | null;
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
    lowPriority: number;
    mediumPriority: number;
    highPriority: number;
  };
}

/**
 * WORKSPACE TYPES
 * Workspace and related structures
 */
export interface WorkspaceUser {
  userId: string;
  role: "admin" | "assigner" | "worker";
  joinedAt: string;
}

export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  creator: string | User;
  members: WorkspaceUser[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkspacesResponse {
  message: string;
  workspaces: Workspace[];
}

/**
 * PROJECT TYPES
 * Project and related structures
 */
export interface ProjectMember {
  userId: string | User;
  role: "assigner" | "worker";
}

export interface Project {
  _id: string;
  workspaceId: string;
  name: string;
  description?: string;
  status: "active" | "archived";
  assigners: ProjectMember[];
  workers: ProjectMember[];
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsResponse {
  message: string;
  projects: Project[];
}

/**
 * WORKSPACE TASK STATS
 * Stats for workspace tasks (includes approval status)
 */
export interface WorkspaceTaskStatsResponse {
  message: string;
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    pendingApproval: number;
    approved: number;
    rejected: number;
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

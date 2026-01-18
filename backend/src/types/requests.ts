/**
 * Request body types for controllers
 */

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyMagicLinkRequest {
  token: string;
}

export interface SetPasswordRequest {
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  tags?: string[];
}

export interface CreateSubtaskRequest {
  title: string;
}

export interface UpdateSubtaskRequest {
  title?: string;
}

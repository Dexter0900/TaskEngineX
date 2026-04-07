// src/api/workspaceApi.ts
import axios from "./axios";
import type {
  Workspace,
  WorkspacesResponse,
  SingleTaskResponse,
  WorkspaceTaskStatsResponse,
} from "../types";

const API_BASE = "/api";

/**
 * GET ALL WORKSPACES
 * User ke sab workspaces fetch karta
 */
export const getAllWorkspaces = async (): Promise<WorkspacesResponse> => {
  const response = await axios.get(`${API_BASE}/workspaces`);
  return response.data;
};

/**
 * GET WORKSPACE DETAILS
 * Single workspace ki details fetch karta
 */
export const getWorkspaceDetails = async (
  workspaceId: string
): Promise<{ message: string; workspace: Workspace }> => {
  const response = await axios.get(`${API_BASE}/workspaces/${workspaceId}`);
  return response.data;
};

/**
 * CREATE WORKSPACE
 * Naya workspace create karta
 */
export const createWorkspace = async (data: {
  name: string;
  description?: string;
}): Promise<{ message: string; workspace: Workspace }> => {
  const response = await axios.post(`${API_BASE}/workspaces`, data);
  return response.data;
};

/**
 * UPDATE WORKSPACE
 * Workspace ko update karta (admin only)
 */
export const updateWorkspace = async (
  workspaceId: string,
  data: {
    name?: string;
    description?: string;
  }
): Promise<{ message: string; workspace: Workspace }> => {
  const response = await axios.put(
    `${API_BASE}/workspaces/${workspaceId}`,
    data
  );
  return response.data;
};

/**
 * DELETE WORKSPACE
 * Workspace ko delete karta (admin only)
 */
export const deleteWorkspace = async (
  workspaceId: string
): Promise<{ message: string }> => {
  const response = await axios.delete(`${API_BASE}/workspaces/${workspaceId}`);
  return response.data;
};

/**
 * ADD WORKSPACE MEMBER
 * Workspace mein member add karta (admin only)
 */
export const addWorkspaceMember = async (
  workspaceId: string,
  data: {
    email: string;
    role: "admin" | "assigner" | "worker";
  }
): Promise<{ message: string; workspace: Workspace }> => {
  const response = await axios.post(
    `${API_BASE}/workspaces/${workspaceId}/members`,
    data
  );
  return response.data;
};

/**
 * UPDATE MEMBER ROLE
 * Member ki role ko change karta (admin only)
 */
export const updateMemberRole = async (
  workspaceId: string,
  userId: string,
  data: {
    role: "admin" | "assigner" | "worker";
  }
): Promise<{ message: string; workspace: Workspace }> => {
  const response = await axios.patch(
    `${API_BASE}/workspaces/${workspaceId}/members/${userId}/role`,
    data
  );
  return response.data;
};

/**
 * REMOVE MEMBER FROM WORKSPACE
 * Member ko workspace se remove karta (admin only)
 */
export const removeWorkspaceMember = async (
  workspaceId: string,
  userId: string
): Promise<{ message: string; workspace: Workspace }> => {
  const response = await axios.delete(
    `${API_BASE}/workspaces/${workspaceId}/members/${userId}`
  );
  return response.data;
};

/**
 * GET WORKSPACE TASKS
 * Workspace mein sab tasks fetch karta (role-filtered)
 */
export const getWorkspaceTasks = async (
  workspaceId: string,
  filters?: {
    status?: string;
    priority?: string;
    search?: string;
    sort?: string;
  }
): Promise<any> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.priority) params.append("priority", filters.priority);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.sort) params.append("sort", filters.sort);

  const response = await axios.get(
    `${API_BASE}/workspaces/${workspaceId}/tasks?${params.toString()}`
  );
  return response.data;
};

/**
 * GET WORKSPACE TASK STATS
 * Workspace task statistics (role-filtered)
 */
export const getWorkspaceTaskStats = async (
  workspaceId: string
): Promise<WorkspaceTaskStatsResponse> => {
  const response = await axios.get(
    `${API_BASE}/workspaces/${workspaceId}/tasks/stats`
  );
  return response.data;
};

/**
 * MARK TASK COMPLETE
 * Worker task ko mark complete karta
 */
export const markTaskComplete = async (
  taskId: string
): Promise<SingleTaskResponse> => {
  const response = await axios.patch(`${API_BASE}/tasks/${taskId}/mark-complete`);
  return response.data;
};

/**
 * APPROVE OR REJECT TASK
 * Assigner task ko approve/reject karta
 */
export const approveTask = async (
  taskId: string,
  data: {
    action: "approve" | "reject";
    feedback?: string;
  }
): Promise<SingleTaskResponse> => {
  const response = await axios.patch(
    `${API_BASE}/tasks/${taskId}/approval`,
    data
  );
  return response.data;
};

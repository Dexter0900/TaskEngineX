// src/api/taskApi.ts
import axiosInstance from "./axios";
import type {
  Task,
  TasksResponse,
  SingleTaskResponse,
  TaskStatsResponse,
} from "../types";

/**
 * CREATE TASK
 * Naya task banata hai
 */
export const createTask = async (taskData: {
  title: string;
  description?: string;
  status?: "pending" | "in-progress" | "completed";
  priority?: "low" | "medium" | "high";
  dueDate?: string;
  tags?: string[];
}): Promise<SingleTaskResponse> => {
  const response = await axiosInstance.post("/tasks", taskData);
  return response.data;
};

/**
 * GET ALL TASKS
 * User ke saare tasks fetch karta (with filters)
 * 
 * @param filters - Optional filters
 * @returns Tasks array with count
 */
export const getAllTasks = async (filters?: {
  status?: string;
  priority?: string;
  search?: string;
  sort?: string;
}): Promise<TasksResponse> => {
  // Query params banao
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.priority) params.append("priority", filters.priority);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.sort) params.append("sort", filters.sort);

  const response = await axiosInstance.get(
    `/tasks${params.toString() ? `?${params.toString()}` : ""}`
  );
  return response.data;
};

/**
 * GET SINGLE TASK
 * Ek specific task fetch karta
 */
export const getTaskById = async (id: string): Promise<SingleTaskResponse> => {
  const response = await axiosInstance.get(`/tasks/${id}`);
  return response.data;
};

/**
 * UPDATE TASK
 * Task ko update karta
 */
export const updateTask = async (
  id: string,
  updates: Partial<Task>
): Promise<SingleTaskResponse> => {
  const response = await axiosInstance.put(`/tasks/${id}`, updates);
  return response.data;
};

/**
 * DELETE TASK
 * Task ko delete karta
 */
export const deleteTask = async (
  id: string
): Promise<{ message: string; taskId: string }> => {
  const response = await axiosInstance.delete(`/tasks/${id}`);
  return response.data;
};

/**
 * TOGGLE TASK STATUS
 * Quick complete/incomplete
 */
export const toggleTaskStatus = async (
  id: string
): Promise<SingleTaskResponse> => {
  const response = await axiosInstance.patch(`/tasks/${id}/toggle`);
  return response.data;
};

/**
 * GET TASK STATS
 * Dashboard ke liye statistics
 */
export const getTaskStats = async (): Promise<TaskStatsResponse> => {
  const response = await axiosInstance.get("/tasks/stats");
  return response.data;
};
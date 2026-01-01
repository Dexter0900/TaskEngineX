// src/api/subtaskApi.ts
import axiosInstance from "./axios";
import type { SubtasksResponse, SingleSubtaskResponse } from "../types";

/**
 * GET ALL SUBTASKS
 * Ek task ke saare subtasks fetch karta
 */
export const getSubtasks = async (taskId: string): Promise<SubtasksResponse> => {
  const response = await axiosInstance.get(`/tasks/${taskId}/subtasks`);
  return response.data;
};

/**
 * CREATE SUBTASK
 * Naya subtask banata
 */
export const createSubtask = async (
  taskId: string,
  title: string
): Promise<SingleSubtaskResponse> => {
  const response = await axiosInstance.post(`/tasks/${taskId}/subtasks`, { title });
  return response.data;
};

/**
 * TOGGLE SUBTASK
 * Subtask ko complete/incomplete toggle karta
 */
export const toggleSubtask = async (
  taskId: string,
  subtaskId: string
): Promise<SingleSubtaskResponse> => {
  const response = await axiosInstance.patch(
    `/tasks/${taskId}/subtasks/${subtaskId}/toggle`
  );
  return response.data;
};

/**
 * UPDATE SUBTASK
 * Subtask ka title update karta
 */
export const updateSubtask = async (
  taskId: string,
  subtaskId: string,
  title: string
): Promise<SingleSubtaskResponse> => {
  const response = await axiosInstance.put(`/tasks/${taskId}/subtasks/${subtaskId}`, {
    title,
  });
  return response.data;
};

/**
 * DELETE SUBTASK
 * Subtask delete karta
 */
export const deleteSubtask = async (
  taskId: string,
  subtaskId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
  return response.data;
};

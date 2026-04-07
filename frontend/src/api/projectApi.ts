// src/api/projectApi.ts
import axios from "./axios";
import type { Project, ProjectsResponse } from "../types";

const API_BASE = "/api";

/**
 * GET WORKSPACE PROJECTS
 * Workspace mein sab projects fetch karta
 */
export const getWorkspaceProjects = async (
  workspaceId: string
): Promise<ProjectsResponse> => {
  const response = await axios.get(
    `${API_BASE}/workspaces/${workspaceId}/projects`
  );
  return response.data;
};

/**
 * GET PROJECT DETAILS
 * Single project ki details fetch karta
 */
export const getProjectDetails = async (
  workspaceId: string,
  projectId: string
): Promise<{ message: string; project: Project }> => {
  const response = await axios.get(
    `${API_BASE}/workspaces/${workspaceId}/projects/${projectId}`
  );
  return response.data;
};

/**
 * CREATE PROJECT
 * Naya project create karta (admin/assigner)
 */
export const createProject = async (
  workspaceId: string,
  data: {
    name: string;
    description?: string;
  }
): Promise<{ message: string; project: Project }> => {
  const response = await axios.post(
    `${API_BASE}/workspaces/${workspaceId}/projects`,
    data
  );
  return response.data;
};

/**
 * UPDATE PROJECT
 * Project ko update karta (admin/assigner)
 */
export const updateProject = async (
  workspaceId: string,
  projectId: string,
  data: {
    name?: string;
    description?: string;
    status?: "active" | "archived";
  }
): Promise<{ message: string; project: Project }> => {
  const response = await axios.put(
    `${API_BASE}/workspaces/${workspaceId}/projects/${projectId}`,
    data
  );
  return response.data;
};

/**
 * DELETE PROJECT
 * Project ko delete karta (admin only)
 */
export const deleteProject = async (
  workspaceId: string,
  projectId: string
): Promise<{ message: string }> => {
  const response = await axios.delete(
    `${API_BASE}/workspaces/${workspaceId}/projects/${projectId}`
  );
  return response.data;
};

/**
 * ADD ASSIGNER TO PROJECT
 * Project mein assigner add karta (admin only)
 */
export const addProjectAssigner = async (
  workspaceId: string,
  projectId: string,
  data: {
    email: string;
  }
): Promise<{ message: string; project: Project }> => {
  const response = await axios.post(
    `${API_BASE}/workspaces/${workspaceId}/projects/${projectId}/assigners`,
    data
  );
  return response.data;
};

/**
 * ADD WORKER TO PROJECT
 * Project mein worker add karta (admin/assigner)
 */
export const addProjectWorker = async (
  workspaceId: string,
  projectId: string,
  data: {
    email: string;
  }
): Promise<{ message: string; project: Project }> => {
  const response = await axios.post(
    `${API_BASE}/workspaces/${workspaceId}/projects/${projectId}/workers`,
    data
  );
  return response.data;
};

/**
 * REMOVE PROJECT MEMBER
 * Project se member remove karta (admin only)
 */
export const removeProjectMember = async (
  workspaceId: string,
  projectId: string,
  data: {
    userId: string;
    role: "assigner" | "worker";
  }
): Promise<{ message: string; project: Project }> => {
  const response = await axios.delete(
    `${API_BASE}/workspaces/${workspaceId}/projects/${projectId}/members`,
    { data }
  );
  return response.data;
};

/**
 * CREATE WORKSPACE TASK
 * Project mein task create karta (assigner only)
 */
export const createWorkspaceTask = async (
  workspaceId: string,
  projectId: string,
  data: {
    title: string;
    description?: string;
    priority?: "low" | "medium" | "high";
    dueDate?: string;
    tags?: string[];
    assignedTo: string;
  }
): Promise<{ message: string; task: any }> => {
  const response = await axios.post(
    `${API_BASE}/workspaces/${workspaceId}/projects/${projectId}/tasks`,
    data
  );
  return response.data;
};

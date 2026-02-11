// src/routes/taskRoutes.ts
import express from "express";
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  getTaskStats,
  createWorkspaceTask,
  getWorkspaceTasks,
  markTaskComplete,
  approveTask,
  getWorkspaceTaskStats,
} from "../controllers/taskController.js";
import { deleteAllSubtaskOfTask } from "../controllers/subtaskController.js";
import { authenticate } from "../middlewares/auth.js";
import {
  verifyWorkspaceMember,
  verifyWorkspaceAssigner,
  verifyProjectMember,
} from "../middlewares/workspaceAuth.js";

const router = express.Router();

/**
 * IMPORTANT: Saari routes protected hain
 * Matlab: Sabse pehle authenticateToken middleware chalega
 * Agar JWT token valid nahi toh 401 Unauthorized error
 */

// ============================================
// TASK STATS ROUTE (Sabse pehle define karo)
// ============================================
// GET /api/tasks/stats
// Why first? Agar last mein rakha toh "/stats" ko ":id" samajh lega
router.get("/stats", authenticate, getTaskStats);

// ============================================
// CRUD ROUTES
// ============================================

/**
 * CREATE TASK
 * POST /api/tasks
 * Body: {
 *   title: "Complete project",
 *   description: "Finish the backend API",
 *   priority: "high",
 *   dueDate: "2024-12-31",
 *   tags: ["work", "urgent"]
 * }
 */
router.post("/", authenticate, createTask);

/**
 * GET ALL TASKS
 * GET /api/tasks
 * Query params (all optional):
 *   ?status=pending          - Filter by status
 *   ?priority=high           - Filter by priority
 *   ?search=project          - Search in title/description
 *   ?sort=-createdAt         - Sort order (-createdAt = newest first)
 *
 * Examples:
 *   GET /api/tasks
 *   GET /api/tasks?status=completed
 *   GET /api/tasks?priority=high&status=pending
 *   GET /api/tasks?search=urgent
 */
router.get("/", authenticate, getAllTasks);

/**
 * GET SINGLE TASK
 * GET /api/tasks/:id
 * Params: id (MongoDB ObjectId)
 * Example: GET /api/tasks/65f1234567890abcdef12345
 */
router.get("/:id", authenticate, getTaskById);

/**
 * UPDATE TASK
 * PUT /api/tasks/:id
 * Params: id
 * Body: {
 *   title?: "Updated title",
 *   description?: "Updated description",
 *   status?: "in-progress",
 *   priority?: "medium",
 *   dueDate?: "2024-12-25",
 *   tags?: ["personal"]
 * }
 * Note: Saari fields optional hain, jo bheji wo update hongi
 */
router.put("/:id", authenticate, updateTask);

/**
 * DELETE TASK
 * DELETE /api/tasks/:id
 * Params: id
 * Example: DELETE /api/tasks/65f1234567890abcdef12345
 */
router.delete("/:id", authenticate, deleteAllSubtaskOfTask, deleteTask);

// ============================================
// SPECIAL ROUTES
// ============================================

/**
 * TOGGLE TASK STATUS (Quick action)
 * PATCH /api/tasks/:id/toggle
 * Params: id
 *
 * What it does:
 *   - If status is "completed" → change to "pending"
 *   - If status is "pending" or "in-progress" → change to "completed"
 *
 * Example: PATCH /api/tasks/65f123.../toggle
 */
router.patch("/:id/toggle", authenticate, toggleTaskStatus);

// ============================================
// WORKSPACE TASK ROUTES
// ============================================

/**
 * GET WORKSPACE TASK STATS
 * GET /api/workspaces/:workspaceId/tasks/stats
 * Role-based stats for workspace tasks
 */
router.get(
  "/workspaces/:workspaceId/tasks/stats",
  authenticate,
  verifyWorkspaceMember,
  getWorkspaceTaskStats,
);

/**
 * CREATE WORKSPACE TASK
 * POST /api/workspaces/:workspaceId/projects/:projectId/tasks
 * Only assigners can create tasks
 */
router.post(
  "/workspaces/:workspaceId/projects/:projectId/tasks",
  authenticate,
  verifyWorkspaceMember,
  verifyWorkspaceAssigner,
  verifyProjectMember,
  createWorkspaceTask,
);

/**
 * GET WORKSPACE TASKS
 * GET /api/workspaces/:workspaceId/tasks
 * Role-based filtering (workers see only assigned, assigners see their tasks)
 */
router.get(
  "/workspaces/:workspaceId/tasks",
  authenticate,
  verifyWorkspaceMember,
  getWorkspaceTasks,
);

/**
 * MARK TASK AS COMPLETE (Worker workflow)
 * PATCH /api/tasks/:id/mark-complete
 * Worker marks task as done, sends to pending-approval
 */
router.patch("/:id/mark-complete", authenticate, markTaskComplete);

/**
 * APPROVE/REJECT TASK (Assigner workflow)
 * PATCH /api/tasks/:id/approval
 * Body: { action: "approve" | "reject", feedback?: "string" }
 */
router.patch("/:id/approval", authenticate, approveTask);

export default router;

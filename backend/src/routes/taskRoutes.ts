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
} from "../controllers/taskController.js";
import { deleteAllSubtaskOfTask } from "../controllers/subtaskController.js";
import { authenticateToken } from "../middlewares/auth.js";

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
router.get("/stats", authenticateToken, getTaskStats);

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
router.post("/", authenticateToken, createTask);

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
router.get("/", authenticateToken, getAllTasks);

/**
 * GET SINGLE TASK
 * GET /api/tasks/:id
 * Params: id (MongoDB ObjectId)
 * Example: GET /api/tasks/65f1234567890abcdef12345
 */
router.get("/:id", authenticateToken, getTaskById);

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
router.put("/:id", authenticateToken, updateTask);

/**
 * DELETE TASK
 * DELETE /api/tasks/:id
 * Params: id
 * Example: DELETE /api/tasks/65f1234567890abcdef12345
 */
router.delete("/:id", authenticateToken, deleteAllSubtaskOfTask, deleteTask);

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
router.patch("/:id/toggle", authenticateToken, toggleTaskStatus);

export default router;

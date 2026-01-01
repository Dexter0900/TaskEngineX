// src/routes/subtaskRoutes.ts
import express from "express";
import {
  getSubtasks,
  createSubtask,
  toggleSubtask,
  updateSubtask,
  deleteSubtask,
} from "../controllers/subtaskController";
import { authenticateToken } from "../middlewares/auth";

const router = express.Router();

/**
 * SUBTASK ROUTES
 * All routes require authentication
 */

// GET /api/tasks/:taskId/subtasks - Get all subtasks for a task
router.get("/:taskId/subtasks", authenticateToken, getSubtasks);

// POST /api/tasks/:taskId/subtasks - Create new subtask
router.post("/:taskId/subtasks", authenticateToken, createSubtask);

// PATCH /api/tasks/:taskId/subtasks/:subtaskId/toggle - Toggle subtask completed
router.patch("/:taskId/subtasks/:subtaskId/toggle", authenticateToken, toggleSubtask);

// PUT /api/tasks/:taskId/subtasks/:subtaskId - Update subtask title
router.put("/:taskId/subtasks/:subtaskId", authenticateToken, updateSubtask);

// DELETE /api/tasks/:taskId/subtasks/:subtaskId - Delete subtask
router.delete("/:taskId/subtasks/:subtaskId", authenticateToken, deleteSubtask);

export default router;

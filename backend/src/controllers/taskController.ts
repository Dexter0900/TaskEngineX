// src/controllers/taskController.ts
import { Response } from "express";
import { Task } from "../models/Task.js";
import { AuthRequest } from "../middlewares/auth.js";
import { CreateTaskRequest, UpdateTaskRequest } from "../types/requests.js";

/**
 * CREATE TASK
 * POST /api/tasks
 * Body: { title, description?, status?, priority?, dueDate?, tags? }
 */
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    // Request body se data le rahe
    const { title, description, status, priority, dueDate, tags } =
      req.body as CreateTaskRequest;

    // Validation: Title required hai
    if (!title || title.trim() === "") {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    // New task create karo
    const task = await Task.create({
      title: title.trim(),
      description: description?.trim(),
      status: status || "pending",
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: tags || [],
      userId: req.userId, // Middleware se mila (logged-in user)
    });

    // Success response
    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error: unknown) {
    console.error("Create task error:", error);

    // Validation errors handle karo (Mongoose)
    if (error instanceof Error && error.name === "ValidationError") {
      const mongoError = error as unknown as {
        errors?: Record<string, unknown>;
      };
      return res.status(400).json({
        message: "Validation failed",
        errors: mongoError.errors,
      });
    }

    res.status(500).json({ message: "Failed to create task" });
  }
};

/**
 * GET ALL TASKS (User ke saare tasks)
 * GET /api/tasks
 * Query params: ?status=pending&priority=high&sort=-createdAt
 */
export const getAllTasks = async (req: AuthRequest, res: Response) => {
  try {
    // Query parameters (filters)
    const { status, priority, search, sort = "-createdAt" } = req.query;

    // Filter object banao
    const filter: any = { userId: req.userId, workspaceId: null }; // Sirf logged-in user ke tasks

    // Status filter (agar diya ho)
    if (status) {
      filter.status = status;
    }

    // Priority filter (agar diya ho)
    if (priority) {
      filter.priority = priority;
    }

    // Search in title/description (agar diya ho)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } }, // Case-insensitive
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Database se tasks fetch karo
    const tasks = await Task.find(filter)
      .sort(sort as string) // Sorting (-createdAt = newest first)
      .lean(); // Plain JavaScript objects (faster)

    // Tasks count
    const total = tasks.length;

    // Success response
    res.json({
      message: "Tasks fetched successfully",
      total,
      tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

/**
 * GET SINGLE TASK
 * GET /api/tasks/:id
 */
export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Task dhundo by ID
    const task = await Task.findById(id);

    // Task nahi mila
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check: Ye task logged-in user ka hai ya nahi
    if (task.userId.toString() !== req.userId) {
      return res.status(403).json({
        message: "Access denied: This is not your task",
      });
    }

    // Success response
    res.json({
      message: "Task fetched successfully",
      task,
    });
  } catch (error) {
    console.error("Get task error:", error);

    // Invalid MongoDB ObjectId
    if (error instanceof Error && error.name === "CastError") {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    res.status(500).json({ message: "Failed to fetch task" });
  }
};

/**
 * UPDATE TASK
 * PUT /api/tasks/:id
 * Body: { title?, description?, status?, priority?, dueDate?, tags? }
 */
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body as UpdateTaskRequest;

    // Pehle task dhundo
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check ownership
    if (task.userId.toString() !== req.userId) {
      return res.status(403).json({
        message: "Access denied: This is not your task",
      });
    }

    // Update karo (findByIdAndUpdate use kar rahe)
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: updates }, // Jo fields update karni hain
      {
        new: true, // Updated document return karo
        runValidators: true, // Validation check karo
      },
    );

    // Success response
    res.json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error: any) {
    console.error("Update task error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    res.status(500).json({ message: "Failed to update task" });
  }
};

/**
 * DELETE TASK
 * DELETE /api/tasks/:id
 */
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Task dhundo aur check karo
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check ownership
    if (task.userId.toString() !== req.userId) {
      return res.status(403).json({
        message: "Access denied: This is not your task",
      });
    }

    // Delete karo
    await Task.findByIdAndDelete(id);

    // Success response
    res.json({
      message: "Task deleted successfully",
      taskId: id,
    });
  } catch (error) {
    console.error("Delete task error:", error);

    if (error instanceof Error && error.name === "CastError") {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    res.status(500).json({ message: "Failed to delete task" });
  }
};

/**
 * TOGGLE TASK STATUS (Quick complete/incomplete)
 * PATCH /api/tasks/:id/toggle
 */
export const toggleTaskStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Task dhundo
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check ownership
    if (task.userId.toString() !== req.userId) {
      return res.status(403).json({
        message: "Access denied: This is not your task",
      });
    }

    // Status toggle karo

    const statusFlow = ["pending", "in-progress", "completed"] as const;
    const currentIndex = statusFlow.indexOf(task.status);
    task.status = statusFlow[(currentIndex + 1) % statusFlow.length];

    await task.save();

    // Success response
    res.json({
      message: `Task marked as ${task.status}`,
      task,
    });
  } catch (error) {
    console.error("Toggle task error:", error);

    if (error instanceof Error && error.name === "CastError") {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    res.status(500).json({ message: "Failed to toggle task status" });
  }
};

/**
 * GET TASK STATS (Dashboard ke liye)
 * GET /api/tasks/stats
 */
export const getTaskStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    // Aggregate queries for stats
    const stats = await Task.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), workspaceId: null } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          highPriority: {
            $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] },
          },
          mediumPriority: {
            $sum: { $cond: [{ $eq: ["$priority", "medium"] }, 1, 0] },
          },
          lowPriority: {
            $sum: { $cond: [{ $eq: ["$priority", "low"] }, 1, 0] },
          },
        },
      },
    ]);

    // Success response
    res.json({
      message: "Stats fetched successfully",
      stats: stats[0] || {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        highPriority: 0,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

// Import for aggregation
import mongoose from "mongoose";
import Subtask from "../models/Subtask.js";

/**
 * ===== WORKSPACE TASK METHODS =====
 * These are for workspace/project tasks with approval workflow
 */

/**
 * CREATE WORKSPACE TASK
 * POST /api/workspaces/:workspaceId/projects/:projectId/tasks
 * Only assigners can create and assign tasks to workers
 */
export const createWorkspaceTask = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId, projectId } = req.params;
    const { title, description, priority, dueDate, tags, assignedTo } =
      req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    if (!assignedTo) {
      return res.status(400).json({
        message: "Task must be assigned to a worker",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim(),
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: tags || [],
      userId: new mongoose.Types.ObjectId(req.userId), // Assigner who created the task
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
      projectId: new mongoose.Types.ObjectId(projectId),
      assignedTo: new mongoose.Types.ObjectId(assignedTo), // Worker assigned
      assignedBy: new mongoose.Types.ObjectId(req.userId), // Assigner who assigned
      status: "pending",
    });

    res.status(201).json({
      message: "Workspace task created successfully",
      task,
    });
  } catch (error: unknown) {
    console.error("Create workspace task error:", error);

    if (error instanceof Error && error.name === "ValidationError") {
      const mongoError = error as unknown as {
        errors?: Record<string, unknown>;
      };
      return res.status(400).json({
        message: "Validation failed",
        errors: mongoError.errors,
      });
    }

    res.status(500).json({ message: "Failed to create workspace task" });
  }
};

/**
 * GET WORKSPACE TASKS
 * GET /api/workspaces/:workspaceId/tasks
 * Different filters based on user role
 */
export const getWorkspaceTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { status, priority, search, sort = "-createdAt" } = req.query;
    const userRole = req.userRole;

    let filter: any = { workspaceId };

    // Role-based filtering
    if (userRole === "worker") {
      // Workers see only tasks assigned to them
      filter.assignedTo = req.userId;
    } else if (userRole === "assigner") {
      // Assigners see tasks they created or tasks in their projects
      filter.$or = [{ assignedBy: req.userId }, { userId: req.userId }];
    }
    // Admin sees all tasks

    // Additional filters
    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const tasks = await Task.find(filter)
      .sort(sort as string)
      .populate("assignedTo", "firstName lastName email avatar")
      .populate("assignedBy", "firstName lastName email avatar")
      .lean();

    res.json({
      message: "Workspace tasks fetched successfully",
      total: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Get workspace tasks error:", error);
    res.status(500).json({ message: "Failed to fetch workspace tasks" });
  }
};

/**
 * MARK TASK AS COMPLETED (Worker workflow)
 * PATCH /api/tasks/:id/mark-complete
 * Worker marks task as done, sends to pending-approval
 */
export const markTaskComplete = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    // Only assigned worker can mark as complete
    if (task.assignedTo?.toString() !== req.userId) {
      res.status(403).json({
        message: "Only assigned worker can mark this task as complete",
      });
      return;
    }

    // Can only mark as complete if in pending or in-progress
    if (!["pending", "in-progress"].includes(task.status)) {
      res.status(400).json({
        message: "Task must be in pending or in-progress status",
      });
      return;
    }

    // Update task
    task.status = "completed";
    task.completedAt = new Date();
    task.approvalStatus = "pending-approval"; // Waiting for assigner approval

    await task.save();

    res.json({
      message: "Task marked as completed, awaiting approval",
      task,
    });
  } catch (error) {
    console.error("Mark task complete error:", error);

    if (error instanceof Error && error.name === "CastError") {
      res.status(400).json({ message: "Invalid task ID format" });
      return;
    }

    res.status(500).json({ message: "Failed to mark task as complete" });
  }
};

/**
 * APPROVE/REJECT TASK (Assigner workflow)
 * PATCH /api/tasks/:id/approval
 * Assigner approves or rejects completed task
 */
export const approveTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, feedback } = req.body; // action: "approve" or "reject"

    if (!["approve", "reject"].includes(action)) {
      res.status(400).json({ message: "Action must be approve or reject" });
      return;
    }

    const task = await Task.findById(id);

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    // Only assigner who assigned the task can approve/reject
    if (task.assignedBy?.toString() !== req.userId) {
      res.status(403).json({
        message: "Only the assigner can approve/reject this task",
      });
      return;
    }

    // Task must be in pending-approval status
    if (task.approvalStatus !== "pending-approval") {
      res.status(400).json({
        message: "Task must be in pending-approval status",
      });
      return;
    }

    if (action === "approve") {
      task.approvalStatus = "approved";
    } else {
      task.approvalStatus = "rejected";
      task.status = "pending"; // Reset to pending if rejected
      task.completedAt = undefined;
    }

    await task.save();

    res.json({
      message: `Task ${action}ed successfully`,
      task,
    });
  } catch (error) {
    console.error("Approve task error:", error);

    if (error instanceof Error && error.name === "CastError") {
      res.status(400).json({ message: "Invalid task ID format" });
      return;
    }

    res.status(500).json({ message: "Failed to approve/reject task" });
  }
};

/**
 * GET WORKSPACE TASK STATS
 * GET /api/workspaces/:workspaceId/tasks/stats
 */
export const getWorkspaceTaskStats = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const userRole = req.userRole;

    let matchFilter: any = {
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
    };

    // Role-based filtering for stats
    if (userRole === "worker") {
      matchFilter.assignedTo = new mongoose.Types.ObjectId(req.userId);
    } else if (userRole === "assigner") {
      matchFilter.$or = [
        { assignedBy: new mongoose.Types.ObjectId(req.userId) },
        { userId: new mongoose.Types.ObjectId(req.userId) },
      ];
    }

    const stats = await Task.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          pendingApproval: {
            $sum: {
              $cond: [{ $eq: ["$approvalStatus", "pending-approval"] }, 1, 0],
            },
          },
          approved: {
            $sum: { $cond: [{ $eq: ["$approvalStatus", "approved"] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$approvalStatus", "rejected"] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      message: "Workspace task stats fetched successfully",
      stats: stats[0] || {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        pendingApproval: 0,
        approved: 0,
        rejected: 0,
      },
    });
  } catch (error) {
    console.error("Get workspace stats error:", error);
    res.status(500).json({ message: "Failed to fetch workspace stats" });
  }
};

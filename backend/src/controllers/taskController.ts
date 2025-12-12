// src/controllers/taskController.ts
import { Response } from "express";
import { Task } from "../models/Task.js";
import { AuthRequest } from "../middlewares/auth.js";

/**
 * CREATE TASK
 * POST /api/tasks
 * Body: { title, description?, status?, priority?, dueDate?, tags? }
 */
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    // Request body se data le rahe
    const { title, description, status, priority, dueDate, tags } = req.body;

    // Validation: Title required hai
    if (!title || title.trim() === "") {
      return res.status(400).json({ 
        message: "Task title is required" 
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
  } catch (error: any) {
    console.error("Create task error:", error);
    
    // Validation errors handle karo (Mongoose)
    if (error.name === "ValidationError") {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: error.errors 
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
    const filter: any = { userId: req.userId }; // Sirf logged-in user ke tasks

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
        { title: { $regex: search, $options: "i" } },        // Case-insensitive
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Database se tasks fetch karo
    const tasks = await Task.find(filter)
      .sort(sort as string)  // Sorting (-createdAt = newest first)
      .lean();               // Plain JavaScript objects (faster)

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
        message: "Access denied: This is not your task" 
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
    const updates = req.body;

    // Pehle task dhundo
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check ownership
    if (task.userId.toString() !== req.userId) {
      return res.status(403).json({ 
        message: "Access denied: This is not your task" 
      });
    }

    // Update karo (findByIdAndUpdate use kar rahe)
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: updates },           // Jo fields update karni hain
      { 
        new: true,                 // Updated document return karo
        runValidators: true        // Validation check karo
      }
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
        errors: error.errors 
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
        message: "Access denied: This is not your task" 
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
        message: "Access denied: This is not your task" 
      });
    }

    // Status toggle karo
    task.status = task.status === "completed" ? "pending" : "completed";
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
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
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
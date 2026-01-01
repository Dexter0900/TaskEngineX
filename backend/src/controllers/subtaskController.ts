// src/controllers/subtaskController.ts
import { Request, Response } from "express";
import Subtask from "../models/Subtask";
import { Task } from "../models/Task";

// Auth request type (matches middleware pattern)
interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

/**
 * GET ALL SUBTASKS FOR A TASK
 * Ek task ke saare subtasks fetch karta
 */
export const getSubtasks = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;

    // Check if task belongs to user
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Fetch subtasks
    const subtasks = await Subtask.find({ taskId }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      subtasks,
      count: subtasks.length,
    });
  } catch (error) {
    console.error("❌ Get subtasks error:", error);
    res.status(500).json({ message: "Failed to fetch subtasks" });
  }
};

/**
 * CREATE SUBTASK
 * Naya subtask banata
 */
export const createSubtask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;
    const userId = req.userId;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Subtask title is required" });
    }

    // Check if task belongs to user
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Create subtask
    const subtask = await Subtask.create({
      taskId,
      title: title.trim(),
      completed: false,
    });

    res.status(201).json({
      success: true,
      message: "Subtask created successfully",
      subtask,
    });
  } catch (error) {
    console.error("❌ Create subtask error:", error);
    res.status(500).json({ message: "Failed to create subtask" });
  }
};

/**
 * TOGGLE SUBTASK COMPLETED
 * Subtask ko complete/incomplete toggle karta
 */
export const toggleSubtask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, subtaskId } = req.params;
    const userId = req.userId;

    // Check if task belongs to user
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Find subtask
    const subtask = await Subtask.findOne({ _id: subtaskId, taskId });
    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    // Toggle completed
    subtask.completed = !subtask.completed;
    await subtask.save();

    res.status(200).json({
      success: true,
      message: "Subtask updated successfully",
      subtask,
    });
  } catch (error) {
    console.error("❌ Toggle subtask error:", error);
    res.status(500).json({ message: "Failed to update subtask" });
  }
};

/**
 * UPDATE SUBTASK
 * Subtask ka title update karta
 */
export const updateSubtask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, subtaskId } = req.params;
    const { title } = req.body;
    const userId = req.userId;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Subtask title is required" });
    }

    // Check if task belongs to user
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update subtask
    const subtask = await Subtask.findOneAndUpdate(
      { _id: subtaskId, taskId },
      { title: title.trim() },
      { new: true }
    );

    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    res.status(200).json({
      success: true,
      message: "Subtask updated successfully",
      subtask,
    });
  } catch (error) {
    console.error("❌ Update subtask error:", error);
    res.status(500).json({ message: "Failed to update subtask" });
  }
};

/**
 * DELETE SUBTASK
 * Subtask delete karta
 */
export const deleteSubtask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, subtaskId } = req.params;
    const userId = req.userId;

    // Check if task belongs to user
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Delete subtask
    const subtask = await Subtask.findOneAndDelete({ _id: subtaskId, taskId });

    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    res.status(200).json({
      success: true,
      message: "Subtask deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete subtask error:", error);
    res.status(500).json({ message: "Failed to delete subtask" });
  }
};

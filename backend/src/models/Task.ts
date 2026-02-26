// src/models/Task.ts
import mongoose, { Document, Schema } from "mongoose";

/**
 * ITask Interface
 * Ye define karta hai ek task mein kya-kya fields honge
 * Personal tasks: workspaceId = null, projectId = null
 * Workspace tasks: workspaceId set, projectId optional
 */
export interface ITask extends Document {
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  userId: mongoose.Types.ObjectId; // Task creator/owner
  tags?: string[];

  // Workspace fields (null for personal tasks)
  workspaceId?: mongoose.Types.ObjectId | null;
  projectId?: mongoose.Types.ObjectId | null;

  // Assignment fields (workspace tasks only)
  assignedTo?: mongoose.Types.ObjectId | null; // Worker assigned
  assignedBy?: mongoose.Types.ObjectId | null; // Assigner who assigned

  // Approval workflow
  approvalStatus?: "pending-approval" | "approved" | "rejected";
  completedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    // Task Title - Required field
    title: {
      type: String,
      required: [true, "Task title is required"], // Error message
      trim: true, // Extra spaces remove
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    // Task Description - Optional
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    // Task Status - Default "pending"
    status: {
      type: String,
      enum: {
        values: ["pending", "in-progress", "completed"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
    },

    // Task Priority - Default "medium"
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "{VALUE} is not a valid priority",
      },
      default: "medium",
    },

    // Due Date - Optional
    dueDate: {
      type: Date,
    },

    // User Reference - Kis user ka task hai
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // User model se reference
      required: true, // Har task ka owner hona chahiye
    },

    // Tags - Optional array of strings
    tags: {
      type: [String],
      default: [],
    },

    // ===== WORKSPACE FIELDS (for workspace/project tasks) =====

    // Workspace Reference (null for personal tasks)
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
    },

    // Project Reference (optional, workspace tasks only)
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    // Worker assigned to this task (workspace tasks only)
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Assigner who assigned this task (workspace tasks only)
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Approval Status for workspace tasks
    approvalStatus: {
      type: String,
      enum: {
        values: ["pending-approval", "approved", "rejected"],
        message: "{VALUE} is not a valid approval status",
      },
      default: null,
    },

    // When the task was marked as completed
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    // Automatically add createdAt and updatedAt
    timestamps: true,
  },
);

/**
 * Index for faster queries
 * User ke tasks jaldi dhundne ke liye
 */
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ workspaceId: 1, projectId: 1, status: 1 });
taskSchema.index({ assignedTo: 1, approvalStatus: 1 });
taskSchema.index({ assignedBy: 1 });

// Export the model
export const Task = mongoose.model<ITask>("Task", taskSchema);

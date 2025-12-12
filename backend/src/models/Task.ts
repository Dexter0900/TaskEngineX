// src/models/Task.ts
import mongoose, { Document, Schema } from "mongoose";

/**
 * ITask Interface
 * Ye define karta hai ek task mein kya-kya fields honge
 */
export interface ITask extends Document {
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  userId: mongoose.Types.ObjectId;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    // Task Title - Required field
    title: {
      type: String,
      required: [true, "Task title is required"],  // Error message
      trim: true,                                   // Extra spaces remove
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
      ref: "User",                    // User model se reference
      required: true,                 // Har task ka owner hona chahiye
    },

    // Tags - Optional array of strings
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    // Automatically add createdAt and updatedAt
    timestamps: true,
  }
);

/**
 * Index for faster queries
 * User ke tasks jaldi dhundne ke liye
 */
taskSchema.index({ userId: 1, createdAt: -1 });

// Export the model
export const Task = mongoose.model<ITask>("Task", taskSchema);
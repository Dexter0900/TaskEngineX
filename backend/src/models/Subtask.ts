// src/models/Subtask.ts
import mongoose, { Schema, Document } from "mongoose";

/**
 * SUBTASK INTERFACE
 * Subtask ka type definition
 */
export interface ISubtask extends Document {
  taskId: mongoose.Types.ObjectId;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SUBTASK SCHEMA
 * MongoDB schema for subtasks
 */
const SubtaskSchema = new Schema<ISubtask>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true, // Index for faster queries
    },
    title: {
      type: String,
      required: [true, "Subtask title is required"],
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * INDEX
 * taskId pe index for efficient queries
 */
SubtaskSchema.index({ taskId: 1, createdAt: -1 });

export default mongoose.model<ISubtask>("Subtask", SubtaskSchema);

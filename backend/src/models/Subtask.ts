// src/models/Subtask.ts
import mongoose, { Schema, Document } from "mongoose";

/**
 * SUBTASK INTERFACE
 * Subtask ka type definition
 * Inherits workspaceId and projectId from parent task
 */
export interface ISubtask extends Document {
  taskId: mongoose.Types.ObjectId;
  title: string;
  completed: boolean;
  workspaceId?: mongoose.Types.ObjectId | null; // Inherited from task
  projectId?: mongoose.Types.ObjectId | null; // Inherited from task
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
    // Workspace Reference (inherited from parent task)
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
    },
    // Project Reference (inherited from parent task)
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * INDEX
 * taskId pe index for efficient queries
 */
SubtaskSchema.index({ taskId: 1, createdAt: -1 });

export default mongoose.model<ISubtask>("Subtask", SubtaskSchema);

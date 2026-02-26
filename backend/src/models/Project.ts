// src/models/Project.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IProjectMember {
  userId: mongoose.Types.ObjectId;
  role: "assigner" | "worker";
}

export interface IProject extends Document {
  workspaceId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  status: "active" | "archived";
  assigners: IProjectMember[]; // Users who can assign tasks
  workers: IProjectMember[]; // Users who work on tasks
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    // Workspace Reference
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    // Project Name
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },

    // Project Description
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    // Project Status
    status: {
      type: String,
      enum: {
        values: ["active", "archived"],
        message: "{VALUE} is not a valid status",
      },
      default: "active",
    },

    // Project Assigners (who can assign tasks)
    assigners: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          default: "assigner",
        },
      },
    ],

    // Project Workers (who work on tasks)
    workers: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          default: "worker",
        },
      },
    ],

    // Created by (usually admin or creator)
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster project lookup by workspace
projectSchema.index({ workspaceId: 1, status: 1 });

// Index for assigner and worker lookup
projectSchema.index({ "assigners.userId": 1 });
projectSchema.index({ "workers.userId": 1 });

export const Project = mongoose.model<IProject>("Project", projectSchema);

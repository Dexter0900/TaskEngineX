// src/models/Workspace.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IWorkspaceUser {
  userId: mongoose.Types.ObjectId;
  role: "admin" | "assigner" | "worker";
  joinedAt: Date;
}

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  creator: mongoose.Types.ObjectId; // Admin user
  members: IWorkspaceUser[]; // Array of workspace members with roles
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    // Workspace Name
    name: {
      type: String,
      required: [true, "Workspace name is required"],
      trim: true,
      maxlength: [100, "Workspace name cannot exceed 100 characters"],
    },

    // Workspace Description
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    // Creator (Admin)
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Members with roles
    members: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: {
            values: ["admin", "assigner", "worker"],
            message: "{VALUE} is not a valid role",
          },
          default: "worker",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Index on creator for faster workspace lookup
workspaceSchema.index({ creator: 1 });

// Index on members.userId for faster member lookup
workspaceSchema.index({ "members.userId": 1 });

export const Workspace = mongoose.model<IWorkspace>(
  "Workspace",
  workspaceSchema,
);

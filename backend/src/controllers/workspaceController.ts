// src/controllers/workspaceController.ts
import { Request, Response } from "express";
import { Workspace } from "../models/Workspace";
import { User } from "../models/User";
import mongoose from "mongoose";

/**
 * Create a new workspace
 * Creator becomes the first admin
 */
export const createWorkspace = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({ message: "Workspace name is required" });
      return;
    }

    // Create workspace with creator as the only member (admin)
    const workspace = await Workspace.create({
      name: name.trim(),
      description: description?.trim(),
      creator: new mongoose.Types.ObjectId(req.userId),
      members: [
        {
          userId: new mongoose.Types.ObjectId(req.userId),
          role: "admin",
          joinedAt: new Date(),
        },
      ],
    });

    res.status(201).json({
      message: "Workspace created successfully",
      workspace,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating workspace",
      error: error instanceof Error ? error.message : "",
    });
  }
};

/**
 * Get all workspaces for the authenticated user
 */
export const getUserWorkspaces = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const workspaces = await Workspace.find({
      "members.userId": req.userId,
    }).populate("creator", "firstName lastName email avatar");

    res.status(200).json({
      message: "Workspaces retrieved successfully",
      workspaces,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving workspaces",
      error: error instanceof Error ? error.message : "",
    });
  }
};

/**
 * Get workspace details with members
 */
export const getWorkspaceById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId).populate(
      "members.userId",
      "firstName lastName email avatar",
    );

    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    res.status(200).json({
      message: "Workspace retrieved successfully",
      workspace,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving workspace",
      error: error instanceof Error ? error.message : "",
    });
  }
};

/**
 * Add member to workspace
 * Only admin can add members
 */
export const addWorkspaceMember = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const { email, role } = req.body;

    if (!email || !role) {
      res.status(400).json({ message: "Email and role are required" });
      return;
    }

    if (!["admin", "assigner", "worker"].includes(role)) {
      res.status(400).json({ message: "Invalid role" });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Find workspace
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    // Check if user already a member
    const isMember = workspace.members.some(
      (m) => m.userId.toString() === user._id.toString(),
    );

    if (isMember) {
      res
        .status(400)
        .json({ message: "User is already a member of this workspace" });
      return;
    }

    // Add member
    workspace.members.push({
      userId: user._id,
      role: role as "admin" | "assigner" | "worker",
      joinedAt: new Date(),
    });

    await workspace.save();

    res.status(200).json({
      message: "Member added successfully",
      workspace,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding member",
      error: error instanceof Error ? error.message : "",
    });
  }
};

/**
 * Update member role in workspace
 * Only admin can change roles
 */
export const updateMemberRole = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { workspaceId, userId } = req.params;
    const { role } = req.body;

    if (!role) {
      res.status(400).json({ message: "Role is required" });
      return;
    }

    if (!["admin", "assigner", "worker"].includes(role)) {
      res.status(400).json({ message: "Invalid role" });
      return;
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    const memberRecord = workspace.members.find(
      (m) => m.userId.toString() === userId,
    );

    if (!memberRecord) {
      res.status(404).json({ message: "Member not found in workspace" });
      return;
    }

    memberRecord.role = role as "admin" | "assigner" | "worker";
    await workspace.save();

    res.status(200).json({
      message: "Member role updated successfully",
      workspace,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating member role",
      error: error instanceof Error ? error.message : "",
    });
  }
};

/**
 * Remove member from workspace
 * Only admin can remove members
 */
export const removeMember = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { workspaceId, userId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    // Prevent removing the creator (admin)
    if (workspace.creator.toString() === userId) {
      res.status(400).json({ message: "Cannot remove workspace creator" });
      return;
    }

    // Remove member
    workspace.members = workspace.members.filter(
      (m) => m.userId.toString() !== userId,
    );

    await workspace.save();

    res.status(200).json({
      message: "Member removed successfully",
      workspace,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error removing member",
      error: error instanceof Error ? error.message : "",
    });
  }
};

/**
 * Update workspace details
 * Only admin can update workspace
 */
export const updateWorkspace = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const { name, description } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    if (name) workspace.name = name.trim();
    if (description) workspace.description = description.trim();

    await workspace.save();

    res.status(200).json({
      message: "Workspace updated successfully",
      workspace,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating workspace",
      error: error instanceof Error ? error.message : "",
    });
  }
};

/**
 * Delete workspace
 * Only creator/admin can delete workspace
 */
export const deleteWorkspace = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    if (workspace.creator.toString() !== req.userId) {
      res.status(403).json({ message: "Only creator can delete workspace" });
      return;
    }

    await Workspace.deleteOne({ _id: workspaceId });

    res.status(200).json({
      message: "Workspace deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting workspace",
      error: error instanceof Error ? error.message : "",
    });
  }
};

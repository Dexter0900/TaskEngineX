// src/controllers/projectController.ts
import { Request, Response } from "express";
import { Project } from "../models/Project";
import { User } from "../models/User";
import mongoose from "mongoose";

/**
 * Create a new project in a workspace
 * Only admin and assigner can create projects
 */
export const createProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({ message: "Project name is required" });
      return;
    }

    const project = await Project.create({
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
      name: name.trim(),
      description: description?.trim(),
      status: "active",
      assigners: [
        {
          userId: new mongoose.Types.ObjectId(req.userId),
          role: "assigner",
        },
      ],
      workers: [],
      createdBy: new mongoose.Types.ObjectId(req.userId),
    });

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating project",
      error: error instanceof Error ? error.message : "",
    });
  }
};

/**
 * Get all projects in a workspace
 */
export const getWorkspaceProjects = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { workspaceId } = req.params;

    const projects = await Project.find({ workspaceId })
      .populate("assigners.userId", "firstName lastName email avatar")
      .populate("workers.userId", "firstName lastName email avatar")
      .populate("createdBy", "firstName lastName email avatar");

    res.status(200).json({
      message: "Projects retrieved successfully",
      projects,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving projects",
      error: error instanceof Error ? error.message : "",
    });
  }
};

/**
 * Get project details
 */
export const getProjectById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate("assigners.userId", "firstName lastName email avatar")
      .populate("workers.userId", "firstName lastName email avatar")
      .populate("createdBy", "firstName lastName email avatar");

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    res.status(200).json({
      message: "Project retrieved successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving project",
      error: error instanceof Error ? error.message : "",
    });
  }
};

/**
 * Add assigner to project
 * Only admin can add assigners
 */
export const addProjectAssigner = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Check if already an assigner
    const isAssigner = project.assigners.some(
      (a) => a.userId.toString() === user._id.toString(),
    );

    if (isAssigner) {
      res
        .status(400)
        .json({ message: "User is already an assigner in this project" });
      return;
    }

    project.assigners.push({
      userId: user._id,
      role: "assigner",
    });

    await project.save();

    res.status(200).json({
      message: "Assigner added successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding assigner",
      error: error instanceof Error ? error.message : "",
    });
  }
};

/**
 * Add worker to project
 * Only admin and assigner can add workers
 */
export const addProjectWorker = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Check if already a worker
    const isWorker = project.workers.some(
      (w) => w.userId.toString() === user._id.toString(),
    );

    if (isWorker) {
      res
        .status(400)
        .json({ message: "User is already a worker in this project" });
      return;
    }

    project.workers.push({
      userId: user._id,
      role: "worker",
    });

    await project.save();

    res.status(200).json({
      message: "Worker added successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding worker",
      error: error instanceof Error ? error.message : "",
    });
  }
};

/**
 * Remove member from project
 */
export const removeProjectMember = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;

    if (!userId || !role) {
      res.status(400).json({ message: "userId and role are required" });
      return;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    if (role === "assigner") {
      project.assigners = project.assigners.filter(
        (a) => a.userId.toString() !== userId,
      );
    } else if (role === "worker") {
      project.workers = project.workers.filter(
        (w) => w.userId.toString() !== userId,
      );
    } else {
      res.status(400).json({ message: "Invalid role" });
      return;
    }

    await project.save();

    res.status(200).json({
      message: "Member removed successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error removing member",
      error: error instanceof Error ? error.message : "",
    });
  }
};

/**
 * Update project details
 * Only admin and assigner can update
 */
export const updateProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { name, description, status } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    if (name) project.name = name.trim();
    if (description) project.description = description.trim();
    if (status && ["active", "archived"].includes(status)) {
      project.status = status;
    }

    await project.save();

    res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating project",
      error: error instanceof Error ? error.message : "",
    });
  }
};

/**
 * Delete project
 * Only admin can delete
 */
export const deleteProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    await Project.deleteOne({ _id: projectId });

    res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting project",
      error: error instanceof Error ? error.message : "",
    });
  }
};

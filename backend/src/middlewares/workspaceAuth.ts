// src/middlewares/workspaceAuth.ts
import { Request, Response, NextFunction } from "express";
import { Workspace } from "../models/Workspace";
import { Project } from "../models/Project";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: "admin" | "assigner" | "worker";
      workspaceId?: string;
      workspace?: any;
    }
  }
}

/**
 * Middleware to verify user is workspace member
 * Attaches workspace info and user's role in workspace to request
 */
export const verifyWorkspaceMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { workspaceId } = req.params;

    if (!workspaceId) {
      res.status(400).json({ message: "Workspace ID is required" });
      return;
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    // Check if user is a member of the workspace
    const memberRecord = workspace.members.find(
      (m) => m.userId.toString() === req.userId,
    );

    if (!memberRecord) {
      res
        .status(403)
        .json({ message: "You are not a member of this workspace" });
      return;
    }

    // Attach workspace and user role to request
    req.workspace = workspace;
    req.userRole = memberRecord.role;
    req.workspaceId = workspaceId;

    next();
  } catch (error) {
    res.status(500).json({
      message: "Error verifying workspace membership",
      error: error instanceof Error ? error.message : "",
    });
  }
};

/**
 * Middleware to verify user has admin role in workspace
 * Must be used after verifyWorkspaceMember
 */
export const verifyWorkspaceAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.userRole !== "admin") {
    res.status(403).json({ message: "Admin access required" });
    return;
  }
  next();
};

/**
 * Middleware to verify user has assigner or admin role
 * Must be used after verifyWorkspaceMember
 */
export const verifyWorkspaceAssigner = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.userRole !== "admin" && req.userRole !== "assigner") {
    res.status(403).json({ message: "Assigner or Admin access required" });
    return;
  }
  next();
};

/**
 * Middleware to verify user is project member with specific role
 * Must be used after verifyWorkspaceMember
 */
export const verifyProjectMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      res.status(400).json({ message: "Project ID is required" });
      return;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Verify project belongs to workspace
    if (project.workspaceId.toString() !== req.workspaceId) {
      res.status(403).json({
        message: "Project does not belong to this workspace",
      });
      return;
    }

    // Check if user is project member (assigner or worker)
    const isAssigner = project.assigners.some(
      (a) => a.userId.toString() === req.userId,
    );
    const isWorker = project.workers.some(
      (w) => w.userId.toString() === req.userId,
    );

    if (!isAssigner && !isWorker && req.userRole !== "admin") {
      res.status(403).json({ message: "You are not a member of this project" });
      return;
    }

    // Attach project info to request
    req.workspace = { ...req.workspace, project, isAssigner, isWorker };

    next();
  } catch (error) {
    res.status(500).json({
      message: "Error verifying project membership",
      error: error instanceof Error ? error.message : "",
    });
  }
};

/**
 * Middleware to verify user is project assigner or admin
 * Must be used after verifyProjectMember
 */
export const verifyProjectAssigner = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const isAssigner = req.workspace?.isAssigner;
  if (!isAssigner && req.userRole !== "admin") {
    res
      .status(403)
      .json({ message: "Project assigner or admin access required" });
    return;
  }
  next();
};

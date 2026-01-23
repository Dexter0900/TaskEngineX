// src/routes/projectRoutes.ts
import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import {
  verifyWorkspaceMember,
  verifyWorkspaceAdmin,
  verifyWorkspaceAssigner,
} from "../middlewares/workspaceAuth";
import {
  createProject,
  getWorkspaceProjects,
  getProjectById,
  addProjectAssigner,
  addProjectWorker,
  removeProjectMember,
  updateProject,
  deleteProject,
} from "../controllers/projectController";

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);

// All project routes require workspace membership
router.use(verifyWorkspaceMember);

/**
 * Project CRUD Routes
 */

// POST /api/workspaces/:workspaceId/projects - Create project (admin/assigner)
router.post("/", verifyWorkspaceAssigner, createProject);

// GET /api/workspaces/:workspaceId/projects - Get all workspace projects
router.get("/", getWorkspaceProjects);

// GET /api/workspaces/:workspaceId/projects/:projectId - Get project details
router.get("/:projectId", getProjectById);

// PUT /api/workspaces/:workspaceId/projects/:projectId - Update project (admin/assigner)
router.put("/:projectId", verifyWorkspaceAssigner, updateProject);

// DELETE /api/workspaces/:workspaceId/projects/:projectId - Delete project (admin only)
router.delete("/:projectId", verifyWorkspaceAdmin, deleteProject);

/**
 * Project Member Management Routes
 */

// POST /api/workspaces/:workspaceId/projects/:projectId/assigners - Add assigner (admin only)
router.post("/:projectId/assigners", verifyWorkspaceAdmin, addProjectAssigner);

// POST /api/workspaces/:workspaceId/projects/:projectId/workers - Add worker (admin/assigner)
router.post("/:projectId/workers", verifyWorkspaceAssigner, addProjectWorker);

// DELETE /api/workspaces/:workspaceId/projects/:projectId/members - Remove member (admin)
router.delete("/:projectId/members", verifyWorkspaceAdmin, removeProjectMember);

export default router;

// src/routes/workspaceRoutes.ts
import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import {
  verifyWorkspaceMember,
  verifyWorkspaceAdmin,
} from "../middlewares/workspaceAuth";
import {
  createWorkspace,
  getUserWorkspaces,
  getWorkspaceById,
  addWorkspaceMember,
  updateMemberRole,
  removeMember,
  updateWorkspace,
  deleteWorkspace,
} from "../controllers/workspaceController";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Workspace CRUD Routes
 */

// POST /api/workspaces - Create workspace
router.post("/", createWorkspace);

// GET /api/workspaces - Get all user's workspaces
router.get("/", getUserWorkspaces);

// GET /api/workspaces/:workspaceId - Get workspace details
router.get("/:workspaceId", verifyWorkspaceMember, getWorkspaceById);

// PUT /api/workspaces/:workspaceId - Update workspace (admin only)
router.put(
  "/:workspaceId",
  verifyWorkspaceMember,
  verifyWorkspaceAdmin,
  updateWorkspace,
);

// DELETE /api/workspaces/:workspaceId - Delete workspace (admin only)
router.delete(
  "/:workspaceId",
  verifyWorkspaceMember,
  verifyWorkspaceAdmin,
  deleteWorkspace,
);

/**
 * Member Management Routes
 */

// POST /api/workspaces/:workspaceId/members - Add member (admin only)
router.post(
  "/:workspaceId/members",
  verifyWorkspaceMember,
  verifyWorkspaceAdmin,
  addWorkspaceMember,
);

// PATCH /api/workspaces/:workspaceId/members/:userId/role - Update member role (admin only)
router.patch(
  "/:workspaceId/members/:userId/role",
  verifyWorkspaceMember,
  verifyWorkspaceAdmin,
  updateMemberRole,
);

// DELETE /api/workspaces/:workspaceId/members/:userId - Remove member (admin only)
router.delete(
  "/:workspaceId/members/:userId",
  verifyWorkspaceMember,
  verifyWorkspaceAdmin,
  removeMember,
);

export default router;

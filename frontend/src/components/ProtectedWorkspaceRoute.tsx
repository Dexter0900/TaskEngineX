// src/components/ProtectedWorkspaceRoute.tsx
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";

interface ProtectedWorkspaceRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "assigner" | "worker";
}

export default function ProtectedWorkspaceRoute({
  children,
  requiredRole,
}: ProtectedWorkspaceRouteProps) {
  const { user } = useAuth();
  const { currentWorkspace, userRoleInWorkspace } = useWorkspace();
  const navigate = useNavigate();

  // Check if user is authenticated
  if (!user) {
    navigate("/login");
    return null;
  }

  // Check if user has a workspace selected
  if (!currentWorkspace || !userRoleInWorkspace) {
    navigate("/workspaces");
    return null;
  }

  // Check if user has required role
  if (requiredRole && userRoleInWorkspace !== requiredRole) {
    // Check if role hierarchy allows access (admin > assigner > worker)
    const roleHierarchy = { admin: 3, assigner: 2, worker: 1 };
    const userRoleLevel = roleHierarchy[userRoleInWorkspace];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      navigate(`/workspace/${currentWorkspace._id}/dashboard`);
      return null;
    }
  }

  return <>{children}</>;
}

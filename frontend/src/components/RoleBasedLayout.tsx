// src/components/RoleBasedLayout.tsx
import { type ReactNode, useEffect } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import AdminSidebar from "./sidebars/AdminSidebar";
import AssignerSidebar from "./sidebars/AssignerSidebar";
import WorkerSidebar from "./sidebars/WorkerSidebar";

interface RoleBasedLayoutProps {
  children: ReactNode;
  workspaceId?: string;
  onLogout?: () => void;
}

export default function RoleBasedLayout({
  children,
  workspaceId,
  onLogout,
}: RoleBasedLayoutProps) {
  const { currentWorkspace, userRoleInWorkspace, fetchUserWorkspaces } =
    useWorkspace();

  // Fetch workspaces on component mount
  useEffect(() => {
    if (workspaceId && !currentWorkspace) {
      fetchUserWorkspaces();
    }
  }, [workspaceId]);

  // If no workspace ID provided, return null - shouldn't reach here due to route guards
  if (!workspaceId) {
    return null;
  }

  // Get sidebar component based on role
  const getSidebar = () => {
    switch (userRoleInWorkspace) {
      case "admin":
        return (
          <AdminSidebar workspaceId={workspaceId} onLogout={onLogout} />
        );
      case "assigner":
        return (
          <AssignerSidebar workspaceId={workspaceId} onLogout={onLogout} />
        );
      case "worker":
        return (
          <WorkerSidebar workspaceId={workspaceId} onLogout={onLogout} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Role-based Sidebar */}
      {getSidebar()}

      {/* Main Content */}
      <main className="flex-1 ml-15">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

// src/context/WorkspaceContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Workspace } from "../types";

/**
 * WORKSPACE CONTEXT TYPE
 * Workspace state aur functions
 */
interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  userWorkspaces: Workspace[];
  userRoleInWorkspace: "admin" | "assigner" | "worker" | null;
  loading: boolean;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setUserWorkspaces: (workspaces: Workspace[]) => void;
  fetchUserWorkspaces: () => Promise<void>;
}

/**
 * WORKSPACE CONTEXT
 * Current workspace aur related state share karne ke liye
 */
const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

/**
 * WORKSPACE PROVIDER
 * App ko wrap karta hai aur workspace state provide karta
 */
export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  // State
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [userWorkspaces, setUserWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);

  // Get user ID from localStorage (from AuthContext)
  const userId =
    typeof window !== "undefined"
      ? (() => {
          try {
            const user = localStorage.getItem("user");
            return user ? JSON.parse(user).id : null;
          } catch {
            return null;
          }
        })()
      : null;

  /**
   * FETCH USER WORKSPACES
   * User ke sab workspaces ko fetch karta
   */
  const fetchUserWorkspaces = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUserWorkspaces([]);
        setCurrentWorkspace(null);
        return;
      }

      const response = await fetch("/api/workspaces", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch workspaces");

      const data = await response.json();
      const workspaces = data.workspaces || [];
      setUserWorkspaces(workspaces);

      // If no current workspace selected and user has workspaces, select first
      if (!currentWorkspace && workspaces.length > 0) {
        setCurrentWorkspace(workspaces[0]);
        localStorage.setItem("currentWorkspaceId", workspaces[0]._id);
      }
    } catch (error) {
      console.error("Failed to fetch workspaces:", error);
      setUserWorkspaces([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * RESTORE WORKSPACE ON LOAD
   * localStorage se saved workspace ko restore karta
   */
  useEffect(() => {
    const savedWorkspaceId = localStorage.getItem("currentWorkspaceId");
    if (savedWorkspaceId && userWorkspaces.length > 0) {
      const workspace = userWorkspaces.find((w) => w._id === savedWorkspaceId);
      if (workspace) {
        setCurrentWorkspace(workspace);
      }
    }
  }, [userWorkspaces.length]); // Only when workspaces list changes

  /**
   * GET USER ROLE IN CURRENT WORKSPACE
   * Current workspace mein user ki role return karta
   */
  const getUserRoleInWorkspace = (): "admin" | "assigner" | "worker" | null => {
    if (!currentWorkspace || !userId) return null;

    const member = currentWorkspace.members.find((m) => m.userId === userId);
    return member?.role || null;
  };

  const value = {
    currentWorkspace,
    userWorkspaces,
    userRoleInWorkspace: getUserRoleInWorkspace(),
    loading,
    setCurrentWorkspace: (workspace: Workspace | null) => {
      setCurrentWorkspace(workspace);
      if (workspace) {
        localStorage.setItem("currentWorkspaceId", workspace._id);
      } else {
        localStorage.removeItem("currentWorkspaceId");
      }
    },
    setUserWorkspaces,
    fetchUserWorkspaces,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

/**
 * USE WORKSPACE HOOK
 * Kisi bhi component se workspace context use karne ke liye
 */
export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return context;
};

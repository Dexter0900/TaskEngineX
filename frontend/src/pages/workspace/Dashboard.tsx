// src/pages/workspace/Dashboard.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUsers, FiFolder, FiCheckSquare, FiTrendingUp } from "react-icons/fi";
import { useWorkspace } from "../../context/WorkspaceContext";
import RoleBasedLayout from "../../components/RoleBasedLayout";
import ProtectedWorkspaceRoute from "../../components/ProtectedWorkspaceRoute";

interface DashboardStats {
  totalMembers: number;
  totalProjects: number;
  totalTasks: number;
  pendingApprovals: number;
}

export default function WorkspaceDashboard() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { currentWorkspace, userRoleInWorkspace, fetchUserWorkspaces } = useWorkspace();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Ensure workspace is loaded
  useEffect(() => {
    if (!currentWorkspace && workspaceId) {
      fetchUserWorkspaces();
    }
  }, [workspaceId]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!workspaceId) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        // Fetch workspace tasks stats
        const response = await fetch(
          `/api/workspaces/${workspaceId}/tasks/stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          setStats({
            totalMembers: currentWorkspace?.members.length || 0,
            totalProjects: 0, // Will fetch from projects endpoint
            totalTasks: data.stats.total,
            pendingApprovals: userRoleInWorkspace === "assigner" 
              ? data.stats.pendingApproval 
              : 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setStats({
          totalMembers: currentWorkspace?.members.length || 0,
          totalProjects: 0,
          totalTasks: 0,
          pendingApprovals: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [workspaceId, currentWorkspace]);

  if (!workspaceId) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Invalid workspace</p>
      </div>
    );
  }

  return (
    <ProtectedWorkspaceRoute>
      <RoleBasedLayout workspaceId={workspaceId}>
        <div className="min-h-screen">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {currentWorkspace?.name}
            </h1>
            <p className="text-muted-foreground">
              {currentWorkspace?.description || "Welcome to your workspace"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Role: <span className="font-semibold capitalize">{userRoleInWorkspace}</span>
            </p>
          </motion.div>

          {/* Stats Grid */}
          {!loading && stats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              {/* Members */}
              <div className="bg-card border-2 border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Members
                  </h3>
                  <FiUsers className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {stats.totalMembers}
                </p>
              </div>

              {/* Jobs/Projects */}
              <div className="bg-card border-2 border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Projects
                  </h3>
                  <FiFolder className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {stats.totalProjects}
                </p>
              </div>

              {/* Tasks */}
              <div className="bg-card border-2 border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Tasks
                  </h3>
                  <FiCheckSquare className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {stats.totalTasks}
                </p>
              </div>

              {/* Pending Approvals (Assigner only) */}
              {userRoleInWorkspace === "assigner" && (
                <div className="bg-card border-2 border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Approvals
                    </h3>
                    <FiTrendingUp className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.pendingApprovals}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Role-based Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border-2 border-border rounded-lg p-8 text-center"
          >
            {userRoleInWorkspace === "admin" && (
              <>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  👑 Welcome Admin
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  You have full control over this workspace. Manage members, create projects, and oversee all tasks.
                </p>
              </>
            )}
            {userRoleInWorkspace === "assigner" && (
              <>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  📋 Welcome Assigner
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Create projects, assign tasks to workers, and review their completions.
                </p>
              </>
            )}
            {userRoleInWorkspace === "worker" && (
              <>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  🚀 Welcome Worker
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  View your assigned tasks and mark them complete when done. Your work will be reviewed by the assigner.
                </p>
              </>
            )}
          </motion.div>
        </div>
      </RoleBasedLayout>
    </ProtectedWorkspaceRoute>
  );
}

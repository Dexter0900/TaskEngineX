// src/pages/workspace/Tasks.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiFilter,
  FiCheck,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useAuth } from "../../context/AuthContext";
import RoleBasedLayout from "../../components/RoleBasedLayout";
import ProtectedWorkspaceRoute from "../../components/ProtectedWorkspaceRoute";
import { getWorkspaceTasks, markTaskComplete, approveTask } from "../../api/workspaceApi";
import type { Task } from "../../types";

export default function WorkspaceTasks() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { user } = useAuth();
  const { userRoleInWorkspace } = useWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [approvalInProgress, setApprovalInProgress] = useState<string | null>(null);

  // Fetch tasks
  useEffect(() => {
    if (workspaceId) {
      fetchTasks();
    }
  }, [workspaceId, statusFilter]);

  const fetchTasks = async () => {
    if (!workspaceId) return;
    try {
      setLoading(true);
      const data = await getWorkspaceTasks(workspaceId, {
        status: statusFilter || undefined,
      });
      setTasks(data.tasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (taskId: string) => {
    try {
      await markTaskComplete(taskId);
      setTasks(
        tasks.map((t) =>
          t._id === taskId
            ? { ...t, status: "completed", approvalStatus: "pending-approval" }
            : t
        )
      );
      toast.success("Task marked as complete!");
    } catch (error) {
      console.error("Failed to mark complete:", error);
      toast.error("Failed to mark task complete");
    }
  };

  const handleApproveTask = async (taskId: string, action: "approve" | "reject") => {
    setApprovalInProgress(taskId);
    try {
      await approveTask(taskId, { action });
      setTasks(
        tasks.map((t) =>
          t._id === taskId
            ? {
                ...t,
                approvalStatus: action === "approve" ? "approved" : "rejected",
                status: action === "approve" ? "completed" : "pending",
              }
            : t
        )
      );
      toast.success(
        `Task ${action === "approve" ? "approved" : "rejected"}!`
      );
    } catch (error) {
      console.error("Failed to approve task:", error);
      toast.error(`Failed to ${action} task`);
    } finally {
      setApprovalInProgress(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <FiCheckCircle className="text-green-500" />;
      case "in-progress":
        return <FiClock className="text-blue-500" />;
      default:
        return <FiAlertCircle className="text-orange-500" />;
    }
  };

  return (
    <ProtectedWorkspaceRoute>
      <RoleBasedLayout workspaceId={workspaceId!}>
        <div className="min-h-screen">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-foreground mb-2">Tasks</h1>
            <p className="text-muted-foreground">
              {userRoleInWorkspace === "worker"
                ? "Your assigned workspace tasks"
                : "Manage workspace tasks"}
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center gap-4"
          >
            <FiFilter size={20} className="text-muted-foreground" />
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "All", value: "" },
                { label: "Pending", value: "pending" },
                { label: "In Progress", value: "in-progress" },
                { label: "Completed", value: "completed" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    statusFilter === filter.value
                      ? "bg-primary text-white"
                      : "bg-accent text-foreground hover:bg-accent/80"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tasks List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card border-2 border-border rounded-lg p-12 text-center"
            >
              <FiCheckCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Tasks
              </h3>
              <p className="text-muted-foreground">No tasks match your filters</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {tasks.map((task) => (
                <motion.div
                  key={task._id}
                  whileHover={{ scale: 1.01 }}
                  className="p-6 bg-card border-2 border-border rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(task.status)}
                        <h3 className="text-lg font-semibold text-foreground">
                          {task.title}
                        </h3>
                        {task.priority && (
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${
                              task.priority === "high"
                                ? "bg-red-900/30 text-red-400"
                                : task.priority === "medium"
                                ? "bg-yellow-900/30 text-yellow-400"
                                : "bg-green-900/30 text-green-400"
                            }`}
                          >
                            {task.priority.toUpperCase()}
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Status: {task.status}</span>
                        {task.approvalStatus && (
                          <span className="font-semibold capitalize">
                            Approval: {task.approvalStatus}
                          </span>
                        )}
                        {task.dueDate && (
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      {/* Worker: Mark Complete */}
                      {userRoleInWorkspace === "worker" &&
                        task.assignedTo === user?.id &&
                        task.status !== "completed" && (
                          <button
                            onClick={() => handleMarkComplete(task._id)}
                            className="px-4 py-2 bg-green-900/30 text-green-400 hover:bg-green-900/50 rounded transition-colors flex items-center gap-2"
                          >
                            <FiCheck size={16} />
                            Mark Complete
                          </button>
                        )}

                      {/* Assigner: Approve/Reject */}
                      {userRoleInWorkspace === "assigner" &&
                        task.approvalStatus === "pending-approval" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveTask(task._id, "approve")}
                              disabled={approvalInProgress === task._id}
                              className="px-4 py-2 bg-green-900/30 text-green-400 hover:bg-green-900/50 rounded transition-colors disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApproveTask(task._id, "reject")}
                              disabled={approvalInProgress === task._id}
                              className="px-4 py-2 bg-red-900/30 text-red-400 hover:bg-red-900/50 rounded transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </RoleBasedLayout>
    </ProtectedWorkspaceRoute>
  );
}

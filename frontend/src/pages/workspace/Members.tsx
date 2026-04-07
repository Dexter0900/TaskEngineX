// src/pages/workspace/Members.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiUsers, FiPlus, FiTrash2, FiEdit2 } from "react-icons/fi";
import toast from "react-hot-toast";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useAuth } from "../../context/AuthContext";
import RoleBasedLayout from "../../components/RoleBasedLayout";
import ProtectedWorkspaceRoute from "../../components/ProtectedWorkspaceRoute";
import {
  getWorkspaceDetails,
  addWorkspaceMember,
  removeWorkspaceMember,
  updateMemberRole,
} from "../../api/workspaceApi";
import type { Workspace } from "../../types";

export default function WorkspaceMembers() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { user } = useAuth();
  const { userRoleInWorkspace } = useWorkspace();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "assigner" | "worker">("worker");
  const [addingLoading, setAddingLoading] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<"admin" | "assigner" | "worker">("worker");

  // Fetch workspace details
  useEffect(() => {
    if (workspaceId) {
      fetchWorkspace();
    }
  }, [workspaceId]);

  const fetchWorkspace = async () => {
    if (!workspaceId) return;
    try {
      setLoading(true);
      const data = await getWorkspaceDetails(workspaceId);
      setWorkspace(data.workspace);
    } catch (error) {
      console.error("Failed to fetch workspace:", error);
      toast.error("Failed to load workspace");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !workspaceId) {
      toast.error("Please enter an email");
      return;
    }

    setAddingLoading(true);
    try {
      await addWorkspaceMember(workspaceId, { email, role });
      toast.success("Member added successfully!");
      setEmail("");
      setRole("worker");
      setIsAddingMember(false);
      await fetchWorkspace();
    } catch (error) {
      console.error("Failed to add member:", error);
      toast.error("Failed to add member");
    } finally {
      setAddingLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!workspaceId) return;
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      await removeWorkspaceMember(workspaceId, userId);
      await fetchWorkspace();
      toast.success("Member removed");
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast.error("Failed to remove member");
    }
  };

  const handleUpdateRole = async (userId: string, newRole: "admin" | "assigner" | "worker") => {
    if (!workspaceId) return;

    try {
      await updateMemberRole(workspaceId, userId, { role: newRole });
      await fetchWorkspace();
      toast.success("Role updated");
      setEditingMemberId(null);
    } catch (error) {
      console.error("Failed to update role:", error);
      toast.error("Failed to update role");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-900/30 text-purple-400";
      case "assigner":
        return "bg-blue-900/30 text-blue-400";
      case "worker":
        return "bg-green-900/30 text-green-400";
      default:
        return "bg-gray-900/30 text-gray-400";
    }
  };

  const isAdmin = userRoleInWorkspace === "admin";

  return (
    <ProtectedWorkspaceRoute requiredRole="admin">
      <RoleBasedLayout workspaceId={workspaceId!}>
        <div className="min-h-screen">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Members
              </h1>
              <p className="text-muted-foreground">
                Manage your workspace members
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsAddingMember(!isAddingMember)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors flex items-center gap-2"
              >
                <FiPlus size={20} />
                Add Member
              </button>
            )}
          </motion.div>

          {/* Add Member Form */}
          <AnimatePresence>
            {isAddingMember && isAdmin && (
              <motion.form
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleAddMember}
                className="mb-8 p-6 bg-card border-2 border-border rounded-lg"
              >
                <h2 className="text-xl font-semibold mb-4">Add New Member</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                    autoFocus
                  />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="worker">Worker</option>
                    <option value="assigner">Assigner</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    type="submit"
                    disabled={addingLoading}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
                  >
                    {addingLoading ? "Adding..." : "Add Member"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingMember(false);
                    setEmail("");
                    setRole("worker");
                  }}
                  className="text-sm text-muted-foreground underline"
                >
                  Cancel
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Members List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading members...</p>
            </div>
          ) : !workspace || workspace.members.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card border-2 border-border rounded-lg p-12 text-center"
            >
              <FiUsers className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Members
              </h3>
              <p className="text-muted-foreground">Add members to collaborate</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              {workspace.members.map((member) => (
                <motion.div
                  key={member.userId}
                  whileHover={{ scale: 1.01 }}
                  className="p-6 bg-card border-2 border-border rounded-lg hover:border-primary transition-colors flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-foreground">
                      User ID: {member.userId}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Role Badge */}
                    {editingMemberId === member.userId && isAdmin ? (
                      <div className="flex gap-2">
                        <select
                          value={editingRole}
                          onChange={(e) =>
                            setEditingRole(e.target.value as any)
                          }
                          className="px-3 py-1 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary"
                        >
                          <option value="worker">Worker</option>
                          <option value="assigner">Assigner</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() =>
                            handleUpdateRole(member.userId, editingRole)
                          }
                          className="px-3 py-1 bg-green-900/30 text-green-400 hover:bg-green-900/50 rounded text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingMemberId(null)}
                          className="px-3 py-1 bg-accent text-foreground hover:bg-accent/80 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded capitalize ${getRoleBadgeColor(
                          member.role
                        )}`}
                      >
                        {member.role}
                      </span>
                    )}

                    {/* Actions */}
                    {isAdmin && member.userId !== user?.id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingMemberId(member.userId);
                            setEditingRole(member.role);
                          }}
                          className="p-2 hover:bg-accent rounded transition-colors"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member.userId)}
                          className="p-2 hover:bg-red-900/20 text-red-400 rounded transition-colors"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    )}
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

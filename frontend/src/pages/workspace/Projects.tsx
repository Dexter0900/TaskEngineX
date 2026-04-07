// src/pages/workspace/Projects.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiEdit2, FiTrash2, FiFolder } from "react-icons/fi";
import toast from "react-hot-toast";
import { useWorkspace } from "../../context/WorkspaceContext";
import RoleBasedLayout from "../../components/RoleBasedLayout";
import ProtectedWorkspaceRoute from "../../components/ProtectedWorkspaceRoute";
import { getWorkspaceProjects, createProject, deleteProject } from "../../api/projectApi";
import type { Project } from "../../types";

export default function WorkspaceProjects() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { userRoleInWorkspace } = useWorkspace();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [creatingLoading, setCreatingLoading] = useState(false);

  // Fetch projects
  useEffect(() => {
    if (workspaceId) {
      fetchProjects();
    }
  }, [workspaceId]);

  const fetchProjects = async () => {
    if (!workspaceId) return;
    try {
      setLoading(true);
      const data = await getWorkspaceProjects(workspaceId);
      setProjects(data.projects);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !workspaceId) {
      toast.error("Please enter project name");
      return;
    }

    setCreatingLoading(true);
    try {
      const result = await createProject(workspaceId, {
        name: newProjectName,
        description: newProjectDesc,
      });
      toast.success("Project created successfully!");
      setProjects([...projects, result.project]);
      setNewProjectName("");
      setNewProjectDesc("");
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project");
    } finally {
      setCreatingLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!workspaceId) return;
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await deleteProject(workspaceId, projectId);
      setProjects(projects.filter((p) => p._id !== projectId));
      toast.success("Project deleted");
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error("Failed to delete project");
    }
  };

  const canCreateProject =
    userRoleInWorkspace === "admin" || userRoleInWorkspace === "assigner";

  return (
    <ProtectedWorkspaceRoute>
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
                Projects
              </h1>
              <p className="text-muted-foreground">
                Manage your workspace projects
              </p>
            </div>
            {canCreateProject && (
              <button
                onClick={() => setIsCreating(!isCreating)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors flex items-center gap-2"
              >
                <FiPlus size={20} />
                New Project
              </button>
            )}
          </motion.div>

          {/* Create Project Form */}
          <AnimatePresence>
            {isCreating && (
              <motion.form
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleCreateProject}
                className="mb-8 p-6 bg-card border-2 border-border rounded-lg"
              >
                <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Project name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                    autoFocus
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    className="px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={creatingLoading}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
                  >
                    {creatingLoading ? "Creating..." : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setNewProjectName("");
                      setNewProjectDesc("");
                    }}
                    className="px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Projects Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card border-2 border-border rounded-lg p-12 text-center"
            >
              <FiFolder className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Projects Yet
              </h3>
              <p className="text-muted-foreground">
                {canCreateProject
                  ? "Create your first project to get started"
                  : "No projects available in this workspace"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {projects.map((project) => (
                <motion.div
                  key={project._id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 bg-card border-2 border-border rounded-lg hover:border-primary transition-colors cursor-pointer group"
                  onClick={() =>
                    navigate(`/workspace/${workspaceId}/projects/${project._id}`)
                  }
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <FiFolder className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {project.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {project.status === "active" ? "Active" : "Archived"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canCreateProject && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Edit functionality
                            }}
                            className="p-2 hover:bg-accent rounded transition-colors"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project._id);
                            }}
                            className="p-2 hover:bg-red-900/20 text-red-400 rounded transition-colors"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      👥 {project.assigners.length + project.workers.length} members
                    </span>
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

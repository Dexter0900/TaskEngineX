// src/pages/workspace/WorkspacesList.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { useWorkspace } from "../../context/WorkspaceContext";
import WorkspaceSelector from "../../components/WorkspaceSelector";
import Layout from "../../components/Layout";

export default function WorkspacesList() {
  const navigate = useNavigate();
  const { currentWorkspace, userWorkspaces, fetchUserWorkspaces } = useWorkspace();

  useEffect(() => {
    fetchUserWorkspaces();
  }, []);

  useEffect(() => {
    // If workspace is selected, redirect to dashboard
    if (currentWorkspace) {
      navigate(`/workspace/${currentWorkspace._id}/dashboard`);
    }
  }, [currentWorkspace]);

  return (
    <Layout>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-foreground">
            Welcome to TaskEngineX
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your workspaces and collaborate with your team
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-lg"
        >
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Your Workspaces
            </h2>
            <WorkspaceSelector />
          </div>

          {/* Workspace Cards Grid */}
          {userWorkspaces.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Quick Access
              </h3>
              <div className="grid gap-4">
                {userWorkspaces.map((workspace) => (
                  <motion.button
                    key={workspace._id}
                    onClick={() => navigate(`/workspace/${workspace._id}/dashboard`)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 bg-card border-2 border-border rounded-lg hover:border-primary transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <span className="font-semibold text-primary">
                              {workspace.name.substring(0, 1).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">
                              {workspace.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {workspace.members.length} member
                              {workspace.members.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                      <FiArrowRight className="text-muted-foreground" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {userWorkspaces.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center py-8"
            >
              <p className="text-muted-foreground mb-4">
                You don't have any workspaces yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Create your first workspace to get started with team collaboration.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}

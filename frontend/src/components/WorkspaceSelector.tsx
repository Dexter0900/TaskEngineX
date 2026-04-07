// src/components/WorkspaceSelector.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiPlus } from "react-icons/fi";
import { useWorkspace } from "../context/WorkspaceContext";
import toast from "react-hot-toast";

export default function WorkspaceSelector() {
  const navigate = useNavigate();
  const { currentWorkspace, userWorkspaces, fetchUserWorkspaces, setCurrentWorkspace } =
    useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch workspaces on mount
  useEffect(() => {
    fetchUserWorkspaces();
  }, []);

  const handleSelectWorkspace = (workspaceId: string) => {
    const workspace = userWorkspaces.find((w) => w._id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
      navigate(`/workspace/${workspaceId}/dashboard`);
      setIsOpen(false);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) {
      toast.error("Please enter a workspace name");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newWorkspaceName,
          description: "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create workspace");
      }

      const data = await response.json();
      toast.success("Workspace created successfully!");
      
      // Refresh workspaces list
      await fetchUserWorkspaces();
      
      // Navigate to new workspace
      setCurrentWorkspace(data.workspace);
      navigate(`/workspace/${data.workspace._id}/dashboard`);
      
      // Reset form
      setNewWorkspaceName("");
      setIsCreating(false);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create workspace:", error);
      toast.error("Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-sm">
      {/* Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 bg-card border-2 border-border rounded-lg hover:border-primary transition-colors flex items-center justify-between"
      >
        <div className="text-left">
          {currentWorkspace ? (
            <>
              <p className="text-sm font-semibold text-foreground">
                {currentWorkspace.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentWorkspace.members.length} members
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select a workspace</p>
          )}
        </div>
        <FiChevronDown
          size={20}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-card border-2 border-border rounded-lg shadow-lg z-50 overflow-hidden"
            >
              {/* Workspaces List */}
              {userWorkspaces.length > 0 ? (
                <div className="max-h-60 overflow-y-auto">
                  {userWorkspaces.map((workspace) => {
                    const isSelected = currentWorkspace?._id === workspace._id;
                    return (
                      <button
                        key={workspace._id}
                        onClick={() => handleSelectWorkspace(workspace._id)}
                        className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-accent transition-colors ${
                          isSelected ? "bg-primary/10 border-l-2 border-primary" : ""
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0 ${
                            isSelected ? "bg-primary text-white" : "bg-secondary text-foreground"
                          }`}
                        >
                          {workspace.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">
                            {workspace.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {workspace.members.length} member
                            {workspace.members.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="text-primary font-bold">✓</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No workspaces yet
                </div>
              )}

              {/* Divider */}
              {userWorkspaces.length > 0 && (
                <div className="h-px bg-border" />
              )}

              {/* Create New Workspace */}
              {!isCreating ? (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full px-4 py-3 flex items-center gap-2 text-primary hover:bg-accent transition-colors text-sm font-semibold"
                >
                  <FiPlus size={16} />
                  Create New Workspace
                </button>
              ) : (
                <form onSubmit={handleCreateWorkspace} className="p-4 border-t border-border">
                  <input
                    type="text"
                    placeholder="Workspace name..."
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary text-sm mb-3"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-sm font-semibold disabled:opacity-50"
                    >
                      {loading ? "Creating..." : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setNewWorkspaceName("");
                      }}
                      className="flex-1 px-3 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

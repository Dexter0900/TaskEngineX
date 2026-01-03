import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiCheck, FiX, FiTrash2, FiEdit2 } from "react-icons/fi";
import {
  getSubtasks,
  createSubtask,
  toggleSubtask,
  updateSubtask,
  deleteSubtask,
} from "../api/subtaskApi";
import type { Subtask } from "../types";
import toast from "react-hot-toast";

interface SubtaskListProps {
  taskId: string;
}

export default function SubtaskList({ taskId }: SubtaskListProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchSubtasks();
  }, [taskId]);

  const fetchSubtasks = async () => {
    try {
      setLoading(true);
      const response = await getSubtasks(taskId);
      setSubtasks(response.subtasks);
    } catch (error) {
      console.error("Failed to load subtasks");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSubtaskTitle.trim()) {
      toast.error("Subtask title is required");
      return;
    }

    try {
      const response = await createSubtask(taskId, newSubtaskTitle.trim());
      setSubtasks([...subtasks, response.subtask]);
      setNewSubtaskTitle("");
      setIsAdding(false);
      toast.success("Subtask added!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create subtask");
    }
  };

  const handleToggle = async (subtaskId: string) => {
    try {
      const response = await toggleSubtask(taskId, subtaskId);
      setSubtasks(
        subtasks.map((st) =>
          st._id === subtaskId ? response.subtask : st
        )
      );
    } catch (error) {
      toast.error("Failed to toggle subtask");
    }
  };

  const handleUpdate = async (subtaskId: string) => {
    if (!editTitle.trim()) {
      toast.error("Subtask title is required");
      return;
    }

    try {
      const response = await updateSubtask(taskId, subtaskId, editTitle.trim());
      setSubtasks(
        subtasks.map((st) =>
          st._id === subtaskId ? response.subtask : st
        )
      );
      setEditingId(null);
      setEditTitle("");
      toast.success("Subtask updated!");
    } catch (error) {
      toast.error("Failed to update subtask");
    }
  };

  const handleDelete = async (subtaskId: string) => {
    try {
      await deleteSubtask(taskId, subtaskId);
      setSubtasks(subtasks.filter((st) => st._id !== subtaskId));
      toast.success("Subtask deleted!");
    } catch (error) {
      toast.error("Failed to delete subtask");
    }
  };

  const completedCount = subtasks.filter((st) => st.completed).length;
  const totalCount = subtasks.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-800"></div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Subtasks Progress</span>
            <span>
              {completedCount}/{totalCount} completed
            </span>
          </div>
          <div className="w-full bg-accent rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className="bg-rose-800 h-2 rounded-full transition-all"
            />
          </div>
        </div>
      )}

      {/* Subtasks List */}
      <div className="space-y-2">
        <AnimatePresence>
          {subtasks.map((subtask) => (
            <motion.div
              key={subtask._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-2 group"
            >
              {editingId === subtask._id ? (
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdate(subtask._id);
                      if (e.key === "Escape") {
                        setEditingId(null);
                        setEditTitle("");
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-sm bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleUpdate(subtask._id)}
                    className="p-1.5 hover:bg-accent rounded-lg transition-colors"
                    title="Save"
                  >
                    <FiCheck className="w-4 h-4 text-green-600" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditTitle("");
                    }}
                    className="p-1.5 hover:bg-accent rounded-lg transition-colors"
                    title="Cancel"
                  >
                    <FiX className="w-4 h-4 text-red-600" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleToggle(subtask._id)}
                    className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      subtask.completed
                        ? "bg-rose-800 border-rose-800"
                        : "border-input hover:border-rose-800"
                    }`}
                  >
                    {subtask.completed && (
                      <FiCheck className="w-3 h-3 text-primary-foreground" />
                    )}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      subtask.completed
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {subtask.title}
                  </span>
                  <button
                    onClick={() => {
                      setEditingId(subtask._id);
                      setEditTitle(subtask.title);
                    }}
                    className="p-1.5 hover:bg-accent rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Edit subtask"
                  >
                    <FiEdit2 className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(subtask._id)}
                    className="p-1.5 hover:bg-accent rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete subtask"
                  >
                    <FiTrash2 className="w-3.5 h-3.5 text-red-600" />
                  </button>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Subtask Form */}
      {isAdding ? (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCreate}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsAdding(false);
                setNewSubtaskTitle("");
              }
            }}
            placeholder="New subtask..."
            className="flex-1 px-3 py-1.5 text-sm bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring outline-none"
            autoFocus
          />
          <button
            type="submit"
            className="p-1.5 hover:bg-accent rounded-lg transition-colors"
            title="Add"
          >
            <FiCheck className="w-4 h-4 text-green-600" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setNewSubtaskTitle("");
            }}
            className="p-1.5 hover:bg-accent rounded-lg transition-colors"
            title="Cancel"
          >
            <FiX className="w-4 h-4 text-red-600" />
          </button>
        </motion.form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 text-sm text-rose-800 hover:text-rose-900 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add subtask</span>
        </button>
      )}
    </div>
  );
}

// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllTasks, getTaskStats } from "../api/taskApi";
import type { Task, TaskStatsResponse } from "../types";
import { logout as logoutApi } from "../api/authApi";

/**
 * DASHBOARD PAGE
 * User ke tasks dikhata hai aur manage karne deta
 */
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStatsResponse["stats"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * FETCH DATA ON MOUNT
   * Tasks aur stats load karo
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Parallel requests (dono ek saath)
        const [tasksResponse, statsResponse] = await Promise.all([
          getAllTasks(),
          getTaskStats(),
        ]);

        setTasks(tasksResponse.tasks);
        setStats(statsResponse.stats);

        console.log("✅ Dashboard data loaded");
      } catch (err: any) {
        console.error("❌ Dashboard data error:", err);
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * HANDLE LOGOUT
   * User ko logout karta
   */
  const handleLogout = async () => {
    try {
      await logoutApi();
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      // Force logout even if API fails
      logout();
      navigate("/login", { replace: true });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
        <h2>Error: {error}</h2>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
      }}>
        <div>
          <h1>TaskEngineX Dashboard 🚀</h1>
          <p>Welcome back, {user?.name}! ({user?.email})</p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "10px 20px",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}>
          <StatCard title="Total Tasks" value={stats.total} color="#3b82f6" />
          <StatCard title="Pending" value={stats.pending} color="#f59e0b" />
          <StatCard title="In Progress" value={stats.inProgress} color="#8b5cf6" />
          <StatCard title="Completed" value={stats.completed} color="#10b981" />
          <StatCard title="High Priority" value={stats.highPriority} color="#ef4444" />
        </div>
      )}

      {/* Tasks List */}
      <div>
        <h2>Your Tasks ({tasks.length})</h2>

        {tasks.length === 0 ? (
          <div style={{
            padding: "40px",
            textAlign: "center",
            border: "2px dashed #ccc",
            borderRadius: "8px",
          }}>
            <p style={{ fontSize: "18px", color: "#666" }}>
              No tasks yet. Start by creating one!
            </p>
            <button style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#4F46E5",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}>
              + Create Task
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* Note */}
      <div style={{
        marginTop: "40px",
        padding: "20px",
        backgroundColor: "#f3f4f6",
        borderRadius: "8px",
      }}>
        <p style={{ margin: 0, color: "#666" }}>
          💡 <strong>Next Steps:</strong> Kal UI improve karenge, create/edit/delete functionality add karenge!
        </p>
      </div>
    </div>
  );
};

/**
 * STAT CARD COMPONENT
 * Dashboard stats ke liye reusable card
 */
const StatCard = ({ title, value, color }: { title: string; value: number; color: string }) => (
  <div style={{
    padding: "20px",
    backgroundColor: "white",
    border: `2px solid ${color}`,
    borderRadius: "8px",
  }}>
    <h3 style={{ margin: "0 0 10px 0", color: "#666", fontSize: "14px" }}>{title}</h3>
    <p style={{ margin: 0, fontSize: "32px", fontWeight: "bold", color }}>{value}</p>
  </div>
);

/**
 * TASK CARD COMPONENT
 * Single task display (basic version)
 */
const TaskCard = ({ task }: { task: Task }) => {
  const statusColors = {
    pending: "#f59e0b",
    "in-progress": "#8b5cf6",
    completed: "#10b981",
  };

  const priorityColors = {
    low: "#3b82f6",
    medium: "#f59e0b",
    high: "#ef4444",
  };

  return (
    <div style={{
      padding: "15px",
      backgroundColor: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <div>
          <h3 style={{ margin: "0 0 8px 0" }}>{task.title}</h3>
          {task.description && (
            <p style={{ margin: "0 0 10px 0", color: "#666" }}>{task.description}</p>
          )}
          <div style={{ display: "flex", gap: "10px", fontSize: "12px" }}>
            <span style={{
              padding: "4px 8px",
              backgroundColor: statusColors[task.status],
              color: "white",
              borderRadius: "4px",
            }}>
              {task.status}
            </span>
            <span style={{
              padding: "4px 8px",
              backgroundColor: priorityColors[task.priority],
              color: "white",
              borderRadius: "4px",
            }}>
              {task.priority}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
// src/components/sidebars/AdminSidebar.tsx
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiHome,
  FiCheckSquare,
  FiLogOut,
  FiSettings,
  FiUser,
  FiFolder,
  FiUsers,
  FiTrendingUp,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { logout } from "../../api/authApi";
import { useWorkspace } from "../../context/WorkspaceContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

interface AdminSidebarProps {
  workspaceId: string;
  onLogout?: () => void;
}

export default function AdminSidebar({ workspaceId, onLogout }: AdminSidebarProps) {
  const { user, logout: authLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentWorkspace } = useWorkspace();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Admin ke liye menu items
  const workspaceMenuItems = [
    {
      icon: FiHome,
      label: "Dashboard",
      path: `/workspace/${workspaceId}/dashboard`,
    },
    {
      icon: FiFolder,
      label: "Projects",
      path: `/workspace/${workspaceId}/projects`,
    },
    {
      icon: FiCheckSquare,
      label: "Tasks",
      path: `/workspace/${workspaceId}/tasks`,
    },
    {
      icon: FiUsers,
      label: "Members",
      path: `/workspace/${workspaceId}/members`,
    },
    {
      icon: FiTrendingUp,
      label: "Analytics",
      path: `/workspace/${workspaceId}/analytics`,
    },
    {
      icon: FiSettings,
      label: "Settings",
      path: `/workspace/${workspaceId}/settings`,
    },
  ];

  const personalMenuItems = [
    { icon: FiCheckSquare, label: "My Tasks", path: "/tasks" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      authLogout();
      toast.success("Logged out successfully");
      navigate("/login");
      onLogout?.();
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <aside className="w-15 border-r border-border bg-card flex flex-col items-center py-4 gap-8 fixed h-screen">
      {/* Logo */}
      <Link
        to={`/workspace/${workspaceId}/dashboard`}
        className="w-12 h-12 bg-primary flex items-center justify-center hover:bg-primary/70 transition-colors group relative rounded"
      >
        <span className="text-white font-bold text-lg">TX</span>
        <div className="absolute left-20 px-3 py-1 bg-accent text-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          TaskEngineX
        </div>
      </Link>

      {/* Workspace Indicator */}
      {currentWorkspace && (
        <div className="w-12 h-12 bg-secondary flex items-center justify-center rounded-lg group relative hover:bg-secondary/80 transition-colors">
          <span className="text-foreground font-semibold text-xs text-center px-1 line-clamp-1">
            {currentWorkspace.name.substring(0, 2).toUpperCase()}
          </span>
          <div className="absolute left-20 px-3 py-1 bg-accent text-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none max-w-xs">
            {currentWorkspace.name}
          </div>
        </div>
      )}

      {/* Workspace Navigation */}
      <nav className="flex flex-col gap-3">
        {workspaceMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative w-12 h-12 flex items-center justify-center rounded-lg transition-all group ${
                isActive
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              <Icon size={20} />
              <div className="absolute left-20 px-3 py-1 bg-accent text-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="w-8 h-px bg-border" />

      {/* Personal Tasks */}
      <nav className="flex flex-col gap-3">
        {personalMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative w-12 h-12 flex items-center justify-center rounded-lg transition-all group ${
                isActive
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-accent"
              }`}
              title="Personal Tasks"
            >
              <Icon size={20} />
              <div className="absolute left-20 px-3 py-1 bg-accent text-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                My Personal Tasks
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User Profile Button */}
      <div className="relative">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="w-12 h-12 bg-primary hover:bg-primary/70 rounded-full flex items-center justify-center text-white font-medium transition-colors group relative"
          title={user?.firstName}
        >
          {user?.firstName?.[0]?.toUpperCase() || "U"}
          <div className="absolute left-20 px-3 py-1 bg-accent text-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Profile
          </div>
        </button>

        {/* User Dropdown Menu */}
        <AnimatePresence>
          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: -10 }}
                className="absolute bottom-16 left-0 w-56 bg-card border-2 border-border rounded-lg shadow-lg z-50 overflow-hidden"
              >
                <div className="p-3 border-b-2 border-border">
                  <p className="text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-primary font-semibold mt-1">
                    👑 Admin
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <FiUser size={16} />
                    Profile
                  </Link>
                  <Link
                    to="/set-password"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <FiSettings size={16} />
                    Set Password
                  </Link>
                </div>

                <div className="border-t-2 border-border py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                  >
                    <FiLogOut size={16} />
                    Logout
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}

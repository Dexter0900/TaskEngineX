import { type ReactNode, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiCheckSquare,
  FiLogOut,
  FiSettings,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { logout } from "../api/authApi";
import toast from "react-hot-toast";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout: authLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuItems = [
    { icon: FiHome, label: "Dashboard", path: "/dashboard" },
    { icon: FiCheckSquare, label: "Tasks", path: "/tasks" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      authLogout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Thin Vertical Sidebar */}
      <aside className="w-15 border-r border-border bg-card flex flex-col items-center py-14 gap-12 fixed h-screen">
        {/* Logo */}
        <Link
          to="/dashboard"
          className="w-full h-12 bg-primary flex items-center justify-center hover:bg-primary/70 transition-colors group relative"
        >
          <span className="text-white font-medium text-lg">TX</span>
          <div className="absolute left-20 px-3 py-1 bg-accent text-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            TaskEngineX
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative w-12 h-12 flex items-center justify-center rounded-lg transition-all group ${
                  isActive ? "bg-primary text-white" : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <Icon size={24} />
                {/* Tooltip */}
                <div className="absolute left-20 px-3 py-1 bg-accent text-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.label}
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
            {/* Tooltip */}
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
                  className="absolute bottom-16 left-0 w-56 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden"
                >
                  <div className="p-3 border-b border-border">
                    <p className="text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
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

                  <div className="border-t border-border py-1">
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

      {/* Main Content */}
      <main className="flex-1 ml-20 mr-15 mt-5 mb-5">
        <div className="container mx-auto p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
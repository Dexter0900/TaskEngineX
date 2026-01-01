import { type ReactNode, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiCheckSquare,
  FiLogOut,
  FiMenu,
  FiX,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Left: Logo + Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
            >
              {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>

            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-800 rounded-lg flex items-center justify-center">
                <FiCheckSquare className="text-white" size={18} />
              </div>
              <span className="font-bold text-lg hidden sm:inline">TaskEngineX</span>
            </Link>
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center gap-2">
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-rose-800 rounded-full flex items-center justify-center text-sm font-medium">
                  {user?.firstName?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="hidden sm:inline text-sm font-medium">
                  {user?.firstName}
                </span>
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden"
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
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
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
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 border-r border-border bg-card min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-rose-800 text-primary-foreground shadow-md"
                      : "hover:bg-accent text-foreground"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Sidebar - Mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border z-40 lg:hidden"
              >
                <nav className="p-4 space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          isActive
                            ? "bg-rose-800 text-primary-foreground shadow-md"
                            : "hover:bg-accent text-foreground"
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          <div className="container mx-auto p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
// src/app.ts
import express from "express";
import cors from "cors";
import passport from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import subtaskRoutes from "./routes/subtaskRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import { ENV } from "./config/env.js";

const app = express();

// ============================================
// MIDDLEWARES
// ============================================

/**
 * CORS - Frontend ko backend access dene ke liye
 * Origin: Kaunsi URL se requests allowed hain
 * Credentials: Cookies/auth headers allow karo
 * Methods: Allowed HTTP methods
 * AllowedHeaders: Allowed request headers
 */

const allowedOrigins = [
  ENV.FRONTEND_URL, // Production frontend URL
  "http://localhost:5173", // Local development
  "http://localhost:5174", // Alternative local port
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Postman / server-to-server requests
      if (!origin) return callback(null, true);

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Vercel preview deployments (dexter0900s-projects.vercel.app)
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      // Block all other origins
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
    optionsSuccessStatus: 200,
  }),
);

/**
 * Body Parsers
 * express.json() - JSON data parse karta (POST/PUT requests mein)
 * express.urlencoded() - Form data parse karta
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Passport Initialization
 * Google OAuth ke liye
 */
app.use(passport.initialize());

// ============================================
// ROUTES
// ============================================

/**
 * Health Check Route
 * GET /
 * Check karne ke liye server chal raha ya nahi
 */
app.get("/", (req, res) => {
  res.json({
    message: "TaskEngineX API 🚀",
    status: "active",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Authentication Routes
 * Prefix: /api/auth
 *
 * Available endpoints:
 *   POST   /api/auth/magic-link/send     - Send magic link email
 *   POST   /api/auth/magic-link/verify   - Verify and login
 *   GET    /api/auth/google              - Redirect to Google OAuth
 *   GET    /api/auth/google/callback     - Google callback
 *   GET    /api/auth/me                  - Get current user (protected)
 *   POST   /api/auth/logout              - Logout (protected)
 */
app.use("/api/auth", authRoutes);

/**
 * Workspace Routes
 * Prefix: /api/workspaces
 *
 * Available endpoints:
 *   POST   /api/workspaces                              - Create workspace
 *   GET    /api/workspaces                              - Get user's workspaces
 *   GET    /api/workspaces/:workspaceId                 - Get workspace details
 *   PUT    /api/workspaces/:workspaceId                 - Update workspace (admin only)
 *   DELETE /api/workspaces/:workspaceId                 - Delete workspace (admin only)
 *   POST   /api/workspaces/:workspaceId/members         - Add member (admin only)
 *   PATCH  /api/workspaces/:workspaceId/members/:userId/role - Update role (admin only)
 *   DELETE /api/workspaces/:workspaceId/members/:userId - Remove member (admin only)
 *
 * Note: All routes are protected (JWT required)
 */
app.use("/api/workspaces", workspaceRoutes);

/**
 * Project Routes
 * Prefix: /api/workspaces/:workspaceId/projects
 *
 * Available endpoints:
 *   POST   /api/workspaces/:workspaceId/projects                       - Create project
 *   GET    /api/workspaces/:workspaceId/projects                       - Get workspace projects
 *   GET    /api/workspaces/:workspaceId/projects/:projectId            - Get project details
 *   PUT    /api/workspaces/:workspaceId/projects/:projectId            - Update project
 *   DELETE /api/workspaces/:workspaceId/projects/:projectId            - Delete project (admin only)
 *   POST   /api/workspaces/:workspaceId/projects/:projectId/assigners  - Add assigner (admin only)
 *   POST   /api/workspaces/:workspaceId/projects/:projectId/workers    - Add worker
 *   DELETE /api/workspaces/:workspaceId/projects/:projectId/members    - Remove member (admin only)
 *
 * Note: All routes require workspace membership and appropriate role
 */
app.use("/api/workspaces/:workspaceId/projects", projectRoutes);

/**
 * Task Routes
 * Prefix: /api/tasks
 *
 * Available endpoints:
 *   POST   /api/tasks                 - Create task
 *   GET    /api/tasks                 - Get all tasks (with filters)
 *   GET    /api/tasks/stats           - Get task statistics
 *   GET    /api/tasks/:id             - Get single task
 *   PUT    /api/tasks/:id             - Update task
 *   DELETE /api/tasks/:id             - Delete task
 *   PATCH  /api/tasks/:id/toggle      - Toggle task status
 *   PATCH  /api/tasks/:id/mark-complete - Mark task as complete (worker)
 *   PATCH  /api/tasks/:id/approval    - Approve/reject task (assigner)
 *
 * Workspace task endpoints:
 *   POST   /api/workspaces/:workspaceId/projects/:projectId/tasks - Create workspace task
 *   GET    /api/workspaces/:workspaceId/tasks                     - Get workspace tasks
 *   GET    /api/workspaces/:workspaceId/tasks/stats               - Get workspace task stats
 *
 * Subtask endpoints:
 *   GET    /api/tasks/:taskId/subtasks                  - Get all subtasks
 *   POST   /api/tasks/:taskId/subtasks                  - Create subtask
 *   PATCH  /api/tasks/:taskId/subtasks/:subtaskId/toggle - Toggle subtask
 *   PUT    /api/tasks/:taskId/subtasks/:subtaskId       - Update subtask
 *   DELETE /api/tasks/:taskId/subtasks/:subtaskId       - Delete subtask
 *
 * Note: Saari routes protected hain (JWT required)
 */
app.use("/api/tasks", taskRoutes);
app.use("/api/tasks", subtaskRoutes);

// ============================================
// ERROR HANDLING
// ============================================

/**
 * 404 Handler - Unknown routes ke liye
 * Agar koi route match nahi hota toh ye chalega
 */
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.path,
    method: req.method,
  });
});

/**
 * Global Error Handler
 * Agar kahi bhi error aaye toh ye catch karega
 */
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Global error:", err);

    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
      ...(ENV.NODE_ENV === "development" && { stack: err.stack }),
    });
  },
);

export default app;

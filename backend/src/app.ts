// src/app.ts
import express from "express";
import cors from "cors";
import passport from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";  // NEW - Task routes import
import { ENV } from "./config/env.js";

const app = express();

// ============================================
// MIDDLEWARES
// ============================================

/**
 * CORS - Frontend ko backend access dene ke liye
 * Origin: Kaunsi URL se requests allowed hain
 * Credentials: Cookies/auth headers allow karo
 */
app.use(cors({
  origin: ENV.FRONTEND_URL,
  credentials: true,
}));

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
    timestamp: new Date().toISOString()
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
 * 
 * Note: Saari routes protected hain (JWT required)
 */
app.use("/api/tasks", taskRoutes);  // NEW - Task routes register

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
    method: req.method
  });
});

/**
 * Global Error Handler
 * Agar kahi bhi error aaye toh ye catch karega
 */
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global error:", err);
  
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(ENV.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;
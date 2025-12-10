import express from "express";
import cors from "cors";
import passport from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import { ENV } from "./config/env.js";

const app = express();

// Middlewares
app.use(cors({
  origin: ENV.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport
app.use(passport.initialize());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "TaskEngineX API 🚀" });
});

app.use("/api/auth", authRoutes);

export default app;
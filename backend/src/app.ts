import express from "express";
import cors from "cors";

// Create express app instance
const app = express();

// Middlewares
app.use(cors()); // allow frontend to call backend
app.use(express.json()); // allow JSON body

// Basic test route
app.get("/", (req, res) => {
  res.send("API is working! 🚀");
});

export default app;

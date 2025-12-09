import app from "./app.js";
import express from "express";
import { connectDB } from "./config/db.js";
import { ENV } from "./config/env.js";

app.use(express.json());

connectDB(); // connect to MongoDB

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.listen(ENV.PORT, () =>
  console.log(`🚀 Server is running on http://localhost:${ENV.PORT}`)
);
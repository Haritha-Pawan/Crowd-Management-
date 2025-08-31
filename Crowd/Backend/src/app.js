// backend/src/app.js
const express = require("express");
const cors = require("cors");
const dbConnect = require("./config/db");
const taskRoutes = require("./routes/taskRoutes");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const app = express();

// connect DB first
dbConnect();

// core middlewares
app.use(cors());
app.use(express.json());

// health check
app.get("/", (_req, res) => {
  res.json({ message: "Welcome to the Task Management API" });
});

// routes
app.use("/api/tasks", taskRoutes);

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;

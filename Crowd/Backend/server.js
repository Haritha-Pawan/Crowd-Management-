import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import zoneRouter from "./src/Modules/Parking/Route/zone.Route.js";
import taskRoutes from "./src/Modules/task/Route/task.Route.js";
import counterRoutes from "./src/Modules/Counter/Routes/counter.Route.js";
import userRouter from "./src/Modules/User/User.routes.js";
import AuthRoutes from "./src/Modules/User/AuthRoutes.js";

import reservationRoutes from "../Backend/src/Modules/Parking/Route/reservation.route.js"; // uses ParkingSpot model under the hood
import spotRouter from "./src/routes/spot.routes.js";   // (Modules) legacy/admin spot routes

// “ParkingSpot” stack (lives outside Modules/)
import places from "./src/routes/place.routes.js";
import spots from "./src/routes/spot.routes.js";                       // uses models/ParkingSpot.js

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected:", mongoose.connection.name);
  })
  .catch((err) => {
    console.error("Mongo connection error:", err);
  });

// Health
app.get("/", (_req, res) => {
  res.json({ message: "Welcome to Event Management API" });
});

// Auth & Users
app.use("/auth", AuthRoutes);
app.use("/users", userRouter);

// Core Modules
app.use("/api/tasks", taskRoutes);
app.use("/api/counter", counterRoutes);
app.use("/api/parking-zone", zoneRouter);

// Places & ParkingSpot (new stack)
app.use("/api/places", places);
app.use("/api/parkingSpots", spots);   // GET /api/parkingSpots (availability by time window)

// Spots (Modules stack - keep if other parts rely on it, e.g. PATCH /api/spots/:id/status)
app.use("/api/spots", spotRouter);

// Reservations (uses ParkingSpot model under the hood)
app.use("/api/reservations", reservationRoutes);

// Start
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

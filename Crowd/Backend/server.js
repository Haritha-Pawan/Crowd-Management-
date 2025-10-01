
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import taskRoutes from './src/Modules/task/Route/task.Route.js';
import counterRoutes from './src/Modules/Counter/Routes/counter.Route.js';
import userRouter from './src/Modules/User/User.routes.js';
import AuthRoutes from './src/Modules/User/AuthRoutes.js';
import OtherRoutes from './src/Modules/User/Other.routes.js';



import zoneRouter from './src/Modules/Parking/Route/zone.Route.js';
import spotRouter from './src/Modules/Parking/Route/spot.Route.js';
import reservationRoutes from './src/Modules/Parking/Route/reservation.Route.js';





dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());



mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// User routes
app.use('/users', userRouter);

app.use('/auth', AuthRoutes);

//other routes
app.use('/other', OtherRoutes);



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


app.use("/api/counter",counterRoutes);




//Parking Routes
app.use("/api/zone",zoneRouter);
app.use("/api/spots",spotRouter);
app.use("/api/reservations",reservationRoutes);



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

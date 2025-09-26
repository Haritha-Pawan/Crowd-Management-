import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import zoneRouter from './src/Modules/Parking/Route/zone.Route.js';
import taskRoutes from './src/Modules/task/Route/task.Route.js';
import counterRoutes from './src/Modules/Counter/Routes/counter.Route.js';
import userRouter from './src/Modules/User/User.routes.js';
import AuthRoutes from './src/Modules/User/AuthRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// User routes
app.use('/users', userRouter);

app.use('/auth', AuthRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: "Welcome to Event Management API" });
});


app.use("/api/parking-zone",zoneRouter);
app.use("/api/tasks", taskRoutes);
app.use("/api/counter",counterRoutes);


// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

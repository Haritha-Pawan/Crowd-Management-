import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './src/Modules/User/User.routes.js';
import AuthRoutes from './src/Modules/User/AuthRoutes.js';

dotenv.config();

console.log("hello world");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());


// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// User routes
app.use('/users', userRouter);

// Auth routes
app.use('/auth', AuthRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: "Welcome to Event Management API" });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';

// ✅ Import routes
import incidentRoutes from './src/Modules/Incident/Route/incident.route.js';
import zoneRouter from './src/Modules/Parking/Route/zone.Route.js';
import taskRoutes from './src/Modules/task/Route/task.Route.js';
import counterRoutes from './src/Modules/Counter/Routes/counter.Route.js';
import userRouter from './src/Modules/User/User.routes.js';
import AuthRoutes from './src/Modules/User/AuthRoutes.js';
import OtherRoutes from './src/Modules/User/Other.routes.js';
import coordinatorRoutes from "./src/Modules/notifications/Route/coordinator.route.js";
import checkoutRouter from "./src/Modules/Register/Route/ticket.route.js";
import reservationRoutes from './src/Modules/Parking/Route/reservation.route.js';
import spotRouter from './src/Modules/Parking/Route/spot.route.js';
import notificationRoutes from './src/Modules/notifications/Route/notification.route.js';

// ✅ Load environment variables
dotenv.config();

// ✅ App setup
const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ✅ HTTP server for Socket.IO
const server = http.createServer(app);

// ✅ Socket.IO server instance with dynamic CORS
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
  }
});

// ✅ CORS middleware with dynamic origin
const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Static files (uploads)
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// ✅ MongoDB connection
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ✅ Register API routes
app.use('/api/support', incidentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/counter', counterRoutes);
app.use('/api/checkout', checkoutRouter);
app.use('/api/zone', zoneRouter);
app.use('/api/spots', spotRouter);
app.use('/api/reservations', reservationRoutes);
app.use('/api/coord-notifications', coordinatorRoutes);

// ✅ User-related routes
app.use('/users', userRouter);
app.use('/auth', AuthRoutes);
app.use('/other', OtherRoutes);

// ✅ Make io available inside controllers
app.set('io', io);

// ✅ Socket.IO connection logic
io.on('connection', (socket) => {
  console.log('🔗 Socket connected:', socket.id);

  // --- Join room (supports string or object payload) ---
  socket.on('joinRoom', (payload) => {
    if (typeof payload === 'string') {
      const role = payload;
      socket.join(role);
      socket.join(`role:${role}`);
      console.log(`Socket ${socket.id} joined rooms: "${role}" and "role:${role}"`);
    } else if (payload && typeof payload === 'object') {
      const { role, userId } = payload || {};
      if (role) {
        socket.join(role);
        socket.join(`role:${role}`);
        console.log(`Socket ${socket.id} joined rooms: "${role}" and "role:${role}"`);
      }
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`Socket ${socket.id} joined room: "user:${userId}"`);
      }
    }
  });

  // --- New join style ---
  socket.on('join', ({ role, userId } = {}) => {
    if (role) {
      socket.join(role);
      socket.join(`role:${role}`);
      console.log(`Socket ${socket.id} joined rooms: "${role}" and "role:${role}"`);
    }
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`Socket ${socket.id} joined room: "user:${userId}"`);
    }
  });

  // --- Leave room ---
  socket.on('leaveRoom', (room) => {
    try {
      socket.leave(room);
      socket.leave(`role:${room}`);
      console.log(`Socket ${socket.id} left rooms: "${room}" and "role:${room}"`);
    } catch {}
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected:', socket.id);
  });
});

// ✅ Health check route
app.get('/', (req, res) => {
  res.json({ status: 'Server is running...', environment: process.env.NODE_ENV || 'development' });
});

// ✅ Start server
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS Origin: ${FRONTEND_URL}`);
});

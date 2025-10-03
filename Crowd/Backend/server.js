import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';

// ✅ Import existing routes
import incidentRoutes from './src/Modules/Incident/Route/incident.route.js';
import zoneRouter from './src/Modules/Parking/Route/zone.Route.js';
import taskRoutes from './src/Modules/task/Route/task.Route.js';

// ✅ Notifications route
import notificationRoutes from './src/Modules/notifications/Route/notification.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ HTTP server for Socket.IO
const server = http.createServer(app);

// ✅ Socket.IO server instance
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // your frontend URL
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
  }
});

// ✅ CORS + JSON
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// ✅ Static files (uploads)
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// ✅ Register API routes
app.use('/api/support', incidentRoutes);
app.use('/api/parking-zone', zoneRouter);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);

// ✅ Make io available inside controllers
app.set('io', io);

// ✅ Socket.IO logic
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // --- Backward-compat: your existing client emits a string role ---
  //   socket.emit("joinRoom", "Attendee")
  socket.on('joinRoom', (payload) => {
    if (typeof payload === 'string') {
      const role = payload;
      // legacy room (old controllers may emit to this)
      socket.join(role);
      // namespaced role room (new controllers emit to this)
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

  // --- New style: socket.emit("join", { userId, role }) ---
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

  // Optional: allow clients to leave a room
  socket.on('leaveRoom', (room) => {
    try {
      socket.leave(room);
      socket.leave(`role:${room}`);
      console.log(`Socket ${socket.id} left rooms: "${room}" and "role:${room}"`);
    } catch {}
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// ✅ Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

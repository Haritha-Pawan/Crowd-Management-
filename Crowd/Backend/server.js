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
import counterRoutes from './src/Modules/Counter/Routes/counter.Route.js';
import userRouter from './src/Modules/User/User.routes.js';
import AuthRoutes from './src/Modules/User/AuthRoutes.js';
import OtherRoutes from './src/Modules/User/Other.routes.js';

import coordinatorRoutes from "./src/Modules/notifications/Route/coordinator.route.js"

import checkoutRouter from "./src/Modules/Register/Route/ticket.route.js";


import reservationRoutes from './src/Modules/Parking/Route/reservation.route.js';
import spotRouter from './src/Modules/Parking/Route/spot.route.js';




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
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true
  })
);
app.use(express.json());

// ✅ Static files (uploads)
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// ✅ Register API routes
app.use('/api/support', incidentRoutes);

app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/counter', counterRoutes);
app.use("/api/checkout", checkoutRouter);
app.use('/api/zone', zoneRouter);
app.use('/api/spots', spotRouter);
app.use('/api/reservations', reservationRoutes);
app.use("/api/coord-notifications", coordinatorRoutes);

// ✅ User-related routes
app.use('/users', userRouter);
app.use('/auth', AuthRoutes);
app.use('/other', OtherRoutes);

// ✅ Make io available inside controllers
app.set('io', io);

// ✅ Socket.IO logic
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // --- Backward-compat ---
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

  // --- New style ---
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
    console.log('Socket disconnected:', socket.id);
  });
});

// ✅ Root route
app.get('/', (req, res) => {
  res.send('Server is running...');
});

// ✅ Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// User routes(lahiru)
app.use('/users', userRouter);
app.use('/auth', AuthRoutes);
//other routes
app.use('/other', OtherRoutes);



app.get('/', (req, res) => {
  // DB
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB Connected:", mongoose.connection.name);
    })
    .catch((err) => {
      console.error("Mongo connection error:", err);
    });



// DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected:", mongoose.connection.name);
  })
  .catch((err) => {
    console.error("Mongo connection error:", err);
  });



// Auth & Users routes
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

});

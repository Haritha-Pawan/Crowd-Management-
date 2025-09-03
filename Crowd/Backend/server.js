
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import zoneRouter from './src/Modules/Parking/Route/zone.Route.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


//mongo connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));


app.use("/api/parking-zone",zoneRouter);



/*
// Routes
const taskRoutes = require('./routes/taskRoutes');
app.use('/api', taskRoutes);

// Default routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Task Management API' });
});*/

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import zoneRouter from './src/Modules/Parking/Route/zone.Route.js';
import taskRoutes from './src/Modules/task/Route/task.Route.js';


import reservationRoutes from './src/Modules/Parking/Route/reservation.route.js';
import spotRouter from './src/Modules/Parking/Route/spot.route.js';


//new routes for places
import places from './src/routes/place.routes.js'
import spots from './src/routes/spot.routes.js'






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
+app.use("/api/places", places);
app.use("/api/tasks", taskRoutes);
app.use('./api/reservations', reservationRoutes);





//new rotes for zone zdding nd 
app.use('/api/places', places);
app.use('/api/parkingSpots', spots);








// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
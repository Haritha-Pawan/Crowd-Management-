const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Routes
const taskRoutes = require('./routes/taskRoutes');
app.use('/api', taskRoutes);

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Task Management API' });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require('express');
const Task = require('../models/Task');
const router = express.Router();

// Get all tasks
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new task
router.post('/tasks', async (req, res) => {
  const { title, description, coordinator, priority, status, dueDate } = req.body;
  const newTask = new Task({ title, description, coordinator, priority, status, dueDate });

  try {
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

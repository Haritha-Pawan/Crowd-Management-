import Task from "../model/task.model.js";
import {notifyCoordinatorByName } from "../../notifications/notifications/notification.service.js"

// GET /api/tasks
export const listTasks = async (_req, res) => {
  const rows = await Task.find().sort({ createdAt: -1 });
  res.json(rows);
};

// GET /api/tasks/:id
export const getTask = async (req, res) => {
  const row = await Task.findById(req.params.id);
  if (!row) return res.status(404).json({ message: "Task not found" });
  res.json(row);
};

// POST /api/tasks
export const createTask = async (req, res) => {
  const body = { ...req.body };

  if (!body.title || !body.title.trim()) {
    return res.status(400).json({ message: "Title is required" });
  }
  if (body.priority) body.priority = String(body.priority).toLowerCase();
  if (body.status) body.status = String(body.status).toLowerCase().replace(" ", "_");

  const created = await Task.create(body);

  if (body.coordinator && String(body.coordinator).trim()) {
      try {
        await notifyCoordinatorByName(
          body.coordinator,
          "New Task Assigned",
          `You have been assigned a new task: "${body.title}"`
        );
      } catch (nErr) {
        console.error("createTask -> notification error:", nErr);
        // do not block task creation on notification failure
      }
    }

  res.status(201).json(created);
};

// PUT /api/tasks/:id
export const updateTask = async (req, res) => {
  const updates = { ...req.body };
  if (updates.title) updates.title = updates.title.trim();
  if (updates.priority) updates.priority = String(updates.priority).toLowerCase();
  if (updates.status) updates.status = String(updates.status).toLowerCase().replace(" ", "_");

  const row = await Task.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!row) return res.status(404).json({ message: "Task not found" });
  res.json(row);
};

// DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  const row = await Task.findByIdAndDelete(req.params.id);
  if (!row) return res.status(404).json({ message: "Task not found" });
  res.json({ deleted: true, id: row._id });
};

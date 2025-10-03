// /routes/notification.routes.js
import express from "express";
import { createNotification, getInbox } from "../controller/notification.controller.js";

const router = express.Router();

// Create (broadcast to roles)
router.post("/", createNotification);

// Inbox for current user role (GET /inbox?role=Attendee)
router.get("/inbox", getInbox);

export default router;

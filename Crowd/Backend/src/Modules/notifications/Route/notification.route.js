import express from "express";
import {
  createNotification,
  getInbox,
  markAllRead,
  markOneRead,
} from "../controller/notification.controller.js";

import { validateToken } from "../../User/Middlewares/validate.js";

const router = express.Router();

// Create (broadcast); keep public or protect with roles if you want
router.post("/", createNotification);

// Inbox (unread for this user)
router.get("/inbox", validateToken, getInbox);

// Mark single read
router.post("/:id/read", validateToken, markOneRead);

// Mark many/all read
router.post("/read-all", validateToken, markAllRead);

export default router;

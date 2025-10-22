// /controller/notification.controller.js
import Notification from "../model/notification.model.js";

/**
 * We do NOT require auth here. Frontend simply passes ?role=Attendee (or in body).
 * This keeps testing and wiring dead simple.
 */
const getRoleFromReq = (req = {}) => {
  const role =
    req.query?.role ||
    req.body?.role ||
    req.headers?.["x-user-role"] ||
    req.headers?.["x-role"];
  return (role || "").trim();
};

/**
 * POST /api/notifications
 * Body: { title, message, recipientRoles: string[] }
 * - Broadcasts to each role room (both "role:X" and legacy "X")
 */
export const createNotification = async (req, res) => {
  try {
    const { title, message, recipientRoles = [] } = req.body;

    if (!title || !message || !recipientRoles.length) {
      return res.status(422).json({ message: "title, message and recipientRoles[] are required" });
    }

    const doc = await Notification.create({
      title,
      message,
      recipientRoles,
    });

    // emit via socket
    const io = req.app.get("io");
    if (io) {
      for (const role of recipientRoles) {
        io.to(`role:${role}`).emit("notification:new", doc);
        io.to(role).emit("newNotification", doc); // legacy event + room for backward-compat
      }
    }

    res.status(201).json(doc);
  } catch (err) {
    console.error("Create Notification Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/notifications/inbox?role=Attendee
 * Returns notifications for a single role (latest first)
 * Optional: ?limit=30  (default 50, max 200)
 */
export const getInbox = async (req, res) => {
  try {
    const role = getRoleFromReq(req);
    const limit = Math.min(parseInt(req.query?.limit || "50", 10), 200);

    if (!role) {
      return res.status(422).json({ message: "role is required (query or body)" });
    }

    const notifications = await Notification.find({ recipientRoles: role })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json(notifications);
  } catch (err) {
    console.error("Fetch Inbox Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

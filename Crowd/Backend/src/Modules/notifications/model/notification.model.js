// /model/notification.model.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title:   { type: String, required: true },
    message: { type: String, required: true },

    // Broadcast to roles only (no direct user targeting)
    recipientRoles: [{
      type: String,
      enum: ["Attendee", "Organizer", "Staff", "Coordinator"],
      required: true,
    }],
  },
  { timestamps: true }
);

// helpful index
notificationSchema.index({ recipientRoles: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);

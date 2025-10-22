import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title:   { type: String, required: true },
    message: { type: String, required: true },

    // store roles in lowercase
    recipientRoles: [{
      type: String,
      lowercase: true,
      trim: true,
      // If you want to keep an enum, use lowercase options only:
      // enum: ["attendee","organizer","staff","coordinator"],
      required: false,
    }],

    // per-user read receipts
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

notificationSchema.index({ recipientRoles: 1, createdAt: -1 });
notificationSchema.index({ readBy: 1 });

export default mongoose.model("Notification", notificationSchema);

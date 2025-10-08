// models/Reservation.js
import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema(
  {
    spotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingSpot",
      required: true,
      index: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // time window
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },

    // payment info
    amount: { type: Number, required: true }, // total (LKR)
    currency: { type: String, default: "LKR" },
    paymentId: { type: String, required: true, unique: true }, // idempotency key
    paymentMethod: { type: String }, // e.g., "card","payhere","stripe"

    // vehicle/driver
    plate: { type: String, trim: true },
    vehicleType: { type: String, default: "Car" },
    driverName: { type: String, trim: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "expired"],
      default: "confirmed",
      index: true,
    },
  },
  { timestamps: true }
);

// Optional: fast lookups for active reservations by spot
ReservationSchema.index({
  spotId: 1,
  status: 1,
  startTime: 1,
  endTime: 1,
});

export default mongoose.model("Reservation", ReservationSchema);

// models/ParkingSpot.js
import mongoose from "mongoose";

const ParkingSpotSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    placeId: { type: mongoose.Schema.Types.ObjectId, ref: "Place" }, // optional
    zoneId: { type: mongoose.Schema.Types.ObjectId, ref: "Zone" },   // optional
    type: { type: String, default: "Standard" },
    price: { type: Number, default: 0 }, // hourly rate (LKR)
    status: {
      type: String,
      enum: ["available", "reserved", "occupied", "maintenance"],
      default: "available",
      index: true,
    },
    facilities: [{ type: String }],
  },
  { timestamps: true }
);

// helpful compound indexes if you filter by place/zone frequently
ParkingSpotSchema.index({ placeId: 1, status: 1 });
ParkingSpotSchema.index({ zoneId: 1, status: 1 });

export default mongoose.model("ParkingSpot", ParkingSpotSchema);

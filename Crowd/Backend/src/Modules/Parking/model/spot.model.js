import mongoose from "mongoose";

const SpotSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true, unique: true }, // e.g. K001
    zone: { type: String, required: true, trim: true, index: true },  // zone name
    type: {
      type: String,
      default: "Standard",
      enum: ["Standard", "VIP", "EV", "Accessible", "Blocked"],
    },
    status: {
      type: String,
      default: "available",
      enum: ["available", "occupied", "reserved", "blocked"],
      index: true,
    },
    // keep for legacy compatibility if you had it before; not used for capacity
    total: { type: Number, default: 1 },
    // optional metadata
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Helpful compound index to query a zone’s available spots fast
SpotSchema.index({ zone: 1, status: 1, code: 1 });

const Spot = mongoose.model("Spot", SpotSchema);
export default Spot;

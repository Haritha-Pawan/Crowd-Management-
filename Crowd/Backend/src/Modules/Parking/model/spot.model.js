import mongoose from "mongoose";

const SpotSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true, unique: true }, // e.g. K001
    zone: { type: String, required: true, trim: true, index: true }, // zone name
    type: {type: String,default: "Standard", enum: ["Standard", "VIP", "EV", "Accessible", "Blocked"],},
    status: {type: String,default: "available",enum: ["available", "occupied", "reserved", "blocked"],index: true,},
    total: { type: Number, default: 1 },
    notes: { type: String, default: "" },},
  { timestamps: true }
);

SpotSchema.index({ zone: 1, status: 1, code: 1 });

const Spot = mongoose.model("Spot", SpotSchema);
export default Spot;

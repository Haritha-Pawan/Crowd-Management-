import mongoose from "mongoose";

const ScanLogSchema = new mongoose.Schema(
  {
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true, index: true },
    nic: { type: String, required: true, uppercase: true, trim: true, index: true },
    fullName: { type: String, required: true, trim: true },
    type: { type: String, enum: ["individual", "family"], required: true },
    count: { type: Number, default: 1, min: 1 },
    counterId: { type: mongoose.Schema.Types.ObjectId, ref: "Counter" },
    counterName: { type: String, trim: true },
    scannedBy: { type: String, trim: true },
    payload: { type: String, required: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

ScanLogSchema.index({ createdAt: -1 });

const ScanLog = mongoose.models.ScanLog || mongoose.model("ScanLog", ScanLogSchema);
export default ScanLog;

import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema(
  {
    // IMPORTANT: reference the real spot model name in your DB
    spot:    { type: mongoose.Schema.Types.ObjectId, ref: "ParkingSpot", required: true, index: true },
    placeId: { type: mongoose.Schema.Types.ObjectId, ref: "Place" }, // snapshot from ParkingSpot

    // optional user linkage
    userId: { type: String },

    // driver / vehicle
    driverName:  { type: String, trim: true },
    plateNumber: { type: String, trim: true },

    // timing
    startTime: { type: Date, required: true, index: true },
    endTime:   { type: Date, required: true, index: true },
    hours:     { type: Number, required: true, min: 0.25 },

    // money
    currency:   { type: String, default: "LKR" },
    amount:     { type: Number, required: true, min: 0 }, // e.g. Rs 600
    priceCents: { type: Number, required: true, min: 0 }, // e.g. 60000

    // payment
    paymentId:     { type: String, required: true, index: true, unique: true, sparse: true },
    paymentMethod: { type: String, default: "mock" },

    // lifecycle
    status: { type: String, enum: ["confirmed", "canceled", "refunded"], default: "confirmed", index: true },
  },
  { timestamps: true }
);

// Keep hours consistent; derive amount from priceCents if needed
ReservationSchema.pre("save", function (next) {
  if (this.startTime && this.endTime) {
    const ms = this.endTime.getTime() - this.startTime.getTime();
    if (ms > 0) {
      const mins = Math.ceil(ms / 60000);
      this.hours = Math.max(1, Math.ceil(mins / 60));
    }
  }
  if ((this.amount == null || isNaN(this.amount)) && Number.isFinite(this.priceCents)) {
    this.amount = Math.round(this.priceCents) / 100;
  }
  next();
});

const Reservation = mongoose.model("Reservation", ReservationSchema);
export default Reservation;

import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema(
  {
    spot: { type: mongoose.Schema.Types.ObjectId, ref: "Spot", required: true }, // reference only
    userId: { type: String, required: true },           // your auth user id / email / phone
    hours: { type: Number, required: true, min: 1 },
    amount: { type: Number, required: true, min: 0 },   // total paid
    paymentId: { type: String, required: true },        // gateway charge id
    paymentMethod: { type: String, default: "card" },
    startTime: { type: Date, default: () => new Date() },
    endTime: { type: Date },                            // optionally compute start + hours
    status: { type: String, default: "confirmed", enum: ["confirmed", "refunded", "canceled"] },
  },
  { timestamps: true }
);

// optional convenience
ReservationSchema.pre("save", function(next) {
  if (!this.endTime && this.hours) {
    this.endTime = new Date(this.startTime.getTime() + this.hours * 60 * 60 * 1000);
  }
  next();
});

const Reservation = mongoose.model("Reservation", ReservationSchema);
export default Reservation;

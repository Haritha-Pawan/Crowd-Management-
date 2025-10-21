// ESM
import mongoose from "mongoose";

const nicRegex = /^(?:\d{12}|\d{9}[VvXx])$/;

const PaymentSchema = new mongoose.Schema(
  {
    provider: { type: String, trim: true },
    paymentId: { type: String, trim: true },
    status: { type: String, enum: ["paid", "failed", "pending"], required: true },
    amount: { type: Number, min: 0 },
    currency: { type: String, uppercase: true, trim: true, default: "LKR" },
    card: {
      brand: { type: String, trim: true },
      last4: { type: String, trim: true },
      expMonth: { type: Number, min: 1, max: 12 },
      expYear: { type: Number, min: 2024 },
    },
  },
  { _id: false }
);

const TicketSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email:    { type: String, required: true, unique: true }, // ✅ unique
  phone:    { type: String, required: true },
  nic:      { type: String, required: true, unique: true }, // ✅ unique
  type:     { type: String, enum: ["individual", "family"], required: true },
  count:    { type: Number, default: 1 },
  payment: {
    provider: String,
    paymentId: String,
    status: { type: String, enum: ["paid", "failed", "pending"], required: true },
    amount: { type: Number, required: true },
    currency: String,
    card: {
      brand: { type: String, required: true },
      last4: { type: String, required: true },
      expMonth: { type: Number, required: true },
      expYear: { type: Number, required: true },
    },
  },
  qrDataUrl: { type: String, required: true },
  checkedIn: { type: Boolean, default: false },
}, { timestamps: true });


// optional uniqueness for individual (works with upsert)
TicketSchema.index(
  { nic: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: "individual" } }
);

const Ticket = mongoose.model("Ticket", TicketSchema);
export default Ticket;

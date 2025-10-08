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

const TicketSchema = new mongoose.Schema(
  {
    nic: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      validate: { validator: (v) => nicRegex.test(String(v || "")), message: "Invalid NIC format" },
      index: true,
    },
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    type: { type: String, enum: ["individual", "family"], required: true },
    count: { type: Number, required: true, min: 1 },
    payload: { type: String, required: true },     // what’s encoded
    qrDataUrl: { type: String, required: true },   // <-- store PNG as data URL
    payment: { type: PaymentSchema, required: true },
  },
  { timestamps: true }
);

// optional uniqueness for individual (works with upsert)
TicketSchema.index(
  { nic: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: "individual" } }
);

const Ticket = mongoose.model("Ticket", TicketSchema);
export default Ticket;
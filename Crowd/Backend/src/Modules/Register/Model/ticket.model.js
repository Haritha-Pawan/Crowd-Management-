// src/Modules/Checkout/Model/ticket.model.js
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    provider: { type: String, trim: true },
    paymentId: { type: String, trim: true },
    status: { type: String, enum: ["paid", "failed", "pending"], required: true },
    amount: { type: Number, min: 0, required: true },
    currency: { type: String, uppercase: true, trim: true, default: "LKR" },
    card: {
      brand: { type: String, trim: true, required: true },
      last4: { type: String, trim: true, required: true },
      expMonth: { type: Number, min: 1, max: 12, required: true },
      expYear: { type: Number, min: 2025, required: true },
    },
  },
  { _id: false }
);

const TicketSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, required: true, trim: true },
    nic: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["individual", "family"], required: true },
    count: { type: Number, default: 1, min: 1 },

    // Payment & QR
    payment: { type: PaymentSchema, required: true },
    payload: { type: String, required: true }, // QR payload text
    qrDataUrl: { type: String, required: true },

    // Attendance & counters
    checkedIn: { type: Boolean, default: false },
    assignedCounterId: { type: mongoose.Schema.Types.ObjectId, ref: "Counter" },
    assignedCounterName: { type: String, trim: true },
  },
  { timestamps: true }
);

// Unique (optional) composite for individual type only
TicketSchema.index(
  { nic: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: "individual" } }
);

const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
export default Ticket;

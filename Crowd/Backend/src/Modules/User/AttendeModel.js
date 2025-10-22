import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/* ---------- Subdocs ---------- */
const PaymentSchema = new mongoose.Schema(
  {
    provider:  { type: String, trim: true },
    paymentId: { type: String, trim: true },
    status:    { type: String, enum: ["paid", "failed", "pending"], required: true },
    amount:    { type: Number, min: 0, required: true },
    currency:  { type: String, uppercase: true, trim: true, default: "LKR" },
    card: {
      brand:    { type: String, trim: true, required: true },
      last4:    { type: String, trim: true, required: true },
      expMonth: { type: Number, min: 1, max: 12, required: true },
      expYear:  {
        type: Number,
        required: true,
        validate: {
          validator: (v) => v >= new Date().getFullYear(),
          message:   () => "expYear must be current year or later",
        },
      },
    },
  },
  { _id: false }
);

const AssignedCounterDetailsSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    entrance: String,
    status: String,
    capacity: Number,
    load: Number,
  },
  { _id: false }
);

/* ---------- Ticket ---------- */
const TicketSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email:    { type: String, required: true, trim: true, lowercase: true },
    phone:    { type: String, required: true, trim: true },
    nic:      { type: String, required: true, uppercase: true, trim: true },
    type:     { type: String, enum: ["individual", "family"], required: true },
    count:    { type: Number, default: 1, min: 1 },

    // Payment & QR
    payment:   { type: PaymentSchema, required: true },
    payload:   { type: String, required: true }, // QR encoded text
    qrDataUrl: { type: String, required: true },

    // Auth
    password:  { type: String, required: true, minlength: 6 },
    role:      { type: String, trim: true, default: "Attendee" },

    // Attendance & counters
    checkedIn:             { type: Boolean, default: false },
    checkedInAt:           { type: Date },
    lastScanAt:            { type: Date },
    lastScannedCounterId:  { type: mongoose.Schema.Types.ObjectId, ref: "Counter" },
    lastScannedCounterName:{ type: String, trim: true },
    lastScannedBy:         { type: String, trim: true },
    assignedCounterId:     { type: mongoose.Schema.Types.ObjectId, ref: "Counter" },
    assignedCounterName:   { type: String, trim: true },
    assignedCounterDetails:{ type: AssignedCounterDetailsSchema },
  },
  { timestamps: true }
);

// Unique NIC only for individuals (families can reuse same NIC)
TicketSchema.index(
  { nic: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: "individual" } }
);

// Hide sensitive fields when sending to client
function scrub(_doc, ret) {
  delete ret.password;
  delete ret.__v;
  return ret;
}
TicketSchema.set("toJSON",   { transform: scrub });
TicketSchema.set("toObject", { transform: scrub });

const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
export default Ticket;

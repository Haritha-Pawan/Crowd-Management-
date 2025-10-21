// src/Modules/Checkout/Controller/checkout.controller.js
import QRCode from "qrcode";
import Ticket from "../Model/ticket.model.js";
// ⬇️ Adjust this import to your actual Counter model location:
import Counter from "../../Counter/model/counter.model.js"; // e.g., "../../Counter/model/counter.model.js"

const nicRegex = /^(?:\d{12}|\d{9}[VvXx])$/;
const isEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").toLowerCase());
const clean = (s) => String(s || "").trim();

function buildQrPayload({ nic, type, count, paymentId }) {
  // NIC is the unique key; for family, NIC + count
  const t = type === "individual" ? "I" : "F";
  const c = type === "individual" ? 1 : count;
  const pid = paymentId ? `|pid=${encodeURIComponent(paymentId)}` : "";
  return `CF|v=1|nic=${encodeURIComponent(nic)}|t=${t}|c=${c}${pid}`;
}

async function pickCounterAndIncrementLoad(people = 1) {
  // Fetch all active counters (Entry, Exit, Both, etc.)
  const counters = await Counter.find({
    isActive: { $ne: false },
  }).lean();

  if (!counters.length) return null;

  const scored = counters
    .map((c) => {
      const capacity = Number(c.capacity) || 0;
      const load = Number(c.load) || 0;
      const status = String(c.status || "").toLowerCase();
      const statusPriority =
        status === "entry" ? 0 : status === "both" ? 1 : status === "exit" ? 2 : 3;
      const hasRoom = capacity > 0 ? load + people <= capacity : true;
      const ratio = capacity > 0 ? load / capacity : load;
      return { c, hasRoom, ratio, load, statusPriority };
    })
    .sort((a, b) => {
      if (a.statusPriority !== b.statusPriority) {
        return a.statusPriority - b.statusPriority;
      }
      if (a.ratio !== b.ratio) return a.ratio - b.ratio;
      if (a.load !== b.load) return a.load - b.load;
      return 0;
    });

  // Prefer counters that still have room; fall back to the best overall option
  const pool = scored.filter((item) => item.hasRoom);
  const best = (pool.length ? pool : scored)[0]?.c;
  if (!best?._id) return null;

  const updated = await Counter.findByIdAndUpdate(
    best._id,
    { $inc: { load: people } },
    { new: true }
  ).lean();

  return updated || best;
}

export const checkoutAndGenerateQR = async (req, res) => {
  try {
    let { nic, fullName, email, phone, type, count, payment } = req.body || {};

    // normalize
    nic = clean(nic).toUpperCase();
    fullName = clean(fullName);
    email = clean(email).toLowerCase();
    phone = clean(phone);
    type = clean(type).toLowerCase();

    // presence
    if (!nic || !fullName || !email || !phone || !type || !payment) {
      return res
        .status(400)
        .json({ message: "nic, fullName, email, phone, type and payment are required" });
    }

    // formats
    if (!nicRegex.test(nic)) {
      return res
        .status(422)
        .json({ message: "Invalid NIC format (12 digits or 9 digits + V/X)" });
    }
    if (!isEmail(email)) return res.status(422).json({ message: "Invalid email address" });
    if (!["individual", "family"].includes(type)) {
      return res.status(422).json({ message: "type must be 'individual' or 'family'" });
    }

    // count rule
    if (type === "individual") {
      count = 1;
    } else {
      const parsed = Number.parseInt(count ?? "0", 10);
      if (!Number.isFinite(parsed) || parsed < 2) {
        return res
          .status(422)
          .json({ message: "For family type, count is required and must be ≥ 2" });
      }
      count = parsed;
    }

    // payment validation (never accept cvv)
    if (!payment.status || !["paid", "failed", "pending"].includes(payment.status)) {
      return res
        .status(422)
        .json({ message: "payment.status must be 'paid' | 'failed' | 'pending'" });
    }
    if (payment.cvv || (payment.card && payment.card.cvv)) {
      return res.status(400).json({ message: "Do not send CVV to the server." });
    }
    if (payment.status !== "paid") {
      return res
        .status(402)
        .json({ message: "Payment not completed. QR will generate only after status='paid'." });
    }
    if (!Number.isFinite(+payment.amount) || +payment.amount <= 0) {
      return res.status(422).json({ message: "Amount must be a positive number" });
    }
    if (
      !payment.card?.brand ||
      !payment.card?.last4 ||
      !Number.isFinite(+payment.card?.expMonth) ||
      !Number.isFinite(+payment.card?.expYear) ||
      +payment.card.expYear < 2025
    ) {
      return res
        .status(422)
        .json({ message: "Card brand, last4, expMonth, expYear (≥ 2025) are required" });
    }

    // duplicate (email or NIC)
    const duplicate = await Ticket.findOne({ $or: [{ email }, { nic }] });
    if (duplicate) {
      return res.status(409).json({ message: "Email or NIC already registered" });
    }

    // Build QR payload & data URL
    const payload = buildQrPayload({
      nic,
      type,
      count,
      paymentId: clean(payment.paymentId),
    });

    const qrDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 512,
    });

    // Assign a counter and increment its load
    const people = type === "family" ? count : 1;
    const assigned = await pickCounterAndIncrementLoad(people);

    // Sanitize payment for storage
    const paymentDoc = {
      provider: clean(payment.provider) || "card",
      paymentId: clean(payment.paymentId) || undefined,
      status: "paid",
      amount: +payment.amount,
      currency: clean(payment.currency) || "LKR",
      card: {
        brand: clean(payment.card.brand),
        last4: clean(payment.card.last4),
        expMonth: +payment.card.expMonth,
        expYear: +payment.card.expYear,
      },
    };

    const assignedCounter = assigned
      ? {
          id: String(assigned._id),
          name: assigned.name,
          entrance: assigned.entrance,
          status: assigned.status,
          capacity: Number(assigned.capacity) || 0,
          load: Number(assigned.load) || 0,
        }
      : null;

    // Create ticket
    const doc = await Ticket.create({
      nic,
      fullName,
      email,
      phone,
      type,
      count,
      payload,
      qrDataUrl,
      payment: paymentDoc,
      assignedCounterId: assigned?._id,
      assignedCounterName: assigned?.name,
      assignedCounterDetails: assignedCounter,
    });

    const responseCounter = assignedCounter || (doc.assignedCounterId
      ? {
          id: String(doc.assignedCounterId),
          name: doc.assignedCounterName,
        }
      : null);

    return res.status(201).json({
      message: "Registration & payment successful. QR generated.",
      ticket: {
        id: doc._id,
        nic: doc.nic,
        fullName: doc.fullName,
        email: doc.email,
        phone: doc.phone,
        type: doc.type,
        count: doc.count,
        payload: doc.payload,
        assignedCounterId: doc.assignedCounterId,
        assignedCounterName: doc.assignedCounterName,
        assignedCounter: responseCounter,
        qrDataUrl: doc.qrDataUrl,
        createdAt: doc.createdAt,
        payment: {
          status: doc.payment.status,
          amount: doc.payment.amount,
          currency: doc.payment.currency,
          card: doc.payment.card,
        },
      },
      qr: { dataUrl: doc.qrDataUrl },
    });
  } catch (err) {
    if (err?.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "email/nic";
      return res.status(409).json({ message: `${field.toUpperCase()} already registered` });
    }
    console.error("CHECKOUT ERROR >", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/checkout
export const listTickets = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, parseInt(req.query.limit || "20", 10));
    const skip = (page - 1) * limit;
    const q = (req.query.q || "").trim();

    const match = q
      ? { $or: [{ fullName: new RegExp(q, "i") }, { nic: new RegExp(q, "i") }] }
      : {};

    const [items, total] = await Promise.all([
      Ticket.find(match)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select({
          fullName: 1,
          nic: 1,
          email: 1,
          phone: 1,
          type: 1,
          count: 1,
          "payment.status": 1,
          "payment.amount": 1,
          assignedCounterName: 1,
          createdAt: 1,
        })
        .lean(),
      Ticket.countDocuments(match),
    ]);
    res.json({ page, limit, total, items });
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed to list tickets" });
  }
};

// GET /api/checkout/stats
export const getTicketStats = async (req, res) => {
  try {
    const [total, checkedIn] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ checkedIn: true }),
    ]);
    const pending = Math.max(0, total - checkedIn);
    res.json({ total, checkedIn, pending });
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed to fetch stats" });
  }
};

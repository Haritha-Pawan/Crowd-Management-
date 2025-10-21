// src/Modules/Checkout/Controller/checkout.controller.js
import QRCode from "qrcode";
import Ticket from "../Model/ticket.model.js";

const nicRegex = /^(?:\d{12}|\d{9}[VvXx])$/;
const isEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").toLowerCase());
const clean = (s) => String(s || "").trim();

export const checkoutAndGenerateQR = async (req, res) => {
  try {
    let { nic, fullName, email, phone, type, count, payment } = req.body || {};

    // normalize
    nic = clean(nic).toUpperCase();
    fullName = clean(fullName);
    email = clean(email).toLowerCase();
    phone = clean(phone);
    type = clean(type).toLowerCase();

    // required presence
    if (!nic || !fullName || !email || !phone || !type || !payment) {
      return res
        .status(400)
        .json({
          message:
            "nic, fullName, email, phone, type and payment are required",
        });
    }

    // formats
    if (!nicRegex.test(nic))
      return res
        .status(422)
        .json({ message: "Invalid NIC format (12 digits or 9 digits + V/X)" });
    if (!isEmail(email))
      return res.status(422).json({ message: "Invalid email address" });
    if (!["individual", "family"].includes(type)) {
      return res
        .status(422)
        .json({ message: "type must be 'individual' or 'family'" });
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

    // payment validation (NEVER accept cvv)
    if (!payment.status || !["paid", "failed", "pending"].includes(payment.status)) {
      return res
        .status(422)
        .json({ message: "payment.status must be 'paid' | 'failed' | 'pending'" });
    }
    if (payment.cvv || (payment.card && payment.card.cvv)) {
      return res
        .status(400)
        .json({
          message:
            "Do not send CVV to the server. Use payment tokens only.",
        });
    }
    if (payment.status !== "paid") {
      return res.status(402).json({
        message:
          "Payment not completed. QR will generate only after status='paid'.",
      });
    }
    if (!Number.isFinite(+payment.amount) || +payment.amount <= 0) {
      return res
        .status(422)
        .json({ message: "Amount must be a positive number" });
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
        .json({
          message:
            "Card brand, last4, expMonth, expYear (≥ 2025) are required",
        });
    }

    // ---- duplicate check (email or NIC) ----
    const duplicate = await Ticket.findOne({ $or: [{ email }, { nic }] });
    if (duplicate) {
      return res
        .status(409)
        .json({ message: "Email or NIC already registered" });
    }

    // Build QR payload
    const pid = clean(payment.paymentId);
    const payload =
      `CF|v=1|nic=${encodeURIComponent(nic)}|t=${
        type === "individual" ? "I" : "F"
      }|c=${count}` + (pid ? `|pid=${encodeURIComponent(pid)}` : "");

    // Generate QR (PNG data URL) BEFORE saving, so we can store it
    const qrDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 512,
    });

    // prepare payment object (no sensitive data)
    const paymentDoc = {
      provider: clean(payment.provider) || "unknown",
      paymentId: pid || undefined,
      status: "paid",
      amount: +payment.amount,
      currency: clean(payment.currency) || "LKR",
      card: payment.card
        ? {
            brand: clean(payment.card.brand),
            last4: clean(payment.card.last4),
            expMonth: +payment.card.expMonth,
            expYear: +payment.card.expYear,
          }
        : undefined,
    };

    // Always create a new ticket (no upsert) to enforce "no duplicates" policy
    const doc = await Ticket.create({
      nic,
      fullName,
      email,
      phone,
      type,
      count,
      payload,
      qrDataUrl, // store QR
      payment: paymentDoc,
    });

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
        qrDataUrl: doc.qrDataUrl, // also returned
        createdAt: doc.createdAt,
      },
      qr: { dataUrl: doc.qrDataUrl },
    });
  } catch (err) {
    // Mongo duplicate key safety (race conditions): E11000
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



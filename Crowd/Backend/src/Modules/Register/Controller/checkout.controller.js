import QRCode from "qrcode";
import bcrypt from "bcryptjs";
import Ticket from "../Model/ticket.model.js";
import Counter from "../../Counter/model/counter.model.js";
import ScanLog from "../Model/scanLog.model.js";
import User from "../../User/User.model.js";

const nicRegex   = /^(?:\d{12}|\d{9}[VvXx])$/;
const phoneRegex = /^0\d{9}$/;
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").toLowerCase());
const clean   = (s) => String(s || "").trim();

const ROLE_MAP = {
  attendee: "Attendee",
  attende: "Attendee", // tolerate minor typo
  organizer: "organizer",
  coordinator: "Coordinator",
  staff: "Staff",
  admin: "admin",
  user: "user",
};

const PRIVILEGED_ROLES = new Set(["admin", "organizer", "Coordinator", "Staff"]);

function buildQrPayload({ nic, type, count, paymentId, counter }) {
  const key = encodeURIComponent(nic);
  const t = type === "family" ? "F" : "I";
  const members = type === "family" ? count : 1;
  const counterSegment = counter ? `|counter=${encodeURIComponent(counter)}` : "|counter=unassigned";
  const pid = paymentId ? `|pid=${encodeURIComponent(paymentId)}` : "";
  return `CF|v=1|key=${key}|type=${t}|count=${members}${counterSegment}${pid}`;
}

function parseQrPayloadString(raw) {
  if (!raw || typeof raw !== "string") return null;
  const text = raw.trim();
  if (!text.startsWith("CF|")) return null;
  const parts = text.split("|");
  const data = { raw: text };
  for (let i = 1; i < parts.length; i += 1) {
    const segment = parts[i];
    const idx = segment.indexOf("=");
    if (idx === -1) continue;
    const key = segment.slice(0, idx);
    const value = segment.slice(idx + 1);
    data[key] = decodeURIComponent(value || "");
  }
  if (!data.key) return null;
  const nic = clean(data.key).toUpperCase();
  const type = String(data.type || "").toUpperCase() === "F" ? "family" : "individual";
  const count = Number.parseInt(data.count || (type === "family" ? "0" : "1"), 10);
  return {
    nic,
    type,
    count: Number.isFinite(count) ? count : type === "family" ? 0 : 1,
    counter: data.counter ? clean(data.counter) : undefined,
    paymentId: data.pid || data.paymentId,
    raw: text,
  };
}

async function pickCounterAndIncrementLoad(people = 1) {
  const counters = await Counter.find({ isActive: { $ne: false } }).lean();
  if (!counters.length) return null;

  const scored = counters
    .map((c) => {
      const capacity = Number(c.capacity) || 0;
      const load     = Number(c.load) || 0;
      const status   = String(c.status || "").toLowerCase(); // 'entry' | 'both' | 'exit'
      const statusPriority = status === "entry" ? 0 : status === "both" ? 1 : status === "exit" ? 2 : 3;
      const hasRoom  = capacity > 0 ? load + people <= capacity : true;
      const ratio    = capacity > 0 ? load / capacity : load;
      return { c, hasRoom, ratio, load, statusPriority };
    })
    .sort((a, b) => {
      if (a.statusPriority !== b.statusPriority) return a.statusPriority - b.statusPriority;
      if (a.ratio !== b.ratio) return a.ratio - b.ratio;
      if (a.load  !== b.load)  return a.load  - b.load;
      return 0;
    });

  const pool = scored.filter((x) => x.hasRoom);
  const best = (pool.length ? pool : scored)[0]?.c;
  if (!best?._id) return null;

  const updated = await Counter.findByIdAndUpdate(
    best._id,
    { $inc: { load: people } },
    { new: true }
  ).lean();

  return updated || best;
}

/**
 * POST /api/checkout
 * Body:
 * { fullName,email,phone,nic,type("individual"|"family"),count,password,role,
 *   payment:{provider,paymentId,status:"paid",amount,currency,card:{brand,last4,expMonth,expYear}}
 * }
 */
export const checkoutAndGenerateQR = async (req, res) => {
  try {
    let { nic, fullName, email, phone, type, count, payment, password, role } = req.body || {};
    password = typeof password === "string" ? password : "";
    role = typeof role === "string" ? role : "";

    // normalize
    nic      = clean(nic).toUpperCase();
    fullName = clean(fullName);
    email    = clean(email).toLowerCase();
    phone    = clean(phone);
    type     = clean(type).toLowerCase();
    const trimmedPassword = password.trim();
    const normalizedRoleInput = clean(role).toLowerCase();
    const finalRole = ROLE_MAP[normalizedRoleInput] || "Attendee";

    // presence
    if (!nic || !fullName || !email || !phone || !type || !payment || !trimmedPassword) {
      return res.status(400).json({ message: "nic, fullName, email, phone, type, password and payment are required" });
    }
    // formats
    if (fullName.length < 3)               return res.status(422).json({ message: "Full name must be at least 3 characters" });
    if (!phoneRegex.test(phone))           return res.status(422).json({ message: "Phone must match 0XXXXXXXXX" });
    if (!nicRegex.test(nic))               return res.status(422).json({ message: "Invalid NIC (12 digits OR 9 + V/X)" });
    if (!isEmail(email))                   return res.status(422).json({ message: "Invalid email address" });
    if (!["individual","family"].includes(type)) return res.status(422).json({ message: "type must be 'individual' | 'family'" });
    if (trimmedPassword.length < 6)        return res.status(422).json({ message: "Password must be at least 6 characters" });

    // count
    if (type === "individual") {
      count = 1;
    } else {
      const parsed = Number.parseInt(count ?? "0", 10);
      if (!Number.isFinite(parsed) || parsed < 2) {
        return res.status(422).json({ message: "For family type, count is required and must be at least 2 attendees" });
      }
      count = parsed;
    }

    // payment validation (never accept CVV)
    if (!payment || typeof payment !== "object") {
      return res.status(400).json({ message: "Payment details are required" });
    }
    if (payment.cvv || (payment.card && payment.card.cvv)) {
      return res.status(400).json({ message: "Do not send CVV to the server." });
    }
    if (payment.status !== "paid") {
      return res.status(402).json({ message: "Payment not completed. Generate QR only after status='paid'." });
    }
    if (!Number.isFinite(+payment.amount) || +payment.amount <= 0) {
      return res.status(422).json({ message: "Amount must be a positive number" });
    }

    const now          = new Date();
    const currentYear  = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const expMonth     = Number(payment.card?.expMonth);
    const expYear      = Number(payment.card?.expYear);
    const brand        = clean(payment.card?.brand);
    const last4        = clean(payment.card?.last4);

    if (!brand || !last4 || !Number.isFinite(expMonth) || !Number.isFinite(expYear)) {
      return res.status(422).json({ message: "Card brand, last4, expMonth, expYear are required" });
    }
    if (!/^\d{4}$/.test(last4)) {
      return res.status(422).json({ message: "Card last4 must be 4 digits" });
    }
    if (expMonth < 1 || expMonth > 12) {
      return res.status(422).json({ message: "expMonth must be between 1-12" });
    }
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return res.status(422).json({ message: "Card expiry must be current month or later" });
    }

    const paymentId = clean(payment.paymentId);
    const provider  = clean(payment.provider) || "card";
    const currency  = clean(payment.currency) || "LKR";

    // duplicate (individual)
    if (type === "individual") {
      const exists = await Ticket.findOne({ nic, type: "individual" }).lean();
      if (exists) return res.status(409).json({ message: "Ticket already exists for this NIC (individual)" });
    }

    // hash password
    const passwordHash = await bcrypt.hash(trimmedPassword, 10);

    // ensure attendee account exists for login
    try {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        await User.create({
          name: fullName,
          email,
          password: passwordHash,
          role: finalRole,
          status: "active",
        });
      } else if (!PRIVILEGED_ROLES.has(existingUser.role)) {
        let needsSave = false;
        if (existingUser.name !== fullName) {
          existingUser.name = fullName;
          needsSave = true;
        }
        if (existingUser.role !== finalRole) {
          existingUser.role = finalRole;
          needsSave = true;
        }
        if (existingUser.status !== "active") {
          existingUser.status = "active";
          needsSave = true;
        }
        const passwordMatches = await bcrypt.compare(trimmedPassword, existingUser.password);
        if (!passwordMatches) {
          existingUser.password = passwordHash;
          needsSave = true;
        }
        if (needsSave) {
          await existingUser.save();
        }
      }
    } catch (userErr) {
      console.error("USER UPSERT ERROR >", userErr);
    }

    // counter assignment
    const people   = type === "family" ? count : 1;
    const assigned = await pickCounterAndIncrementLoad(people);
    if (!assigned) return res.status(503).json({ message: "No counters available right now. Please try again shortly." });

    // QR payload
    const counterLabel = assigned?.name ? clean(assigned.name) : assigned?._id ? String(assigned._id) : "";
    const payload  = buildQrPayload({ nic, type, count, paymentId, counter: counterLabel || "general" });
    const qrDataUrl= await QRCode.toDataURL(payload, { errorCorrectionLevel: "M", margin: 1, width: 512 });

    // payment doc (sanitized)
    const paymentDoc = {
      provider,
      paymentId: paymentId || undefined,
      status: "paid",
      amount: +payment.amount,
      currency,
      card: { brand, last4, expMonth, expYear },
    };

    const assignedCounter = assigned ? {
      id: String(assigned._id),
      name: counterLabel || assigned.name,
      entrance: assigned.entrance,
      status: assigned.status,
      capacity: Number(assigned.capacity) || 0,
      load: Number(assigned.load) || 0,
    } : null;

    // create ticket
    const doc = await Ticket.create({
      nic, fullName, email, phone, type, count,
      payload, qrDataUrl,
      password: passwordHash,
      role: finalRole,
      payment: paymentDoc,
      assignedCounterId: assigned?._id,
      assignedCounterName: counterLabel || assigned?.name,
      assignedCounterDetails: assignedCounter,
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
        role: doc.role,
        count: doc.count,
        payload: doc.payload,
        assignedCounterId: doc.assignedCounterId,
        assignedCounterName: doc.assignedCounterName,
        assignedCounter: assignedCounter,
        assignedCounterDetails: doc.assignedCounterDetails,
        counterCode: doc.assignedCounterName,
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
      return res.status(409).json({ message: "Duplicate NIC for individual ticket" });
    }
    console.error("CHECKOUT ERROR >", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const scanTicket = async (req, res) => {
  try {
    const { qr, counterId, counterName, scannedBy } = req.body || {};
    const qrText = clean(qr);
    if (!qrText) {
      return res.status(400).json({ message: "QR data is required" });
    }
    if (qrText.length > 512) {
      return res.status(422).json({ message: "QR payload too long" });
    }

    const parsed = parseQrPayloadString(qrText);
    if (!parsed) {
      return res.status(422).json({ message: "Invalid QR payload" });
    }

    const ticket = await Ticket.findOne({ payload: parsed.raw });
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found for supplied QR" });
    }

    const now = new Date();
    const alreadyCheckedIn = !!ticket.checkedIn;
    const priorScan = await ScanLog.exists({ ticketId: ticket._id });
    if (alreadyCheckedIn || priorScan) {
      return res.status(409).json({ message: "Ticket already checked in." });
    }

    ticket.lastScanAt = now;
    if (scannedBy) ticket.lastScannedBy = clean(scannedBy);
    if (counterName) ticket.lastScannedCounterName = clean(counterName);
    if (counterId) ticket.lastScannedCounterId = counterId;

    ticket.checkedIn = true;
    ticket.checkedInAt = now;

    let updatedCounter = null;
    if (ticket.assignedCounterId) {
      updatedCounter = await Counter.findById(ticket.assignedCounterId);
      if (updatedCounter) {
        const currentLoad = Number(updatedCounter.load) || 0;
        const decrement   = ticket.type === "family" ? Number(ticket.count) || 1 : 1;
        const nextLoad    = Math.max(0, currentLoad - decrement);
        if (nextLoad !== currentLoad) {
          updatedCounter.load = nextLoad;
          await updatedCounter.save();
        }
        ticket.assignedCounterDetails = {
          id: String(updatedCounter._id),
          name: updatedCounter.name,
          entrance: updatedCounter.entrance,
          status: updatedCounter.status,
          capacity: Number(updatedCounter.capacity) || 0,
          load: Number(updatedCounter.load) || 0,
        };
      }
    }

    await ticket.save();

    await ScanLog.create({
      ticketId: ticket._id,
      nic: ticket.nic,
      fullName: ticket.fullName,
      type: ticket.type,
      count: ticket.count,
      counterId: ticket.lastScannedCounterId || ticket.assignedCounterId,
      counterName:
        ticket.lastScannedCounterName ||
        ticket.assignedCounterName ||
        parsed.counter ||
        counterName,
      scannedBy: ticket.lastScannedBy || scannedBy,
      payload: parsed.raw,
    });

    const payload = ticket.toObject();
    if (!payload.assignedCounterName && parsed.counter) {
      payload.assignedCounterName = parsed.counter;
    }
    if (!payload.assignedCounterDetails && payload.assignedCounterName) {
      payload.assignedCounterDetails = {
        name: payload.assignedCounterName,
      };
    } else if (
      payload.assignedCounterDetails &&
      !payload.assignedCounterDetails.name &&
      payload.assignedCounterName
    ) {
      payload.assignedCounterDetails.name = payload.assignedCounterName;
    }
    payload.qrPayload = parsed;

    res.json({
      message: "Check-in successful",
      ticket: payload,
    });
  } catch (err) {
    console.error("SCAN ERROR >", err);
    res.status(500).json({ message: err.message || "Failed to process QR" });
  }
};

export const listScanLogs = async (req, res) => {
  try {
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit || "50", 10)));
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const skip = (page - 1) * limit;
    const q = (req.query.q || "").trim();

    const match = q
      ? {
          $or: [
            { nic: new RegExp(q, "i") },
            { fullName: new RegExp(q, "i") },
            { counterName: new RegExp(q, "i") },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      ScanLog.find(match)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ScanLog.countDocuments(match),
    ]);

    res.json({ page, limit, total, items });
  } catch (err) {
    console.error("SCAN LOGS ERROR >", err);
    res.status(500).json({ message: err.message || "Failed to fetch scan logs" });
  }
};

/* ---------- List & Stats ---------- */
export const listTickets = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, parseInt(req.query.limit || "20", 10));
    const skip  = (page - 1) * limit;
    const q     = (req.query.q || "").trim();
    const checkedInFilter = typeof req.query.checkedIn === "string" ? req.query.checkedIn.toLowerCase() : null;

    const match = q ? { $or: [{ fullName: new RegExp(q, "i") }, { nic: new RegExp(q, "i") }] } : {};
    if (checkedInFilter === "true") {
      match.checkedIn = true;
    } else if (checkedInFilter === "false") {
      match.checkedIn = { $ne: true };
    }

    const sort = checkedInFilter === "true"
      ? { lastScanAt: -1, checkedInAt: -1, createdAt: -1 }
      : { createdAt: -1 };

    const [items, total] = await Promise.all([
      Ticket.find(match)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select({
          fullName: 1,
          nic: 1,
          email: 1,
          phone: 1,
          type: 1,
          count: 1,
          checkedIn: 1,
          checkedInAt: 1,
          lastScanAt: 1,
          assignedCounterName: 1,
          assignedCounterDetails: 1,
          lastScannedCounterName: 1,
          lastScannedBy: 1,
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

export const getTicketStats = async (_req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const [totalTickets, checkedInTickets, scannedToday, checkedInCountsAgg] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ checkedIn: true }),
      Ticket.countDocuments({ lastScanAt: { $gte: startOfDay } }),
      Ticket.aggregate([
        { $match: { checkedIn: true } },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $cond: [
                  { $and: [{ $ne: ["$count", null] }, { $ne: ["$count", ""] }] },
                  { $toInt: "$count" },
                  1,
                ],
              },
            },
          },
        },
      ]),
    ]);
    const pendingTickets = Math.max(0, totalTickets - checkedInTickets);
    const checkedInAttendees = checkedInCountsAgg[0]?.total || 0;
    res.json({
      total: totalTickets,
      checkedIn: checkedInTickets,
      pending: pendingTickets,
      scannedToday,
      checkedInAttendees,
    });
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed to fetch stats" });
  }
};

/* ---------- TEMP: Admin-only debug to prove password is stored (hashed) ----------
   REMOVE THIS in production or protect with auth/middleware! */
export const _debugGetTicketWithPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Ticket.findById(id).select({ nic: 1, password: 1 }).lean();
    if (!doc) return res.status(404).json({ message: "Not found" });
    // doc.password will be the bcrypt hash
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed" });
  }
};

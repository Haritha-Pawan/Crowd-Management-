import mongoose from "mongoose";
import Reservation from "../model/reservation.model.js";
// NOTE: ParkingSpot model lives outside Modules → adjust relative path accordingly
import ParkingSpot from "../../../models/ParkingSpot.js";

const DEFAULT_RATE = Number(process.env.PRICE_PER_HOUR_DEFAULT || 300); // Rs/hour

const billableHours = (startISO, endISO) => {
  const s = new Date(startISO).getTime();
  const e = new Date(endISO).getTime();
  if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return null;
  const mins = Math.ceil((e - s) / 60000);
  return Math.max(1, Math.ceil(mins / 60));
};

/**
 * POST /api/reservations
 * Body:
 *  { spotId, startTime, endTime, priceCents?, currency?, paymentId, paymentMethod?, driverName?, plateNumber?, userId? }
 * Atomic behavior: ensure ParkingSpot is 'available' → set 'occupied' → create reservation
 */
export const createReservation = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      spotId,
      startTime, endTime,
      priceCents, currency = "LKR",
      paymentId, paymentMethod = "mock",
      driverName, plateNumber,
      userId
    } = req.body;

    if (!spotId || !startTime || !endTime || !paymentId) {
      await session.abortTransaction(); session.endSession();
      return res.status(422).json({ message: "Missing required fields: spotId, startTime, endTime, paymentId" });
    }
    if (!mongoose.isValidObjectId(spotId)) {
      await session.abortTransaction(); session.endSession();
      return res.status(422).json({ message: "Invalid spotId format" });
    }

    // Idempotency by paymentId
    const dup = await Reservation.findOne({ paymentId });
    if (dup) {
      await session.abortTransaction(); session.endSession();
      return res.status(200).json(dup);
    }

    // Flip ParkingSpot → occupied (allowed statuses: available | occupied | maintenance)
    const spot = await ParkingSpot.findOneAndUpdate(
      { _id: spotId, status: "available" },
      { $set: { status: "occupied" } },
      { new: true, session }
    );

    if (!spot) {
      const exists = await ParkingSpot.findById(spotId).lean();
      await session.abortTransaction(); session.endSession();
      if (!exists) return res.status(404).json({ message: "Spot not found" });
      return res.status(409).json({ message: "Spot is not available", currentStatus: exists.status, spotId: String(spotId) });
    }

    const hrs = billableHours(startTime, endTime);
    if (!hrs) {
      await session.abortTransaction(); session.endSession();
      return res.status(422).json({ message: "Invalid start/end time window" });
    }

    let cents = Number(priceCents);
    if (!Number.isFinite(cents)) {
      cents = Math.round(DEFAULT_RATE * hrs * 100); // fallback compute
    }
    const rsAmount = cents / 100;

    const [created] = await Reservation.create([{
      spot: spot._id,
      placeId: spot.placeId,       // snapshot link to place
      userId: userId || undefined,
      driverName, plateNumber,
      startTime: new Date(startTime),
      endTime:   new Date(endTime),
      hours: hrs,
      currency,
      amount: rsAmount,
      priceCents: cents,
      paymentId,
      paymentMethod,
      status: "confirmed",
    }], { session });

    await session.commitTransaction();
    session.endSession();

    const doc = await Reservation.findById(created._id).populate("spot");
    return res.status(201).json(doc);

  } catch (err) {
    try { await session.abortTransaction(); } catch {}
    session.endSession();
    console.error("createReservation error:", err);
    return res.status(500).json({ message: "Server error", error: String(err?.message || err) });
  }
};

/** GET /api/reservations/:id */
export const getReservation = async (req, res) => {
  try {
    const doc = await Reservation.findById(req.params.id).populate("spot");
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch {
    res.status(400).json({ message: "Invalid id" });
  }
};

/** PATCH /api/reservations/:id/cancel → frees spot */
export const cancelReservation = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const r = await Reservation.findById(id).session(session);
    if (!r) { await session.abortTransaction(); session.endSession(); return res.status(404).json({ message: "Not found" }); }
    if (r.status === "canceled") {
      await session.abortTransaction(); session.endSession();
      return res.status(200).json({ message: "Already canceled", reservation: r });
    }

    await ParkingSpot.updateOne({ _id: r.spot }, { $set: { status: "available" } }, { session });
    r.status = "canceled";
    await r.save({ session });

    await session.commitTransaction(); session.endSession();
    const populated = await Reservation.findById(id).populate("spot");
    res.json({ message: "Canceled", reservation: populated });
  } catch (e) {
    try { await session.abortTransaction(); } catch {}
    session.endSession();
    res.status(500).json({ message: "Server error", error: String(e?.message || e) });
  }
};

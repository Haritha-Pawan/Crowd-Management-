// controllers/reservation.controller.js
import mongoose from "mongoose";
import Reservation from "../model/reservation.model.js";
import ParkingSpot from "../model/spot.model.js";



const num = (v) => (v === undefined || v === null || v === "" ? null : Number(v));

export const confirmReservation = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const body = req.body || {};

    // Accept common variants so the frontend (or Postman) can't easily 422 this
    const spotId = body.spotId || body.spot || body.spotID;

    const startISO = body.startISO || body.startTime || body.start || body.startAt;
    const endISO   = body.endISO   || body.endTime   || body.end   || body.endAt;

    const rawAmount = num(body.amount) ?? (num(body.priceCents) != null ? num(body.priceCents) / 100 : null);
    const amount = rawAmount != null ? rawAmount : null;

    const currency = body.currency || "LKR";
    const paymentId = body.paymentId || body.transactionId || body.txnId;
    const paymentMethod = body.paymentMethod || body.method || "unknown";

    const plate = body.plate || body.plateNumber || body.vehicleNo;
    const vehicleType = body.vehicleType || body.type || "Car";
    const driverName = body.driverName || body.driver || body.name;

    // Validate
    const missing = [];
    if (!spotId) missing.push("spotId");
    if (!startISO) missing.push("startISO/startTime");
    if (!endISO) missing.push("endISO/endTime");
    if (amount == null) missing.push("amount/priceCents");
    if (!paymentId) missing.push("paymentId");

    if (missing.length) {
      await session.abortTransaction(); session.endSession();
      return res.status(422).json({ message: `Missing required fields: ${missing.join(", ")}` });
    }

    const startTime = new Date(startISO);
    const endTime = new Date(endISO);
    if (isNaN(startTime.getTime())) {
      await session.abortTransaction(); session.endSession();
      return res.status(422).json({ message: "Invalid start time" });
    }
    if (isNaN(endTime.getTime()) || endTime <= startTime) {
      await session.abortTransaction(); session.endSession();
      return res.status(422).json({ message: "Invalid end time" });
    }

    // Idempotency: same paymentId -> return existing
    const existing = await Reservation.findOne({ paymentId }).session(session);
    if (existing) {
      await session.commitTransaction(); session.endSession();
      return res.status(200).json({ message: "Already confirmed", data: existing });
    }

    // Atomically flip spot -> occupied if available
    const upd = await ParkingSpot.updateOne(
      { _id: spotId, status: "available" },
      { $set: { status: "occupied" } },
      { session }
    );
    if (upd.modifiedCount === 0) {
      await session.abortTransaction(); session.endSession();
      return res.status(409).json({ message: "Spot not available" });
    }

    // Create reservation
    const [reservation] = await Reservation.create([{
      spotId,
      userId: body.userId || null,
      startTime,
      endTime,
      amount,
      currency,
      paymentId,
      paymentMethod,
      plate,
      vehicleType,
      driverName,
      status: "confirmed",
    }], { session });

    await session.commitTransaction(); session.endSession();
    return res.status(201).json({ message: "Reservation confirmed", data: reservation });
  } catch (err) {
    if (err?.code === 11000 && err?.keyPattern?.paymentId) {
      const again = await Reservation.findOne({ paymentId });
      if (again) {
        await session.commitTransaction(); session.endSession();
        return res.status(200).json({ message: "Already confirmed", data: again });
      }
    }
    await session.abortTransaction(); session.endSession();
    console.error("[confirmReservation] error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/reservations/cancel/:id
 * Effect:
 *  - Marks reservation "cancelled"
 *  - Frees spot back to "available" (only if reservation was confirmed)
 */
export const cancelReservation = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const reservation = await Reservation.findById(id).session(session);
    if (!reservation) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (reservation.status !== "confirmed") {
      // already cancelled/expired
      await session.commitTransaction();
      session.endSession();
      return res.status(200).json({ message: "Already not active", data: reservation });
    }

    // Free the spot
    await ParkingSpot.updateOne(
      { _id: reservation.spotId, status: "occupied" },
      { $set: { status: "available" } },
      { session }
    );

    reservation.status = "cancelled";
    await reservation.save({ session });

    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({ message: "Reservation cancelled", data: reservation });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("[cancelReservation] error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/reservations
 * (Simple list for admin tables)
 */
export const listReservations = async (req, res) => {
  try {
    const docs = await Reservation.find().sort({ createdAt: -1 }).lean();
    res.json({ data: docs });
  } catch (err) {
    console.error("[listReservations] error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

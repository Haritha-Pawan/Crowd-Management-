import mongoose from "mongoose";
import Reservation from "../model/Reservation.model.js";
import Spot from "../model/spot.model.js";

/**
 * POST /api/reservations/confirm
 * Body: { spotId, userId, hours, amount, paymentId, paymentMethod? }
 * Behavior:
 *  - Only creates reservation AFTER successful payment (you call this post-payment)
 *  - In a single transaction:
 *      * ensures spot is currently 'available'
 *      * updates spot -> 'occupied'
 *      * creates reservation referencing spot (no duplication of spot details)
 */
export const confirmReservation = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { spotId, userId, hours, amount, paymentId, paymentMethod } = req.body;

    if (!spotId || !userId || !hours || !amount || !paymentId) {
      return res.status(422).json({ message: "Missing required fields" });
    }

    // 1) Re-check spot availability & occupy atomically inside the txn
    const spot = await Spot.findOneAndUpdate(
      { _id: spotId, status: "available" },
      { $set: { status: "occupied" } },
      { new: true, session }
    );
    if (!spot) {
      // Either not found or already taken
      await session.abortTransaction();
      return res.status(409).json({ message: "Spot is not available anymore." });
    }

    // 2) Create reservation that references the spot (no spot details copied)
    const reservation = await Reservation.create(
      [{
        spot: spot._id,
        userId,
        hours: Number(hours),
        amount: Number(amount),
        paymentId,
        paymentMethod: paymentMethod || "card",
        // startTime auto default; endTime computed by pre-save
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // 3) Notify live clients (optional Socket.IO)
    req.app.get("io")?.emit("spot-updated", {
      id: String(spot._id),
      code: spot.code,
      zone: spot.zone,
      status: "occupied",
    });

    return res.status(201).json({ reservation: reservation[0], spot });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ message: err.message });
  }
};

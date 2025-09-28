// controllers/reservation.controller.js
import mongoose from 'mongoose';
import Reservation from '../models/Reservation.js';
import Spot from '../models/ParkingSpot.js';

const { isValidObjectId } = mongoose;

// Create a new reservation
export const createReservation = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    await session.startTransaction();

    const {
      spotId,
      placeId,
      userId,
      startTime,
      endTime,
      priceCents,
      currency,
    } = req.body || {};

    // ---- Required fields
    if (!spotId || !placeId || !startTime || !endTime) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ data: null, error: 'spotId, placeId, startTime, endTime are required' });
    }

    // ---- Validate IDs
    if (!isValidObjectId(spotId)) {
      await session.abortTransaction();
      return res.status(400).json({ data: null, error: 'Invalid spotId' });
    }
    if (!isValidObjectId(placeId)) {
      await session.abortTransaction();
      return res.status(400).json({ data: null, error: 'Invalid placeId' });
    }

    // ---- Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      await session.abortTransaction();
      return res.status(400).json({ data: null, error: 'Invalid date format' });
    }
    if (end <= start) {
      await session.abortTransaction();
      return res.status(400).json({ data: null, error: 'End time must be after start time' });
    }

    // ---- Ensure spot exists (optional but helpful)
    const spotDoc = await Spot.findById(spotId).session(session);
    if (!spotDoc) {
      await session.abortTransaction();
      return res.status(404).json({ data: null, error: 'Spot not found' });
    }

    // ---- Overlap check: existing.start < new.end AND existing.end > new.start
    const overlapping = await Reservation.findOne({
      spotId,
      status: { $ne: 'cancelled' },
      startTime: { $lt: end },
      endTime: { $gt: start },
    }).session(session);

    if (overlapping) {
      await session.abortTransaction();
      return res
        .status(409)
        .json({ data: null, error: 'Spot is already reserved for this time period' });
    }

    // ---- Create reservation
    const reservation = await Reservation.create(
      [
        {
          spotId,
          placeId,
          userId,
          startTime: start,
          endTime: end,
          status: 'confirmed',
          priceCents,
          currency, // must be one of your enum (USD/EUR/GBP)
        },
      ],
      { session }
    ).then((docs) => docs[0]);

    // ---- Update spot status
    await Spot.findByIdAndUpdate(
      spotId,
      { status: 'occupied' },
      { session, new: true }
    );

    await session.commitTransaction();
    return res.status(201).json({ data: reservation, error: null });
  } catch (error) {
    await session.abortTransaction();
    return res.status(400).json({ data: null, error: error.message });
  } finally {
    session.endSession();
  }
};

// List reservations
export const getReservations = async (req, res) => {
  try {
    // Accept placeId from query, body, or params (so your UI can pass it either way)
    const placeId =
      req.query.placeId || req.body?.placeId || req.params?.placeId;

    if (!placeId) {
      return res
        .status(400)
        .json({ data: null, error: 'placeId parameter is required' });
    }
    if (!isValidObjectId(placeId)) {
      return res.status(400).json({ data: null, error: 'Invalid placeId' });
    }

    const reservations = await Reservation.find({ placeId })
      .populate('spotId', 'label type')
      .sort({ startTime: 1 });

    return res.json({ data: reservations, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

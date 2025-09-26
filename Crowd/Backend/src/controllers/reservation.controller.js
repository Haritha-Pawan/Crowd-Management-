import mongoose from 'mongoose';
import Reservation from '../models/Reservation.js';
import Spot from '../models/Spot.js';

// Create a new reservation
export const createReservation = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { spotId, placeId, userId, startTime, endTime, priceCents, currency } = req.body;

    // Check for required fields
    if (!spotId || !placeId || !startTime || !endTime) {
      throw new Error('Missing required fields');
    }

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format');
    }

    if (end <= start) {
      throw new Error('End time must be after start time');
    }

    // Check for overlapping reservations
    const existingReservation = await Reservation.findOne({
      spotId,
      status: { $ne: 'cancelled' },
      $or: [
        {
          startTime: { $lt: end },
          endTime: { $gt: start }
        }
      ]
    }).session(session);

    if (existingReservation) {
      throw new Error('Spot is already reserved for this time period');
    }

    // Create the reservation
    const reservation = new Reservation({
      spotId,
      placeId,
      userId,
      startTime: start,
      endTime: end,
      status: 'confirmed',
      priceCents,
      currency
    });

    await reservation.save({ session });

    // Update spot status
    await Spot.findByIdAndUpdate(
      spotId,
      { status: 'occupied' },
      { session }
    );

    await session.commitTransaction();
    res.status(201).json({ data: reservation, error: null });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ data: null, error: error.message });
  } finally {
    session.endSession();
  }
};

// List reservations
export const getReservations = async (req, res) => {
  try {
    const { placeId } = req.query;
    
    if (!placeId) {
      return res.status(400).json({
        data: null,
        error: 'placeId parameter is required'
      });
    }

    const reservations = await Reservation.find({ placeId })
      .populate('spotId', 'label type')
      .sort({ startTime: 1 });

    res.json({ data: reservations, error: null });
  } catch (error) {
    res.status(500).json({ data: null, error: error.message });
  }
};
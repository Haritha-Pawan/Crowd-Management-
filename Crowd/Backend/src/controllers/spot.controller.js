import Spot from '../models/ParkingSpot.js';
import Reservation from '../models/Reservation.js';

// List spots with availability check
export const getSpots = async (req, res) => {
  try {
    const { placeId, start, end } = req.query;

    if (!placeId || !start || !end) {
      return res.status(400).json({
        data: null,
        error: 'placeId, start, and end parameters are required'
      });
    }

    const startTime = new Date(start);
    const endTime = new Date(end);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return res.status(400).json({
        data: null,
        error: 'Invalid date format. Use ISO format'
      });
    }

    // Get all spots for the place
    const spots = await Spot.find({ placeId });

    // Find overlapping reservations
    const reservations = await Reservation.find({
      placeId,
      status: { $ne: 'cancelled' },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    // Create a Set of occupied spotIds
    const occupiedSpotIds = new Set(
      reservations.map(reservation => reservation.spotId.toString())
    );

    // Add availability information to each spot
    const spotsWithAvailability = spots.map(spot => ({
      ...spot.toObject(),
      available: !occupiedSpotIds.has(spot._id.toString())
    }));

    res.json({ data: spotsWithAvailability, error: null });
  } catch (error) {
    res.status(500).json({ data: null, error: error.message });
  }
};
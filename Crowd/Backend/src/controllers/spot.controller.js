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

    // 1) Spots for this place
    const spots = await Spot.find({ placeId }).lean();
    const spotIds = spots.map(s => s._id);

    // 2) Overlapping reservations for those spots
    //    - use the correct field name: "spot" (not "spotId")
    //    - use the same spelling as your reservation controller: "canceled"
    const reservations = await Reservation.find({
      spot: { $in: spotIds },
      status: { $ne: 'canceled' },
      startTime: { $lt: endTime },
      endTime:   { $gt: startTime }
    }).select('spot').lean();

    const occupiedByTime = new Set(reservations.map(r => String(r.spot)));

    // 3) A spot is unavailable if:
    //    - its current status is 'occupied' OR
    //    - it has an overlapping reservation (occupiedByTime)
    const spotsWithAvailability = spots.map(s => ({
      ...s,
      available: !(s.status === 'occupied' || occupiedByTime.has(String(s._id)))
    }));

    return res.json({ data: spotsWithAvailability, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

// controllers/spot.controller.js
export const updateSpotStatus = async (req, res) => {
  try {
    const { status } = req.body;
    // must match models/ParkingSpot.js enum exactly
    if (!["available", "occupied", "maintenance"].includes(status)) {
      return res.status(422).json({ message: "Invalid status" });
    }
    const spot = await Spot.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!spot) return res.status(404).json({ message: "Spot not found" });
    res.json(spot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

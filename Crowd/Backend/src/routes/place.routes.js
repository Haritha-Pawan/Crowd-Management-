// src/routes/place.routes.js
import express from 'express';
import mongoose from 'mongoose';
import { createPlace, getAllPlaces, getPlaceById } from '../controllers/place.controller.js';
import Place from '../models/Place.js';
import ParkingSpot from '../models/ParkingSpot.js';

const router = express.Router();

/* -------------------- your existing routes (unchanged) -------------------- */

// POST /api/places - Create a new place and its spots
router.post('/', createPlace);

// GET /api/places - List all places (your original controller)
router.get('/', getAllPlaces);

// GET /api/places/:id - Get a single place (original)
router.get('/:id', getPlaceById);

/* -------------------- additions: live counts endpoints -------------------- */

// helper to summarize a single placeId from ParkingSpot
async function summarizePlace(placeId) {
  const [row] = await ParkingSpot.aggregate([
    { $match: { placeId: new mongoose.Types.ObjectId(placeId) } },
    {
      $group: {
        _id: '$placeId',
        total:       { $sum: 1 },
        available:   { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } },
        occupied:    { $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] } },
        maintenance: { $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] } },
      }
    }
  ]);

  const capacity = row?.total ?? 0;
  const occupied = row?.occupied ?? 0;
  const availableSpots = row?.available ?? Math.max(0, capacity - occupied);
  const maintenance = row?.maintenance ?? 0;

  return { capacity, occupied, availableSpots, maintenance };
}

// GET /api/places/live  -> all places with live counts
router.get('/live', async (_req, res) => {
  try {
    const places = await Place.find().lean();

    // aggregate once for all places
    const agg = await ParkingSpot.aggregate([
      {
        $group: {
          _id: '$placeId',
          total:       { $sum: 1 },
          available:   { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } },
          occupied:    { $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] } },
          maintenance: { $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] } },
        }
      }
    ]);

    const byPlace = new Map(agg.map(r => [String(r._id), r]));

    const data = places.map(p => {
      const r = byPlace.get(String(p._id));
      const capacity = r?.total ?? 0;
      const occupied = r?.occupied ?? 0;
      const availableSpots = r?.available ?? Math.max(0, capacity - occupied);
      const maintenance = r?.maintenance ?? 0;
      return { ...p, capacity, occupied, availableSpots, maintenance };
    });

    res.json({ data, error: null });
  } catch (e) {
    res.status(500).json({ data: null, error: String(e?.message || e) });
  }
});

// GET /api/places/:id/live -> one place with live counts
router.get('/:id/live', async (req, res) => {
  try {
    const place = await Place.findById(req.params.id).lean();
    if (!place) return res.status(404).json({ data: null, error: 'Place not found' });

    const counts = await summarizePlace(place._id);
    res.json({ data: { ...place, ...counts }, error: null });
  } catch {
    res.status(400).json({ data: null, error: 'Invalid id' });
  }
});

export default router;

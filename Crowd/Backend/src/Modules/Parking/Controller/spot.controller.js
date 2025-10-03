import mongoose from 'mongoose';
import ParkingSpot from '../model/spot.model.js';
// If you list time-based availability, this import is optional but useful:

// Normalize zone/type coming from FE
const normalizeType = (t) => {
  const v = String(t || 'standard').toLowerCase();
  return ['standard', 'handicap', 'vip'].includes(v) ? v : 'standard';
};

/** ---------- helper used by Zone create() ---------- */
export const createSpotsForZone = async ({ zoneId, capacity, type, code }, session = null) => {
  if (!mongoose.isValidObjectId(zoneId)) return { inserted: 0 };
  const count = Number(capacity) || 0;
  if (count <= 0) return { inserted: 0 };

  const spotType = normalizeType(type);
  const prefix = (code || 'spot').toString().trim().toLowerCase();

  const docs = Array.from({ length: count }, (_, i) => ({
    zoneId,
    label: `${prefix}-${String(i + 1).padStart(3, '0')}`,
    type: spotType,
    status: 'available',
  }));

  try {
    const inserted = await ParkingSpot.insertMany(docs, { session, ordered: false });
    return { inserted: inserted.length };
  } catch (e) {
    // handle partial success due to duplicates
    if (e?.writeErrors?.length) {
      const n = e.result?.nInserted ?? 0;
      return { inserted: n };
    }
    throw e;
  }
};

/** POST /api/spots (create one manual spot) */
export const createSpot = async (req, res) => {
  try {
    const zoneId = req.body.zoneId || req.body.placeId; // back-compat
    const { label, type, status } = req.body || {};
    if (!zoneId || !label) {
      return res.status(422).json({ error: 'zoneId (or placeId) and label are required' });
    }

    const doc = await ParkingSpot.create({
      zoneId,
      label: String(label).trim(),
      type: normalizeType(type),
      status: status || 'available',
    });

    return res.status(201).json({ data: doc });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Duplicate spot label for this zone' });
    }
    return res.status(400).json({ error: err?.message || 'Validation error' });
  }
};

/** POST /api/spots/bulk  (optional admin utility) */
export const bulkCreateSpots = async (req, res) => {
  try {
    const zoneId = req.body.zoneId || req.body.placeId; // back-compat
    const { capacity, type, code } = req.body || {};
    if (!zoneId || !capacity || !code) {
      return res.status(422).json({ error: 'zoneId/placeId, capacity, and code are required' });
    }
    const result = await createSpotsForZone({ zoneId, capacity, type, code });
    return res.status(201).json({ data: { inserted: result.inserted } });
  } catch (err) {
    return res.status(400).json({ error: err?.message || 'Validation error' });
  }
};

/** GET /api/spots?zoneId=...&start=ISO&end=ISO  (availability) */
export const getSpots = async (req, res) => {
  try {
    const zoneId = req.query.zoneId || req.query.zoneId; // back-compat for FE
    

    if (zoneId ) {
      return res.status(400).json({ error: 'zoneId/placeId, start, and end are required (ISO strings)' });
    }

 
    const spots = await ParkingSpot.find({ zoneId }).lean();
    const spotIds = spots.map((s) => s._id);

 
    const data = spots.map((s) => ({
      ...s,
      available: !(s.status === 'occupied' || busy.has(String(s._id))),
    }));

    return res.json({ data });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
};

/** GET /api/spots/:id */
export const getSpotById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const doc = await ParkingSpot.findById(id).lean();
    if (!doc) return res.status(404).json({ error: 'Not found' });
    return res.json({ data: doc });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
};

/** PATCH /api/spots/:id/status */
export const updateSpotStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!['available', 'occupied', 'maintenance'].includes(status)) {
      return res.status(422).json({ error: 'Invalid status' });
    }
    const doc = await ParkingSpot.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ error: 'Not found' });
    return res.json({ data: doc });
  } catch (err) {
    return res.status(400).json({ error: err?.message || 'Bad request' });
  }
};


/** GET /api/spots
 *  - If no zoneId/start/end → return all spots
 *  - If zoneId provided → return all spots for that zone
 */
export const getSpot = async (req, res) => {
  try {
    const { zoneId, placeId } = req.query;
    const filter = {};

    if (zoneId) {
      filter.zoneId = zoneId;
    }
    if (placeId) {
      filter.placeId = placeId;
    }

    const spots = await ParkingSpot.find(filter).lean();

    // availability: if status !== "occupied", mark as available
    const data = spots.map((s) => ({
      ...s,
      available: s.status !== "occupied"
    }));

    return res.json({ data });
  } catch (err) {
    console.error("getSpots error:", err);
    return res.status(500).json({ error: err?.message || "Server error" });
  }
};

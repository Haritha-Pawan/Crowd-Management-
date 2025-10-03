import mongoose from 'mongoose';
import Zone from '../model/Zone.model.js';
import { createSpotsForZone } from './spot.controller.js';

// helpers
const toNumberOr = (v, fallback = undefined) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const asFacilitiesArray = (v) =>
  Array.isArray(v)
    ? v.map(String)
    : typeof v === 'string' && v.trim()
    ? v.split(',').map((s) => s.trim())
    : [];

/** POST / (create) — also auto-creates N spots */
export const createZone = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      name,
      code,
      location,
      capacity,
      type,
      status,
      price,
      distance,
      description,
      facilities,
      availableSpots,
    } = req.body || {};

    // 1) create zone
    const zoneDoc = await Zone.create(
      [
        {
          name: String(name || '').trim(),
          code:
            (code && String(code).trim()) ||
            String(name || '')
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, ''),
          location: String(location || '').trim(),
          capacity: toNumberOr(capacity, 0),
          type: type || 'Standard',
          status: status || 'active',
          price: toNumberOr(price, 0),
          distance: distance ?? '',
          description: description ?? '',
          facilities: asFacilitiesArray(facilities),
          availableSpots: toNumberOr(availableSpots, undefined),
        },
      ],
      { session }
    ).then((docs) => docs[0]);

    // 2) auto-create N spots for this zone
    const { inserted: spotsCreated } = await createSpotsForZone(
      {
        zoneId: zoneDoc._id,
        capacity: zoneDoc.capacity,
        type: zoneDoc.type, // will be normalized to enum by spot helper
        code: zoneDoc.code, // labels like code-001, code-002, ...
      },
      session
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ data: zoneDoc, spotsCreated });
  } catch (err) {
    try { await session.abortTransaction(); } catch {}
    session.endSession();
    if (err?.code === 11000 && err?.keyPattern?.code) {
      return res.status(409).json({ error: 'Code already exists' });
    }
    return res.status(400).json({ error: err?.message || 'Validation error' });
  }
};

/** GET / (list) */
export const listZones = async (req, res) => {
  try {
    const { status, type, minCapacity, maxPrice } = req.query || {};
    const q = {};
    if (status) q.status = status;
    if (type) q.type = type;
    if (minCapacity) q.capacity = { ...(q.capacity || {}), $gte: Number(minCapacity) };
    if (maxPrice) q.price = { ...(q.price || {}), $lte: Number(maxPrice) };

    const items = await Zone.find(q).sort({ createdAt: -1 }).lean();
    return res.json({ data: items, count: items.length });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
};

/** GET /:id */
export const getZoneById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const doc = await Zone.findById(id).lean();
    if (!doc) return res.status(404).json({ error: 'Not found' });
    return res.json({ data: doc });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
};

/** PUT /:id */
export const updateZone = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const update = { ...req.body };
    if (update.capacity !== undefined) update.capacity = toNumberOr(update.capacity, 0);
    if (update.price !== undefined) update.price = toNumberOr(update.price, 0);
    if (update.facilities !== undefined) update.facilities = asFacilitiesArray(update.facilities);
    delete update.coordinates; // ignored

    const doc = await Zone.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    return res.json({ data: doc });
  } catch (err) {
    if (err?.code === 11000 && err?.keyPattern?.code) {
      return res.status(409).json({ error: 'Code already exists' });
    }
    return res.status(400).json({ error: err?.message || 'Validation error' });
  }
};

/** DELETE /:id */
export const deleteZone = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const doc = await Zone.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    return res.json({ message: 'Zone deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
};

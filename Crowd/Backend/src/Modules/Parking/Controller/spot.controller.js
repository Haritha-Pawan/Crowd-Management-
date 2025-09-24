// src/Modules/Parking/Controller/spot.controllers.js
import Spot from "../model/spot.model.js";

// tiny helper: case-insensitive exact regex
const exactI = (s) => new RegExp("^" + String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i");

// GET /api/spots
export const listSpots = async (req, res) => {
  try {
    const q = {};
    if (req.query.zone) q.zone = String(req.query.zone);
    if (req.query.q) q.code = new RegExp(String(req.query.q).trim(), "i");
    const spots = await Spot.find(q).sort({ code: 1 }).lean();
    res.json(spots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/spots
export const createSpot = async (req, res) => {
  try {
    const { code, zone, type, total } = req.body;
    if (!code || !zone) return res.status(400).json({ message: "code and zone are required" });
    const doc = await Spot.create({ code, zone, type, total });
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PATCH /api/spots/:id/status  -> { status: "available" | "occupied" | "reserved" | "blocked" }
export const updateSpotStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["available", "occupied", "reserved", "blocked"].includes(status)) {
      return res.status(422).json({ message: "Invalid status" });
    }
    const spot = await Spot.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!spot) return res.status(404).json({ message: "Spot not found" });
    res.json(spot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PATCH /api/spots/code/:code/status  -> same payload as above
export const updateSpotStatusByCode = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["available", "occupied", "reserved", "blocked"].includes(status)) {
      return res.status(422).json({ message: "Invalid status" });
    }
    const code = req.params.code;
    const spot = await Spot.findOneAndUpdate({ code: exactI(code) }, { status }, { new: true, runValidators: true });
    if (!spot) return res.status(404).json({ message: "Spot not found" });
    res.json(spot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// (optional strict) POST /api/spots/:id/occupy -> only if currently available
export const occupySpot = async (req, res) => {
  try {
    const spot = await Spot.findOneAndUpdate(
      { _id: req.params.id, status: "available" },
      { $set: { status: "occupied" } },
      { new: true }
    );
    if (!spot) return res.status(409).json({ message: "Spot is not available anymore." });
    res.json(spot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// src/Modules/Parking/Route/spot.route.js
import { Router } from "express";
import Spot from "../model/spot.model.js";

const router = Router();

// --- UPDATE BY CODE (must be ABOVE the :id route) ---
router.patch("/code/:code/status", async (req, res) => {
  try {
    const { status } = req.body;              // e.g. "occupied"
    const code = req.params.code;             // e.g. "B002"

    // case-insensitive exact match
    const rx = new RegExp("^" + code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i");

    const spot = await Spot.findOneAndUpdate(
      { code: rx },
      { status },
      { new: true, runValidators: true }
    );

    if (!spot) return res.status(404).json({ message: "Spot not found" });
    res.json(spot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- UPDATE BY MONGO _id ---
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
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
});

// --- LIST (handy for debugging) ---
router.get("/", async (_req, res) => {
  const spots = await Spot.find().lean();
  res.json(spots);
});

export default router;

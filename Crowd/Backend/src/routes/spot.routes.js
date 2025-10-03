import express from 'express';
import { getSpots } from '../controllers/spot.controller.js';
import { updateSpotStatus } from '../controllers/spot.controller.js';
const router = express.Router();

// GET /api/spots - List spots with availability check
router.get('/', getSpots);
router.patch('/:id/status', updateSpotStatus);

export default router;
import express from 'express';
import { getSpots } from '../controllers/spot.controller.js';

const router = express.Router();

// GET /api/spots - List spots with availability check
router.get('/', getSpots);

export default router;
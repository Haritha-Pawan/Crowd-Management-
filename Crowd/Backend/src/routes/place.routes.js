import express from 'express';
import { createPlace, getAllPlaces, getPlaceById } from '../controllers/place.controller.js';

const router = express.Router();

// POST /api/places - Create a new place and its spots
router.post('/', createPlace);

// GET /api/places - List all places
router.get('/', getAllPlaces);

// GET /api/places/:id - Get a single place
router.get('/:id', getPlaceById);

export default router;
import express from 'express';
import { createReservation, getReservations } from '../controllers/reservation.controller.js';

const router = express.Router();

// POST /api/reservations - Create a new reservation
router.post('/', createReservation);

// GET /api/reservations - List reservations
router.get('/', getReservations);

export default router;
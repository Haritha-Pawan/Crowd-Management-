// routes/reservation.routes.js
import express from "express";
import {
  confirmReservation,
  cancelReservation,
  listReservations,
} from "../Controller/reservation.controller.js";

const router = express.Router();

// POST after successful payment (front-end calls this)
router.post("/confirm", confirmReservation);

// POST cancel by id (optional admin/user action)
router.post("/cancel/:id", cancelReservation);

// GET list (for admin UI / tables)
router.get("/", listReservations);

export default router;

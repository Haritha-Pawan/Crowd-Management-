// src/Modules/Checkout/Route/ticket.route.js
import { Router } from "express";
import {
  checkoutAndGenerateQR,
  listTickets,
  getTicketStats,
} from "../Controller/checkout.controller.js";

const router = Router();

// Payment + QR + Counter assignment
router.post("/", checkoutAndGenerateQR);

// Admin/ops helpers
router.get("/", listTickets);
router.get("/stats", getTicketStats);

export default router;

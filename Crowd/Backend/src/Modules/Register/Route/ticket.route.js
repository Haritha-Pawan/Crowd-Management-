import { Router } from "express";
import {
  checkoutAndGenerateQR,
  listTickets,
  getTicketStats,
  scanTicket,
  listScanLogs,
  // _debugGetPasswordHash, // optional debug helper (protect with auth before enabling)
} from "../Controller/checkout.controller.js";

const router = Router();

// Payment + QR + Counter assignment
router.post("/", checkoutAndGenerateQR);
router.post("/scan", scanTicket);

// Admin/ops helpers
router.get("/", listTickets);
router.get("/stats", getTicketStats);
router.get("/scan-logs", listScanLogs);

// OPTIONAL DEBUG (admin-only! protect with auth before enabling)
// router.get("/debug/password/:id", _debugGetPasswordHash);

export default router;

import {   checkoutAndGenerateQR, listTickets ,getTicketStats } from "../Controller/checkout.controller.js";


import { Router } from "express";
const router = Router();

// POST/api/checkout

router.post("/", checkoutAndGenerateQR);
router.get("/", listTickets);
router.get("/stats", getTicketStats);

export default router;

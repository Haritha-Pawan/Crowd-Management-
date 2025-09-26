import { Router } from "express";
import { body, validationResult } from "express-validator";
import { confirmReservation } from "../Controller/reservation.controller.js";

const router = Router();

const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    next();
  },
];

// Called only AFTER payment success (e.g., from your frontend OR payment webhook)
router.post(
  "/confirm",
  validate([
    body("spotId").isString().notEmpty(),
    body("userId").isString().notEmpty(),
    body("hours").isInt({ min: 1 }),
    body("amount").isFloat({ min: 0 }),
    body("paymentId").isString().notEmpty(),
    body("paymentMethod").optional().isString(),
  ]),
  confirmReservation
);

export default router;

// Mount in server:
// app.use("/api/reservations", reservationRouter);

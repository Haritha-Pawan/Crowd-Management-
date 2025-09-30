import { Router } from "express";
import { body, validationResult } from "express-validator";
import { createReservation, getReservation, cancelReservation } from "../Controller/reservation.controller.js";

const router = Router();

const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) return res.status(422).json({ errors: result.array() });
    next();
  },
];

// allow legacy 'spot' → 'spotId'
const normalizeSpot = (req, _res, next) => {
  if (!req.body.spotId && req.body.spot) req.body.spotId = req.body.spot;
  next();
};

router.post(
  "/",
  normalizeSpot,
  validate([
    body("spotId").isMongoId().withMessage("spotId must be a valid ObjectId"),
    body("paymentId").isString().notEmpty(),
    body("startTime").isISO8601(),
    body("endTime").isISO8601(),
    body("priceCents").optional().isInt({ min: 0 }),
    body("currency").optional().isString(),
    body("paymentMethod").optional().isString(),
    body("driverName").optional().isString(),
    body("plateNumber").optional().isString(),
    body("userId").optional().isString(),
  ]),
  createReservation
);

// Optional alias
router.post(
  "/confirm",
  normalizeSpot,
  validate([
    body("spotId").isMongoId(),
    body("paymentId").isString().notEmpty(),
    body("startTime").isISO8601(),
    body("endTime").isISO8601(),
  ]),
  createReservation
);

router.get("/", getReservation);
router.patch("/:id/cancel", cancelReservation);

export default router;

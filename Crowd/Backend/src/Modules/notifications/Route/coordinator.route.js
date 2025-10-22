import express from "express";
import { coordInbox, coordMarkAllRead, coordMarkOneRead, createForCoordinator } from "../../notifications/controller/coordinator.controller.js";
import { attachUserIfToken, validateToken } from "../../User/Middlewares/validate.js";

const router = express.Router();

// create a user-targeted notification for coordinator(s)
router.post("/", validateToken, createForCoordinator);

// unread inbox for current coordinator (by role/userId/name)
router.get("/inbox", attachUserIfToken, coordInbox);

// mark single read
router.post("/:id/read", attachUserIfToken, coordMarkOneRead);

// mark many read (pass { ids: [...] } or keep empty if you want to mark all you loaded)
router.post("/read-all", attachUserIfToken, coordMarkAllRead);

export default router;

import express from "express";
import {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllAttendees2,
  getRegistrationsPerDay,
  sendMessageToAllAttendees

  
} from "../User/User.controller.js";

const router = express.Router();
//get attendees count
router.post("/attendees/new", getAllAttendees2);

// GET all users
router.get("/", getAllUsers);

//register daily count
router.get("/attendee-daily-count", getRegistrationsPerDay);

//send message to all attendees
router.post("/attendees/send-message", sendMessageToAllAttendees);

// POST new user
router.post("/", createUser);

//user get by id
router.get("/:id", getUserById);

//update user details get by id

router.put("/:id", updateUser);

// DELETE user
router.delete("/:id", deleteUser);








export default router;

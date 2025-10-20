import express from "express";
import {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllAttendees2,
  getRegistrationsPerDay
  
} from "../User/User.controller.js";

const router = express.Router();
//get attendees count
router.post("/attendees/new", getAllAttendees2);

//get registrations per day
router.get("/attendee-daily-count", getRegistrationsPerDay);

// GET all users
router.get("/", getAllUsers);


// POST new user
router.post("/", createUser);

//user get by id
router.get("/:id", getUserById);

//update user details get by id

router.put("/:id", updateUser);

// DELETE user
router.delete("/:id", deleteUser);










export default router;

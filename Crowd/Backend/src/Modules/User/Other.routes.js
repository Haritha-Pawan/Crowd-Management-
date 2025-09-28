import express from "express";
import {getAllAttendees,getAttendeeCount, deleteAllAttendees} from "../User/User.controller.js";
 
const router = express.Router();

//get all attendees
router.get("/attendance",getAllAttendees);


//get attendees count
router.get("/attendance/count", getAttendeeCount);

//delete all attendees
router.delete("/attendance/delete", deleteAllAttendees);  

export default router;

import User from "../User/User.model.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Attendee from "../User/AttendeModel.js";

// Display all users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    if (!users || users.length === 0) {
      return res.status(200).json({ message: "No users found" });
    }

    return res.status(200).json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Add new user
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // check duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // find user by id
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//update user details
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Extract updated fields from request body
    const { name, email, password, role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, password, role },
      { new: true, runValidators: true } // return updated doc & validate schema
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error hi" });
  }
};

// delete user get by id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while deleting user" });
  }
};

export const getAllAttendees = async (req, res) => {
  try {
    const attendees = await Attendee.find().sort({ createdAt: -1 });

    if (!attendees.length) {
      return res.status(404).json({ message: 'No attendees found' });
    }

    res.status(200).json(attendees);
  } catch (err) {
    console.error(err); // good for debugging
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

//delete all attendees
export const deleteAllAttendees = async (req, res) => {
  try { 
    const result = await Attendee.deleteMany({});
    res.status(200).json({ message: `${result.deletedCount} attendees deleted.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  } 
};

// Get total attendee count
export const getAttendeeCount = async (req, res) => {
  try {
    // Counts all attendee documents in your DB
    const count = await Attendee.countDocuments();
    res.status(200).json({ count });
  } catch (err) {
    console.error("Error getting attendee count:", err);
    res.status(500).json({ message: "Server error" });
  }
};
//get all attendees -2
export const getAllAttendees2 = async (req, res) => {
  try {
    const attendees = await Attendee.find();
    res.status(200).json(attendees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


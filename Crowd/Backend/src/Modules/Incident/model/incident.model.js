import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Emergency', 'Lost Person', 'Lost Item', 'Complaints'],
    required: true,
  },
  // Common Fields
  reportedBy: { type: String, default: 'Anonymous' }, // you can update this if you have user info
  time: { type: Date, default: Date.now },

  // Emergency Fields
  emergencyType: String,
  description: String,
  location: String,

  // Lost Person Fields
  name: String,
  age: Number,
  lastSeen: String,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  imageUrl: String, // store image URL after upload

  // Lost Item Fields
  itemName: String,
  lastSeenLocation: String,
  itemDescription: String,

  // Complaints Fields
  subject: String,
  complaintDetails: String,

  status: {
    type: String,
    enum: ['Pending', 'Solved'],
    default: 'Pending',
  },
});


const incident = mongoose.model("incident",incidentSchema);
export default incident;

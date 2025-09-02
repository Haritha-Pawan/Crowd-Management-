import mongoose from "mongoose";

const ParkingZoneSchema = new mongoose.Schema(
  {
    name: {
      type: String ,
      unique: true,
      required: [true, "Zone name is required"],
      trim: true,
      minlength: [2, "Zone name must be at least 2 characters"],
      maxlength: [100, "Zone name too long"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be greater than zero"],
    },
  
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [300, "Description too long"],
    },
    facilities: { type: [String], default: [] }, 
  },
  { timestamps: true }
);

// Create and export the ParkingZone model
const ParkingZone = mongoose.model("ParkingZone", ParkingZoneSchema);

export default ParkingZone;

import mongoose from 'mongoose';

const parkingSpotSchema = new mongoose.Schema({
  placeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place',
    required: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['standard', 'handicap', 'vip'],
    default: 'standard'
  },
  status: {
    type: String,
    required: true,
    enum: ['available', 'occupied', 'maintenance'],
    default: 'available'
  }
}, {
  timestamps: true
});

// Create compound unique index on placeId and label
parkingSpotSchema.index({ placeId: 1, label: 1 }, { unique: true });

const ParkingSpot = mongoose.model('ParkingSpot', parkingSpotSchema);

export default ParkingSpot;
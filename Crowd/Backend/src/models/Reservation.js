import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  spotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Spot',
    required: true
  },
  placeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  priceCents: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP'],
    default: 'USD'
  },
  paymentId: {
    type: String
  }
}, {
  timestamps: true
});

// Index for overlap checks - helps query efficiency when checking for conflicting reservations
reservationSchema.index({ spotId: 1, startTime: 1, endTime: 1 });
reservationSchema.index({ placeId: 1, startTime: 1, endTime: 1 });

// Index for querying user's reservations
reservationSchema.index({ userId: 1, startTime: 1 });

// Check if model exists before compiling
const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);

export default Reservation;
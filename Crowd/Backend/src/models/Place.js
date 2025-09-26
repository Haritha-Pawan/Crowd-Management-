import mongoose from 'mongoose';

const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    required: true,
    default: 'Standard',
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  distance: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  facilities: [{
    type: String,
    trim: true
  }],
  coordinates: {
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    }
  },
  availableSpots: {
    type: Number,
    default: function() {
      return this.capacity;
    }
  }
}, {
  timestamps: true
});

// Create index on code field
placeSchema.index({ code: 1 }, { unique: true });

const Place = mongoose.model('Place', placeSchema);

export default Place;
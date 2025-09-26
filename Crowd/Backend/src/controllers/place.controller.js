import mongoose from 'mongoose';
import Place from '../models/Place.js';
import ParkingSpot from '../models/ParkingSpot.js';

// Create a new place and its spots
export const createPlace = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      name,
      location,
      capacity,
      type = 'Standard',
      status = 'active',
      price,
      distance,
      description,
      facilities = [],
      latitude,
      longitude
    } = req.body;

    // Generate code from name
    const code = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // Create the place with all fields
    const place = new Place({
      name,
      code,
      location,
      capacity: Number(capacity),
      type,
      status,
      price: Number(price) || 0,
      distance,
      description,
      facilities,
      coordinates: {
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined
      },
      availableSpots: Number(capacity)
    });
    await place.save({ session });

    // Generate spots based on capacity
    const spots = Array.from({ length: capacity }, (_, index) => ({
      placeId: place._id,
      label: `${code}-${String(index + 1).padStart(3, '0')}`,
      type: type.toLowerCase(),
      status: 'available'
    }));

    await ParkingSpot.insertMany(spots, { session });

    await session.commitTransaction();
    res.status(201).json({ data: place, error: null });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ 
      data: null, 
      error: error.code === 11000 ? 'Code already exists' : error.message 
    });
  } finally {
    session.endSession();
  }
};

// Get a single place by ID
export const getPlaceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        data: null,
        error: 'Invalid place ID format'
      });
    }

    const place = await Place.findById(id).select('-__v');

    if (!place) {
      return res.status(404).json({
        data: null,
        error: 'Place not found'
      });
    }

    res.json({
      data: place,
      error: null
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error.message
    });
  }
};

// List all places with optional filters
export const getAllPlaces = async (req, res) => {
  try {
    const { status, type, minCapacity, maxPrice } = req.query;
    
    // Build filter object based on query parameters
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (minCapacity) {
      filter.capacity = { $gte: Number(minCapacity) };
    }
    
    if (maxPrice) {
      filter.price = { $lte: Number(maxPrice) };
    }

    // Find places with filters and sort by creation date
    const places = await Place.find(filter)
      .sort({ createdAt: -1 }) // Latest first
      .select('-__v'); // Exclude version key

    res.json({
      data: places,
      error: null,
      count: places.length
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error.message
    });
  }
};
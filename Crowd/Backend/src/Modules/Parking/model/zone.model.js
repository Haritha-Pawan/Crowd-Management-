import mongoose from 'mongoose';

const ZoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true },
    location: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 0 },
    type: { type: String, required: true, default: 'Standard', trim: true },
    status: { type: String, required: true, enum: ['active', 'inactive'], default: 'active' },
    price: { type: Number, required: true, min: 0, default: 0 },
    distance: { type: String, trim: true },
    description: { type: String, trim: true },
    facilities: [{ type: String, trim: true }],

    // no coordinates (latitude/longitude) per your request

    availableSpots: {
      type: Number,
      default: function () {
        return this.capacity;
      },
    },
  },
  { timestamps: true }
);

// unique index on code
ZoneSchema.index({ code: 1 }, { unique: true });

const Zone = mongoose.model('Zone', ZoneSchema);
export default Zone;

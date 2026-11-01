const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide theatre name'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Please provide theatre location/neighborhood'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'Please provide theatre city'],
      trim: true,
      default: 'Mumbai'
    },
    address: {
      type: String,
      required: [true, 'Please provide full address'],
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      default: '+91 22 2456 7890'
    },
    amenities: {
      type: [String],
      default: ['Dolby Atmos', '4K Laser Projection', 'Recliner Seats', 'Cafeteria', 'Parking']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Theatre', theatreSchema);

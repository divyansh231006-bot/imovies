const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema(
  {
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true
    },
    screenName: {
      type: String,
      required: [true, 'Please provide screen name'],
      trim: true
    },
    screenType: {
      type: String,
      enum: ['Standard', 'IMAX 4K', 'Dolby Atmos', '4DX', 'VIP Lounge'],
      default: 'Dolby Atmos'
    },
    totalSeats: {
      type: Number,
      required: true,
      default: 80
    },
    // Visual layout configuration: rows with tiers and seat counts
    rowsConfig: [
      {
        rowLetter: { type: String, required: true }, // e.g., 'A', 'B', 'C'
        tier: {
          type: String,
          enum: ['Silver', 'Gold', 'Platinum', 'VIP'],
          default: 'Gold'
        },
        seatsCount: { type: Number, required: true, default: 12 },
        aisleAfter: { type: [Number], default: [4, 8] } // e.g. aisle gap after seat 4 and seat 8
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Screen', screenSchema);

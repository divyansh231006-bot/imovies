const mongoose = require('mongoose');

const seatLockSchema = new mongoose.Schema(
  {
    showtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showtime',
      required: true,
      index: true
    },
    seatNumbers: {
      type: [String],
      required: true,
      validate: [val => val.length > 0, 'Must lock at least one seat']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // MongoDB TTL index to automatically purge expired documents
    }
  },
  {
    timestamps: true
  }
);

// Composite index for fast checking if seats in a showtime are locked
seatLockSchema.index({ showtimeId: 1, seatNumbers: 1 });

module.exports = mongoose.model('SeatLock', seatLockSchema);

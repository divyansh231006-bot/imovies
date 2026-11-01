const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true
    },
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true
    },
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: true
    },
    showDate: {
      type: String, // 'YYYY-MM-DD'
      required: true,
      index: true
    },
    startTime: {
      type: String, // '10:30 AM'
      required: true
    },
    endTime: {
      type: String, // '01:15 PM'
      required: true
    },
    seatPricing: {
      Silver: { type: Number, default: 180 },
      Gold: { type: Number, default: 260 },
      Platinum: { type: Number, default: 380 },
      VIP: { type: Number, default: 550 }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent overlapping showtimes on the same screen on the same date
showtimeSchema.index({ screenId: 1, showDate: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('Showtime', showtimeSchema);

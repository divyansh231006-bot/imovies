const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    showtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showtime',
      required: true,
      index: true
    },
    selectedSeats: [
      {
        seatNumber: { type: String, required: true },
        tier: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ],
    ticketSubtotal: {
      type: Number,
      required: true
    },
    convenienceFee: {
      type: Number,
      default: 30
    },
    taxAmount: {
      type: Number,
      default: 18
    },
    totalAmount: {
      type: Number,
      required: true
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed'
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'failed', 'refunded'],
      default: 'paid'
    },
    paymentMethod: {
      type: String,
      default: 'Mock Card / UPI'
    },
    paymentReference: {
      type: String,
      required: true
    },
    qrCode: {
      type: String, // Base64 data URL generated with qrcode
      default: ''
    },
    bookingDate: {
      type: Date,
      default: Date.now
    },
    cancelledAt: {
      type: Date
    },
    cancellationReason: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Booking', bookingSchema);

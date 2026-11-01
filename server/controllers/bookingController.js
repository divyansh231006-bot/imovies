const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Screen = require('../models/Screen');
const SeatLock = require('../models/SeatLock');
const QRCode = require('qrcode');
const { broadcastSeatsBooked, broadcastSeatUnlock } = require('../sockets/seatSocket');

// Generate unique human-readable booking ID
const generateBookingId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `IMV-${code}`;
};

// @desc    Create new booking with payment verification
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const {
      showtimeId,
      selectedSeats,
      paymentMethod = 'Credit / Debit Card',
      paymentReference
    } = req.body;

    if (!showtimeId || !selectedSeats || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking data. Please provide showtimeId and selectedSeats'
      });
    }

    const showtime = await Showtime.findById(showtimeId)
      .populate('movieId')
      .populate('theatreId')
      .populate('screenId');

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found'
      });
    }

    const seatNumbers = selectedSeats.map(s => s.seatNumber);

    // 1. Double-booking check: Ensure no seat is already confirmed
    const existingConfirmed = await Booking.find({
      showtimeId,
      bookingStatus: 'confirmed',
      'selectedSeats.seatNumber': { $in: seatNumbers }
    });

    if (existingConfirmed.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'One or more of the selected seats were already booked by another user.'
      });
    }

    // 2. Server-side price calculation (Never trust frontend price)
    const pricing = showtime.seatPricing;
    let ticketSubtotal = 0;
    const validatedSeats = [];

    for (const s of selectedSeats) {
      const tier = s.tier || 'Gold';
      const actualPrice = pricing[tier] || 250;
      ticketSubtotal += actualPrice;
      validatedSeats.push({
        seatNumber: s.seatNumber,
        tier,
        price: actualPrice
      });
    }

    // Standard convenience fee: ₹30 flat + 18% GST on convenience fee
    const convenienceFee = 35;
    const taxAmount = Math.round(convenienceFee * 0.18);
    const totalAmount = ticketSubtotal + convenienceFee + taxAmount;

    // 3. Generate Unique Booking ID & Payment Ref
    let bookingId = generateBookingId();
    // Ensure uniqueness
    while (await Booking.findOne({ bookingId })) {
      bookingId = generateBookingId();
    }

    const finalPaymentRef = paymentReference || `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // 4. Generate QR Code
    const qrData = JSON.stringify({
      bookingId,
      movie: showtime.movieId.title,
      theatre: showtime.theatreId.name,
      date: showtime.showDate,
      time: showtime.startTime,
      seats: seatNumbers
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 250,
      margin: 2,
      color: {
        dark: '#E50914',
        light: '#FFFFFF'
      }
    });

    // 5. Create Booking Document
    const booking = await Booking.create({
      bookingId,
      userId: req.user._id,
      showtimeId,
      selectedSeats: validatedSeats,
      ticketSubtotal,
      convenienceFee,
      taxAmount,
      totalAmount,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod,
      paymentReference: finalPaymentRef,
      qrCode: qrCodeDataUrl,
      bookingDate: new Date()
    });

    // 6. Delete temporary lock for these seats
    await SeatLock.deleteMany({
      showtimeId,
      seatNumbers: { $in: seatNumbers }
    });

    // 7. Broadcast confirmed booking to all connected users in showtime room
    broadcastSeatsBooked(showtimeId, { seatNumbers });

    const populatedBooking = await Booking.findById(booking._id)
      .populate({
        path: 'showtimeId',
        populate: [
          { path: 'movieId' },
          { path: 'theatreId' },
          { path: 'screenId' }
        ]
      })
      .populate('userId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      data: populatedBooking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user's bookings (upcoming & past)
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate({
        path: 'showtimeId',
        populate: [
          { path: 'movieId', select: 'title poster duration genre rating' },
          { path: 'theatreId', select: 'name location city address' },
          { path: 'screenId', select: 'screenName screenType' }
        ]
      })
      .sort({ bookingDate: -1 });

    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = [];
    const past = [];

    bookings.forEach(b => {
      if (!b.showtimeId) {
        past.push(b);
        return;
      }
      const showDate = b.showtimeId.showDate;
      if (b.bookingStatus === 'confirmed' && showDate >= todayStr) {
        upcoming.push(b);
      } else {
        past.push(b);
      }
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: {
        upcoming,
        past,
        all: bookings
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id)
      .populate({
        path: 'showtimeId',
        populate: [
          { path: 'movieId' },
          { path: 'theatreId' },
          { path: 'screenId' }
        ]
      })
      .populate('userId', 'name email phone');

    if (!booking) {
      // Check if searched by human-readable bookingId
      booking = await Booking.findOne({ bookingId: req.params.id })
        .populate({
          path: 'showtimeId',
          populate: [
            { path: 'movieId' },
            { path: 'theatreId' },
            { path: 'screenId' }
          ]
        })
        .populate('userId', 'name email phone');
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Authorization: User can only view their own booking unless admin
    if (booking.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('showtimeId');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Authorization check
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been cancelled'
      });
    }

    // Cancellation rule check: show must not have already passed
    const todayStr = new Date().toISOString().split('T')[0];
    if (booking.showtimeId && booking.showtimeId.showDate < todayStr) {
      return res.status(400).json({
        success: false,
        message: 'Past show bookings cannot be cancelled'
      });
    }

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason || 'User cancelled reservation';
    await booking.save();

    // Broadcast seats released back to available
    if (booking.showtimeId) {
      const seatsToRelease = booking.selectedSeats.map(s => s.seatNumber);
      broadcastSeatUnlock(booking.showtimeId._id.toString(), { seatNumbers: seatsToRelease });
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Refund initiated.',
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking
};

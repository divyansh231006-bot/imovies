const Showtime = require('../models/Showtime');
const Screen = require('../models/Screen');
const Booking = require('../models/Booking');
const SeatLock = require('../models/SeatLock');
const seatLockService = require('../services/seatLockService');
const jwt = require('jsonwebtoken');

// @desc    Get visual seat layout and status for a showtime
// @route   GET /api/showtimes/:id/seats
// @access  Public (optional token to identify current user's locks)
const getShowtimeSeats = async (req, res, next) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movieId', 'title duration rating poster')
      .populate('theatreId', 'name location city')
      .populate('screenId');

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found'
      });
    }

    // Determine current user ID if auth header exists
    let currentUserId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'imovies_super_secret_jwt_key_2026'
        );
        currentUserId = decoded.id;
      } catch (e) {
        // Token invalid/expired - continue as guest
      }
    }

    // Clean up expired locks first
    await seatLockService.cleanupExpiredLocks();

    // 1. Find all booked seats for this showtime in confirmed bookings
    const confirmedBookings = await Booking.find({
      showtimeId: showtime._id,
      bookingStatus: 'confirmed'
    });

    const bookedSeatNumbers = new Set();
    confirmedBookings.forEach(b => {
      b.selectedSeats.forEach(s => bookedSeatNumbers.add(s.seatNumber));
    });

    // 2. Find all actively locked seats
    const activeLocks = await SeatLock.find({
      showtimeId: showtime._id,
      expiresAt: { $gt: new Date() }
    });

    const lockedByOthers = new Set();
    const lockedByCurrentUser = new Set();

    activeLocks.forEach(lock => {
      const isMe = currentUserId && lock.userId.toString() === currentUserId.toString();
      lock.seatNumbers.forEach(num => {
        if (isMe) {
          lockedByCurrentUser.add(num);
        } else {
          lockedByOthers.add(num);
        }
      });
    });

    const screen = showtime.screenId;
    const pricing = showtime.seatPricing;

    // Generate full seat map matrix with rows, columns, status, and prices
    const rowsConfig = screen.rowsConfig && screen.rowsConfig.length > 0
      ? screen.rowsConfig
      : [
          { rowLetter: 'A', tier: 'Silver', seatsCount: 12, aisleAfter: [4, 8] },
          { rowLetter: 'B', tier: 'Silver', seatsCount: 12, aisleAfter: [4, 8] },
          { rowLetter: 'C', tier: 'Gold', seatsCount: 12, aisleAfter: [4, 8] },
          { rowLetter: 'D', tier: 'Gold', seatsCount: 12, aisleAfter: [4, 8] },
          { rowLetter: 'E', tier: 'Platinum', seatsCount: 12, aisleAfter: [4, 8] },
          { rowLetter: 'F', tier: 'VIP', seatsCount: 8, aisleAfter: [2, 6] }
        ];

    const seatMap = rowsConfig.map(row => {
      const seats = [];
      const tierPrice = pricing[row.tier] || 200;

      for (let i = 1; i <= row.seatsCount; i++) {
        const seatId = `${row.rowLetter}${i}`;
        let status = 'available';

        if (bookedSeatNumbers.has(seatId)) {
          status = 'booked';
        } else if (lockedByCurrentUser.has(seatId)) {
          status = 'selected';
        } else if (lockedByOthers.has(seatId)) {
          status = 'locked';
        }

        seats.push({
          seatNumber: seatId,
          number: i,
          row: row.rowLetter,
          tier: row.tier,
          price: tierPrice,
          status,
          hasAisleAfter: row.aisleAfter ? row.aisleAfter.includes(i) : false
        });
      }

      return {
        rowLetter: row.rowLetter,
        tier: row.tier,
        price: tierPrice,
        seats
      };
    });

    res.status(200).json({
      success: true,
      data: {
        showtimeId: showtime._id,
        movie: showtime.movieId,
        theatre: showtime.theatreId,
        screen: {
          id: screen._id,
          name: screen.screenName,
          type: screen.screenType,
          totalSeats: screen.totalSeats
        },
        showDate: showtime.showDate,
        startTime: showtime.startTime,
        pricing,
        seatMap,
        summary: {
          totalSeats: screen.totalSeats,
          availableSeats: screen.totalSeats - bookedSeatNumbers.size - lockedByOthers.size,
          bookedSeats: bookedSeatNumbers.size,
          userLockedSeats: Array.from(lockedByCurrentUser)
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Lock selected seats temporarily (max 8 seats, 5 min expiry)
// @route   POST /api/seats/lock
// @access  Private
const lockSeats = async (req, res, next) => {
  try {
    const { showtimeId, seatNumbers } = req.body;

    if (!showtimeId || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide showtimeId and an array of seat numbers'
      });
    }

    if (seatNumbers.length > 8) {
      return res.status(400).json({
        success: false,
        message: 'Maximum limit of 8 seats per booking exceeded.'
      });
    }

    const result = await seatLockService.lockSeats({
      showtimeId,
      seatNumbers,
      userId: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Seats locked temporarily for 5 minutes',
      data: result
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message
      });
    }
    next(err);
  }
};

// @desc    Unlock seats (user deselects or navigates away)
// @route   DELETE /api/seats/lock
// @access  Private
const unlockSeats = async (req, res, next) => {
  try {
    const { showtimeId, seatNumbers } = req.body;

    await seatLockService.releaseSeats({
      showtimeId,
      seatNumbers,
      userId: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Seats unlocked successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getShowtimeSeats,
  lockSeats,
  unlockSeats
};

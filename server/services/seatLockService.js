const SeatLock = require('../models/SeatLock');
const Booking = require('../models/Booking');
const { broadcastSeatLock, broadcastSeatUnlock } = require('../sockets/seatSocket');

const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes lock duration

/**
 * Lock seats for a given user and showtime
 */
const lockSeats = async ({ showtimeId, seatNumbers, userId }) => {
  // 1. Clean up any expired locks first
  await cleanupExpiredLocks();

  // 2. Check if any requested seat is already booked in confirmed bookings
  const confirmedBookings = await Booking.find({
    showtimeId,
    bookingStatus: 'confirmed',
    'selectedSeats.seatNumber': { $in: seatNumbers }
  });

  if (confirmedBookings.length > 0) {
    const bookedSeats = [];
    confirmedBookings.forEach(b => {
      b.selectedSeats.forEach(s => {
        if (seatNumbers.includes(s.seatNumber)) {
          bookedSeats.push(s.seatNumber);
        }
      });
    });
    const uniqueBooked = [...new Set(bookedSeats)];
    const error = new Error(`Seat(s) ${uniqueBooked.join(', ')} already booked!`);
    error.statusCode = 409;
    throw error;
  }

  // 3. Check if any requested seat is locked by ANOTHER user
  const activeLocks = await SeatLock.find({
    showtimeId,
    seatNumbers: { $in: seatNumbers },
    userId: { $ne: userId },
    expiresAt: { $gt: new Date() }
  });

  if (activeLocks.length > 0) {
    const lockedSeats = [];
    activeLocks.forEach(l => {
      l.seatNumbers.forEach(s => {
        if (seatNumbers.includes(s)) {
          lockedSeats.push(s);
        }
      });
    });
    const uniqueLocked = [...new Set(lockedSeats)];
    const error = new Error(`Seat(s) ${uniqueLocked.join(', ')} currently reserved by another customer.`);
    error.statusCode = 409;
    throw error;
  }

  // 4. Upsert / refresh lock for this user
  const expiresAt = new Date(Date.now() + LOCK_DURATION_MS);

  // Remove previous locks for this user in this showtime if any
  await SeatLock.deleteMany({ showtimeId, userId });

  // Create new lock
  const newLock = await SeatLock.create({
    showtimeId,
    seatNumbers,
    userId,
    expiresAt
  });

  // Broadcast lock event via Socket.IO
  broadcastSeatLock(showtimeId, { seatNumbers, userId, expiresAt });

  return {
    seatNumbers,
    expiresAt,
    lockId: newLock._id
  };
};

/**
 * Release seats explicitly locked by user
 */
const releaseSeats = async ({ showtimeId, seatNumbers, userId }) => {
  let query = { showtimeId };
  if (userId) query.userId = userId;
  if (seatNumbers && seatNumbers.length > 0) {
    query.seatNumbers = { $in: seatNumbers };
  }

  const existingLocks = await SeatLock.find(query);
  if (existingLocks.length > 0) {
    const seatsToUnlock = [];
    existingLocks.forEach(l => seatsToUnlock.push(...l.seatNumbers));
    await SeatLock.deleteMany(query);
    broadcastSeatUnlock(showtimeId, { seatNumbers: [...new Set(seatsToUnlock)] });
  }

  return true;
};

/**
 * Periodic cleanup of expired seat locks
 */
const cleanupExpiredLocks = async () => {
  try {
    const expiredLocks = await SeatLock.find({
      expiresAt: { $lte: new Date() }
    });

    if (expiredLocks.length > 0) {
      const showtimeMap = {};
      expiredLocks.forEach(lock => {
        const sid = lock.showtimeId.toString();
        if (!showtimeMap[sid]) showtimeMap[sid] = [];
        showtimeMap[sid].push(...lock.seatNumbers);
      });

      await SeatLock.deleteMany({
        _id: { $in: expiredLocks.map(l => l._id) }
      });

      // Broadcast unlock for each showtime room
      Object.keys(showtimeMap).forEach(sid => {
        broadcastSeatUnlock(sid, { seatNumbers: [...new Set(showtimeMap[sid])] });
      });
    }
  } catch (err) {
    console.error('[SeatLockService] Error during expired locks cleanup:', err);
  }
};

// Start periodic cleanup timer every 10 seconds
let cleanupInterval = null;
const startLockCleanupJob = () => {
  if (!cleanupInterval) {
    cleanupInterval = setInterval(cleanupExpiredLocks, 10000);
  }
};

module.exports = {
  LOCK_DURATION_MS,
  lockSeats,
  releaseSeats,
  cleanupExpiredLocks,
  startLockCleanupJob
};

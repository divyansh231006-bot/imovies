const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect); // All booking routes require authentication

router
  .route('/')
  .post(
    [
      body('showtimeId', 'Showtime ID is required').notEmpty(),
      body('selectedSeats', 'Selected seats are required').isArray({ min: 1, max: 8 })
    ],
    validate,
    createBooking
  );

router.get('/my-bookings', getMyBookings);

router.route('/:id').get(getBookingById);

router.patch('/:id/cancel', cancelBooking);

module.exports = router;

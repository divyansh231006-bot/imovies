const express = require('express');
const { body } = require('express-validator');
const { lockSeats, unlockSeats } = require('../controllers/seatController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post(
  '/lock',
  protect,
  [
    body('showtimeId', 'Showtime ID is required').notEmpty(),
    body('seatNumbers', 'Seat numbers array is required').isArray({ min: 1, max: 8 })
  ],
  validate,
  lockSeats
);

router.delete('/lock', protect, unlockSeats);

module.exports = router;

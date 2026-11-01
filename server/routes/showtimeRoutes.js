const express = require('express');
const { body } = require('express-validator');
const {
  getShowtimes,
  getShowtimeById,
  createShowtime,
  updateShowtime,
  deleteShowtime
} = require('../controllers/showtimeController');
const { getShowtimeSeats } = require('../controllers/seatController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router
  .route('/')
  .get(getShowtimes)
  .post(
    protect,
    adminOnly,
    [
      body('movieId', 'Movie ID is required').notEmpty(),
      body('theatreId', 'Theatre ID is required').notEmpty(),
      body('screenId', 'Screen ID is required').notEmpty(),
      body('showDate', 'Show date (YYYY-MM-DD) is required').notEmpty(),
      body('startTime', 'Start time is required').notEmpty()
    ],
    validate,
    createShowtime
  );

// Route to get seat map for a showtime
router.get('/:id/seats', getShowtimeSeats);

router
  .route('/:id')
  .get(getShowtimeById)
  .put(protect, adminOnly, updateShowtime)
  .delete(protect, adminOnly, deleteShowtime);

module.exports = router;

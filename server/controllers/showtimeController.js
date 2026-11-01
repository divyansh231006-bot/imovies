const Showtime = require('../models/Showtime');
const Screen = require('../models/Screen');

// @desc    Get showtimes with optional filters
// @route   GET /api/showtimes
// @access  Public
const getShowtimes = async (req, res, next) => {
  try {
    const { movieId, theatreId, showDate } = req.query;
    let query = { isActive: true };

    if (movieId) query.movieId = movieId;
    if (theatreId) query.theatreId = theatreId;
    if (showDate) {
      query.showDate = showDate;
    } else {
      // By default show today and future
      const today = new Date().toISOString().split('T')[0];
      query.showDate = { $gte: today };
    }

    const showtimes = await Showtime.find(query)
      .populate('movieId', 'title poster backdrop duration genre rating language')
      .populate('theatreId', 'name location city address amenities')
      .populate('screenId', 'screenName screenType totalSeats rowsConfig')
      .sort({ showDate: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: showtimes.length,
      data: showtimes
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single showtime by ID
// @route   GET /api/showtimes/:id
// @access  Public
const getShowtimeById = async (req, res, next) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movieId')
      .populate('theatreId')
      .populate('screenId');

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found'
      });
    }

    res.status(200).json({
      success: true,
      data: showtime
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new showtime (with overlap checking)
// @route   POST /api/showtimes
// @access  Private/Admin
const createShowtime = async (req, res, next) => {
  try {
    const { movieId, theatreId, screenId, showDate, startTime, endTime, seatPricing } = req.body;

    // Check if the screen already has a show at this exact date and start time
    const existing = await Showtime.findOne({
      screenId,
      showDate,
      startTime
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A show is already scheduled on this screen at this date and time.'
      });
    }

    const showtime = await Showtime.create({
      movieId,
      theatreId,
      screenId,
      showDate,
      startTime,
      endTime: endTime || '03 hours later',
      seatPricing: seatPricing || {
        Silver: 180,
        Gold: 260,
        Platinum: 380,
        VIP: 550
      }
    });

    const populated = await Showtime.findById(showtime._id)
      .populate('movieId', 'title')
      .populate('theatreId', 'name')
      .populate('screenId', 'screenName');

    res.status(201).json({
      success: true,
      message: 'Showtime created successfully',
      data: populated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update showtime
// @route   PUT /api/showtimes/:id
// @access  Private/Admin
const updateShowtime = async (req, res, next) => {
  try {
    let showtime = await Showtime.findById(req.params.id);
    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found'
      });
    }

    showtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Showtime updated successfully',
      data: showtime
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete showtime
// @route   DELETE /api/showtimes/:id
// @access  Private/Admin
const deleteShowtime = async (req, res, next) => {
  try {
    const showtime = await Showtime.findById(req.params.id);
    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found'
      });
    }

    await Showtime.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Showtime deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getShowtimes,
  getShowtimeById,
  createShowtime,
  updateShowtime,
  deleteShowtime
};

const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');

// @desc    Get Admin Dashboard metrics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMovies = await Movie.countDocuments();
    const totalTheatres = await Theatre.countDocuments();
    const totalBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });

    // Aggregate total revenue
    const revenueAgg = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed', paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingShows = await Showtime.countDocuments({
      isActive: true,
      showDate: { $gte: todayStr }
    });

    // Recent 8 bookings
    const recentBookings = await Booking.find()
      .populate('userId', 'name email phone')
      .populate({
        path: 'showtimeId',
        populate: [
          { path: 'movieId', select: 'title poster' },
          { path: 'theatreId', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(8);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalMovies,
        totalTheatres,
        totalBookings,
        totalRevenue,
        upcomingShows,
        recentBookings
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all bookings with filters & pagination
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = async (req, res, next) => {
  try {
    const { search, status, paymentStatus } = req.query;

    let query = {};
    if (status) query.bookingStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (search) {
      query.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { paymentReference: { $regex: search, $options: 'i' } }
      ];
    }

    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone')
      .populate({
        path: 'showtimeId',
        populate: [
          { path: 'movieId', select: 'title poster duration' },
          { path: 'theatreId', select: 'name location city' },
          { path: 'screenId', select: 'screenName screenType' }
        ]
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Revenue Reports
// @route   GET /api/admin/revenue
// @access  Private/Admin
const getRevenueReport = async (req, res, next) => {
  try {
    const movieRevenue = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed', paymentStatus: 'paid' } },
      {
        $lookup: {
          from: 'showtimes',
          localField: 'showtimeId',
          foreignField: '_id',
          as: 'showtime'
        }
      },
      { $unwind: '$showtime' },
      {
        $lookup: {
          from: 'movies',
          localField: 'showtime.movieId',
          foreignField: '_id',
          as: 'movie'
        }
      },
      { $unwind: '$movie' },
      {
        $group: {
          _id: '$movie._id',
          title: { $first: '$movie.title' },
          poster: { $first: '$movie.poster' },
          bookingsCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        movieRevenue
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getAllBookings,
  getAllUsers,
  getRevenueReport
};

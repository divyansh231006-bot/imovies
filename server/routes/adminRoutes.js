const express = require('express');
const {
  getDashboardStats,
  getAllBookings,
  getAllUsers,
  getRevenueReport
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/bookings', getAllBookings);
router.get('/users', getAllUsers);
router.get('/revenue', getRevenueReport);

module.exports = router;

const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

// Register route
router.post(
  '/register',
  [
    body('name', 'Full name is required').trim().notEmpty(),
    body('email', 'Please provide a valid email').isEmail().normalizeEmail(),
    body('phone', 'Please provide a valid phone number').trim().notEmpty(),
    body('password', 'Password must be at least 6 characters long').isLength({ min: 6 })
  ],
  validate,
  register
);

// Login route
router.post(
  '/login',
  [
    body('email', 'Please provide a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').notEmpty()
  ],
  validate,
  login
);

// Current user profile
router.get('/me', protect, getMe);

// Forgot & Reset Password
router.post(
  '/forgot-password',
  [body('email', 'Please provide a valid email').isEmail().normalizeEmail()],
  validate,
  forgotPassword
);

router.post(
  '/reset-password',
  [
    body('token', 'Reset token is required').notEmpty(),
    body('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
  ],
  validate,
  resetPassword
);

module.exports = router;

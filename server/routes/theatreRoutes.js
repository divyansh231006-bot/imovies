const express = require('express');
const { body } = require('express-validator');
const {
  getTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre
} = require('../controllers/theatreController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router
  .route('/')
  .get(getTheatres)
  .post(
    protect,
    adminOnly,
    [
      body('name', 'Theatre name is required').trim().notEmpty(),
      body('location', 'Location is required').trim().notEmpty(),
      body('address', 'Address is required').trim().notEmpty()
    ],
    validate,
    createTheatre
  );

router
  .route('/:id')
  .get(getTheatreById)
  .put(protect, adminOnly, updateTheatre)
  .delete(protect, adminOnly, deleteTheatre);

module.exports = router;

const express = require('express');
const { body } = require('express-validator');
const {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
} = require('../controllers/movieController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router
  .route('/')
  .get(getMovies)
  .post(
    protect,
    adminOnly,
    [
      body('title', 'Movie title is required').trim().notEmpty(),
      body('description', 'Movie description is required').trim().notEmpty(),
      body('poster', 'Poster image URL is required').trim().notEmpty(),
      body('backdrop', 'Backdrop image URL is required').trim().notEmpty(),
      body('duration', 'Duration must be a positive number').isNumeric()
    ],
    validate,
    createMovie
  );

router
  .route('/:id')
  .get(getMovieById)
  .put(protect, adminOnly, updateMovie)
  .delete(protect, adminOnly, deleteMovie);

module.exports = router;

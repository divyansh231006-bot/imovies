const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');

// @desc    Get all movies with filters & search
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res, next) => {
  try {
    const { search, genre, language, status, sort, minRating } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (genre && genre !== 'All') {
      query.genre = { $in: [new RegExp(genre, 'i')] };
    }

    if (language && language !== 'All') {
      query.language = { $in: [new RegExp(language, 'i')] };
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { cast: { $regex: search, $options: 'i' } },
        { director: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { releaseDate: -1 };
    if (sort === 'rating') {
      sortOption = { rating: -1 };
    } else if (sort === 'title') {
      sortOption = { title: 1 };
    } else if (sort === 'oldest') {
      sortOption = { releaseDate: 1 };
    }

    const movies = await Movie.find(query).sort(sortOption);

    // Extract unique genres and languages for filter dropdowns
    const allMovies = await Movie.find({});
    const genresSet = new Set();
    const languagesSet = new Set();
    allMovies.forEach(m => {
      m.genre.forEach(g => genresSet.add(g));
      m.language.forEach(l => languagesSet.add(l));
    });

    res.status(200).json({
      success: true,
      count: movies.length,
      availableGenres: Array.from(genresSet),
      availableLanguages: Array.from(languagesSet),
      data: movies
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single movie by ID with showtimes
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Get today's and upcoming showtimes for this movie
    const today = new Date().toISOString().split('T')[0];
    const showtimes = await Showtime.find({
      movieId: movie._id,
      isActive: true,
      showDate: { $gte: today }
    })
      .populate('theatreId', 'name location city address amenities')
      .populate('screenId', 'screenName screenType totalSeats')
      .sort({ showDate: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      data: {
        ...movie.toObject(),
        showtimes
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new movie
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Movie added successfully',
      data: movie
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res, next) => {
  try {
    let movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      data: movie
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    await Movie.findByIdAndDelete(req.params.id);
    // Also remove associated showtimes
    await Showtime.deleteMany({ movieId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Movie and associated showtimes removed successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
};

const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const Showtime = require('../models/Showtime');

// @desc    Get all theatres
// @route   GET /api/theatres
// @access  Public
const getTheatres = async (req, res, next) => {
  try {
    const theatres = await Theatre.find().sort({ name: 1 });
    const theatresWithScreens = await Promise.all(
      theatres.map(async (theatre) => {
        const screens = await Screen.find({ theatreId: theatre._id });
        return {
          ...theatre.toObject(),
          screens
        };
      })
    );

    res.status(200).json({
      success: true,
      count: theatresWithScreens.length,
      data: theatresWithScreens
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single theatre by ID
// @route   GET /api/theatres/:id
// @access  Public
const getTheatreById = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found'
      });
    }

    const screens = await Screen.find({ theatreId: theatre._id });
    const today = new Date().toISOString().split('T')[0];
    const showtimes = await Showtime.find({
      theatreId: theatre._id,
      isActive: true,
      showDate: { $gte: today }
    })
      .populate('movieId', 'title poster genre duration rating')
      .populate('screenId', 'screenName screenType');

    res.status(200).json({
      success: true,
      data: {
        ...theatre.toObject(),
        screens,
        showtimes
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new theatre
// @route   POST /api/theatres
// @access  Private/Admin
const createTheatre = async (req, res, next) => {
  try {
    const { name, location, city, address, phone, amenities, screens } = req.body;

    const theatre = await Theatre.create({
      name,
      location,
      city: city || 'Mumbai',
      address,
      phone,
      amenities
    });

    // If screens were provided, create them
    if (screens && Array.isArray(screens) && screens.length > 0) {
      for (const sc of screens) {
        await Screen.create({
          theatreId: theatre._id,
          screenName: sc.screenName || 'Audi 1',
          screenType: sc.screenType || 'Dolby Atmos',
          totalSeats: sc.totalSeats || 80,
          rowsConfig: sc.rowsConfig || [
            { rowLetter: 'A', tier: 'Silver', seatsCount: 12, aisleAfter: [4, 8] },
            { rowLetter: 'B', tier: 'Silver', seatsCount: 12, aisleAfter: [4, 8] },
            { rowLetter: 'C', tier: 'Gold', seatsCount: 12, aisleAfter: [4, 8] },
            { rowLetter: 'D', tier: 'Gold', seatsCount: 12, aisleAfter: [4, 8] },
            { rowLetter: 'E', tier: 'Platinum', seatsCount: 12, aisleAfter: [4, 8] },
            { rowLetter: 'F', tier: 'VIP', seatsCount: 8, aisleAfter: [2, 6] }
          ]
        });
      }
    } else {
      // Default screen
      await Screen.create({
        theatreId: theatre._id,
        screenName: 'Screen 1 - Atmos',
        screenType: 'Dolby Atmos',
        totalSeats: 68,
        rowsConfig: [
          { rowLetter: 'A', tier: 'Silver', seatsCount: 12, aisleAfter: [4, 8] },
          { rowLetter: 'B', tier: 'Silver', seatsCount: 12, aisleAfter: [4, 8] },
          { rowLetter: 'C', tier: 'Gold', seatsCount: 12, aisleAfter: [4, 8] },
          { rowLetter: 'D', tier: 'Gold', seatsCount: 12, aisleAfter: [4, 8] },
          { rowLetter: 'E', tier: 'Platinum', seatsCount: 12, aisleAfter: [4, 8] },
          { rowLetter: 'F', tier: 'VIP', seatsCount: 8, aisleAfter: [2, 6] }
        ]
      });
    }

    const createdScreens = await Screen.find({ theatreId: theatre._id });

    res.status(201).json({
      success: true,
      message: 'Theatre created successfully',
      data: {
        ...theatre.toObject(),
        screens: createdScreens
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update theatre
// @route   PUT /api/theatres/:id
// @access  Private/Admin
const updateTheatre = async (req, res, next) => {
  try {
    let theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found'
      });
    }

    theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Theatre updated successfully',
      data: theatre
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete theatre
// @route   DELETE /api/theatres/:id
// @access  Private/Admin
const deleteTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found'
      });
    }

    await Theatre.findByIdAndDelete(req.params.id);
    await Screen.deleteMany({ theatreId: req.params.id });
    await Showtime.deleteMany({ theatreId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Theatre and associated screens and showtimes deleted'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre
};

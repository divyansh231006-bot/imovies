const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide movie title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide movie description'],
      trim: true
    },
    poster: {
      type: String,
      required: [true, 'Please provide poster image URL'],
      trim: true
    },
    backdrop: {
      type: String,
      required: [true, 'Please provide backdrop image URL'],
      trim: true
    },
    genre: {
      type: [String],
      required: [true, 'Please specify at least one genre']
    },
    language: {
      type: [String],
      required: [true, 'Please specify at least one language']
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Please provide movie duration in minutes']
    },
    releaseDate: {
      type: Date,
      required: [true, 'Please provide release date']
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 8.0
    },
    cast: {
      type: [String],
      default: []
    },
    director: {
      type: String,
      trim: true,
      default: 'Unknown'
    },
    trailerUrl: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon'],
      default: 'now_showing'
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast searching and filtering
movieSchema.index({ title: 'text', description: 'text' }, { language_override: 'dummy_lang' });
movieSchema.index({ status: 1, releaseDate: -1 });

module.exports = mongoose.model('Movie', movieSchema);

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const theatreRoutes = require('./routes/theatreRoutes');
const showtimeRoutes = require('./routes/showtimeRoutes');
const seatRoutes = require('./routes/seatRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS configuration
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, 'http://localhost:5173']
  : '*';

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
  })
);

// Logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'iMovies API Server',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theatres', theatreRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Serve frontend in production — Express serves the React build
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, 'public');
  const clientBuildPath = fs.existsSync(path.join(publicPath, 'index.html'))
    ? publicPath
    : path.join(__dirname, '../client/dist');

  app.use(express.static(clientBuildPath));

  // Any route that is NOT an /api route serves the React SPA
  app.get(/^(?!\/api).*/, (req, res) => {
    const indexPath = path.join(clientBuildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>iMovies - Online Movie Booking</title></head>
        <body style="font-family:sans-serif; background:#0b0f19; color:#fff; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
          <div style="text-align:center;">
            <h1 style="color:#ef4444;">🎬 iMovies API is Live!</h1>
            <p>Connected to MongoDB Atlas with real-time seat availability.</p>
            <p><a href="/api/movies" style="color:#60a5fa;">Browse Movies API</a> | <a href="/api/health" style="color:#60a5fa;">Health Check</a></p>
          </div>
        </body>
        </html>
      `);
    }
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;

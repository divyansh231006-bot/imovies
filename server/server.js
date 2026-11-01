const http = require('http');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

const app = require('./app');
const { connectDB } = require('./config/db');
const { initSocket } = require('./sockets/seatSocket');
const { startLockCleanupJob } = require('./services/seatLockService');
const Movie = require('./models/Movie');
const seedData = require('./seed/seeder');

const PORT = process.env.PORT || 5000;

// Create HTTP Server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Initialize socket events
initSocket(io);

// Start server
const startServer = async () => {
  try {
    // 1. Connect to MongoDB (or memory fallback)
    await connectDB();

    // 2. Auto-seed if database has no movies yet
    const movieCount = await Movie.countDocuments();
    if (movieCount === 0) {
      console.log('[Server] Database is empty. Auto-seeding initial movies and theatres...');
      try {
        await seedData();
      } catch (seedErr) {
        console.warn('[Server] Auto-seed warning:', seedErr.message);
      }
    }

    // 3. Start background job to release expired seat locks
    startLockCleanupJob();

    // 4. Start listening
    server.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🎬 iMovies Backend API Server running on port ${PORT}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📡 Socket.IO Real-time Engine initialized`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('[Server] Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

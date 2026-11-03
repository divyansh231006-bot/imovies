const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies';
  const isProduction = process.env.NODE_ENV === 'production';

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: isProduction ? 10000 : 3000
    });
    console.log(`[Database] MongoDB connected successfully.`);
  } catch (err) {
    if (isProduction) {
      // In production, we MUST have a real MongoDB — do not fall back
      console.error('[Database] FATAL: Could not connect to MongoDB Atlas:', err.message);
      process.exit(1);
    }

    // Development fallback: embedded in-memory MongoDB
    console.warn(`[Database] Could not connect to ${uri}. Launching embedded MongoDB...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const dbPath = path.join(__dirname, '../data/db');
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }

      mongod = await MongoMemoryServer.create({
        instance: {
          dbName: 'imovies',
          dbPath: dbPath,
          storageEngine: 'wiredTiger'
        }
      });
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Embedded persistent MongoDB connected at: ${memoryUri}`);
    } catch (memErr) {
      console.warn('[Database] Retrying with pure in-memory instance...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create({
        instance: { dbName: 'imovies' }
      });
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Pure in-memory MongoDB connected at: ${memoryUri}`);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    console.log('[Database] MongoDB disconnected cleanly.');
  } catch (error) {
    console.error('[Database] Disconnect error:', error);
  }
};

module.exports = { connectDB, disconnectDB };

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies';

  try {
    // Attempt connecting to the configured URI with a 2-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[Database] MongoDB connected successfully to: ${uri}`);
  } catch (err) {
    console.warn(`[Database] Could not connect to external MongoDB at ${uri}. Launching embedded MongoDB...`);
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
      console.log(`[Database] Embedded persistent MongoDB connected successfully at: ${memoryUri}`);
    } catch (memErr) {
      // If wiredTiger dbPath fails, fall back to pure in-memory
      console.warn('[Database] Retrying with pure in-memory instance...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create({
        instance: { dbName: 'imovies' }
      });
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Pure in-memory MongoDB connected successfully at: ${memoryUri}`);
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

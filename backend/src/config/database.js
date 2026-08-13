const mongoose = require('mongoose');

class Database {
  constructor() {
    this.connection = null;
    this.memoryServer = null;
    this.usingMemory = false;
  }

  async connect(uri = process.env.MONGO_URI) {
    if (this.connection) return this.connection;

    mongoose.set('strictQuery', true);

    const preferred = uri || 'mongodb://localhost:27017/lms';

    try {
      this.connection = await mongoose.connect(preferred, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 20,
      });
    } catch (err) {
      if (process.env.ALLOW_MEMORY_MONGO === 'false') {
        throw err;
      }

      console.warn(`[DB] Could not connect to ${preferred}`);
      console.warn(`[DB] ${err.message}`);
      console.warn('[DB] Falling back to in-memory MongoDB (mongodb-memory-server)…');

      const { MongoMemoryServer } = require('mongodb-memory-server');
      this.memoryServer = await MongoMemoryServer.create();
      const memUri = this.memoryServer.getUri('lms');
      this.usingMemory = true;

      this.connection = await mongoose.connect(memUri, {
        serverSelectionTimeoutMS: 8000,
        maxPoolSize: 20,
      });

      console.log('[DB] In-memory MongoDB ready (data is ephemeral)');
    }

    mongoose.connection.on('error', (e) => {
      console.error('[DB] MongoDB error:', e.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[DB] MongoDB disconnected');
    });

    console.log(
      `[DB] Connected → ${mongoose.connection.host}/${mongoose.connection.name}${
        this.usingMemory ? ' (memory)' : ''
      }`
    );
    return this.connection;
  }

  async disconnect() {
    if (!this.connection) return;
    await mongoose.disconnect();
    this.connection = null;
    if (this.memoryServer) {
      await this.memoryServer.stop();
      this.memoryServer = null;
    }
    console.log('[DB] Disconnected');
  }
}

module.exports = new Database();

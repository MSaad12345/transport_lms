require('dotenv').config();
const App = require('./app');
const database = require('./config/database');
const ensureSeed = require('./utils/ensureSeed');

class Server {
  constructor() {
    this.port = Number(process.env.PORT || 5000);
    this.app = new App().instance;
    this.server = null;
  }

  async start() {
    try {
      await database.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms');
      await ensureSeed();

      this.server = this.app.listen(this.port, () => {
        console.log(`[SERVER] LMS API listening on http://localhost:${this.port}`);
        console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
      });

      const shutdown = async (signal) => {
        console.log(`[SERVER] ${signal} received — shutting down`);
        if (this.server) {
          this.server.close(async () => {
            await database.disconnect();
            process.exit(0);
          });
        }
      };

      process.on('SIGINT', () => shutdown('SIGINT'));
      process.on('SIGTERM', () => shutdown('SIGTERM'));
    } catch (err) {
      console.error('[SERVER] Failed to start:', err.message);
      console.error(
        '[SERVER] Ensure MongoDB is running at MONGO_URI=',
        process.env.MONGO_URI || 'mongodb://localhost:27017/lms'
      );
      process.exit(1);
    }
  }
}

new Server().start();

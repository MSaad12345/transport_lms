const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

class App {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()) || '*',
        credentials: true,
      })
    );
    this.app.use(express.json({ limit: '1mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

    this.app.use(
      '/api',
      rateLimit({
        windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
        max: Number(process.env.RATE_LIMIT_MAX || 500),
        standardHeaders: true,
        legacyHeaders: false,
      })
    );
  }

  setupRoutes() {
    this.app.get('/', (req, res) => {
      res.json({
        name: 'Logistics Management System API',
        version: '1.0.0',
        docs: '/api/health',
      });
    });
    this.app.use('/api', routes);
  }

  setupErrorHandling() {
    this.app.use((req, res, next) => {
      next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
    });
    this.app.use(errorHandler);
  }

  get instance() {
    return this.app;
  }
}

module.exports = App;

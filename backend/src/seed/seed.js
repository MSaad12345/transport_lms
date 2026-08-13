require('dotenv').config();
const mongoose = require('mongoose');
const database = require('../config/database');
const runSeed = require('./runSeed');

const reset = process.argv.includes('--reset');

runSeed({ reset, connect: true })
  .then(async () => {
    await database.disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('[SEED] Failed:', err);
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  });

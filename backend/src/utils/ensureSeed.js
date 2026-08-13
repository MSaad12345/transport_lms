const User = require('../models/User');
const runSeed = require('../seed/runSeed');

/**
 * If the database has no users, run the full seed once.
 * Critical for mongodb-memory-server (ephemeral) demos.
 */
async function ensureSeed() {
  const count = await User.countDocuments();
  if (count > 0) return false;

  console.log('[BOOT] Empty database detected — running seed…');
  await runSeed({ connect: false, reset: false });
  return true;
}

module.exports = ensureSeed;

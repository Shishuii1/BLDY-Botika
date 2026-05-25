import { ensureSchema } from './ensureSchema.js';
import { runMigrations } from './migrate.js';
import { ensureDefaultAdmin } from '../services/auth.service.js';
import { logger } from '../utils/logger.js';

let ready = false;
let setupPromise = null;

export async function setupDatabase() {
  if (ready) return;
  if (setupPromise) return setupPromise;

  setupPromise = (async () => {
    try {
      await ensureSchema();
      await runMigrations();
      await ensureDefaultAdmin();
      ready = true;
      logger.info('Database ready for API requests');
    } catch (err) {
      setupPromise = null;
      throw err;
    }
  })();

  return setupPromise;
}

export async function dbReadyMiddleware(req, res, next) {
  try {
    await setupDatabase();
    next();
  } catch (err) {
    logger.error('Database setup failed:', err.message);
    res.status(503).json({
      success: false,
      message: `Database setup failed: ${err.message}. Check MySQL is running and backend/.env settings, then restart the API.`,
    });
  }
}

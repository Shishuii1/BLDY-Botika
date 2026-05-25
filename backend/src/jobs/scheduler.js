import cron from 'node-cron';
import { checkLowStock } from './lowStockChecker.js';
import { checkExpiration } from './expirationChecker.js';

export function startScheduledJobs(app) {
  cron.schedule('0 8 * * *', () => checkLowStock(app));
  cron.schedule('0 9 * * *', () => checkExpiration(app));
}

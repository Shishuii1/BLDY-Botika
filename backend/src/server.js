import http from 'http';
import './config/env.js';
import createApp from './app.js';
import { env } from './config/env.js';
import { initSocket } from './config/socket.js';
import { startScheduledJobs } from './jobs/scheduler.js';
import { setupDatabase } from './config/dbReady.js';
import { logger } from './utils/logger.js';

const app = createApp();
const server = http.createServer(app);
initSocket(server, app);

async function bootstrap() {
  try {
    await setupDatabase();
    startScheduledJobs(app);
  } catch (err) {
    logger.error('Bootstrap / database setup failed:', err.message);
    console.error('\n[PharmaSys] DATABASE SETUP FAILED:', err.message);
    console.error('Fix: start MySQL, set backend/.env (DB_USER, DB_PASSWORD, DB_NAME), then:');
    console.error('  cd backend && npm run db:setup\n');
  }

  server.listen(env.port, () => {
    logger.info(`PharmaSys API running on http://localhost:${env.port}`);
    logger.info(`Health: http://localhost:${env.port}/api/health`);
  });
}

bootstrap();

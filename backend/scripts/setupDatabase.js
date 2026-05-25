/**
 * One-time database setup: creates all tables + sample data
 * Run: node scripts/setupDatabase.js
 */
import '../src/config/env.js';
import { setupDatabase } from '../src/config/dbReady.js';

async function main() {
  console.log('Setting up pharmasys database...');
  await setupDatabase();
  console.log('Done! Login: admin@pharmasys.com / Admin@123');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

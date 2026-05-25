import '../src/config/env.js';
import { setupDatabase } from '../src/config/dbReady.js';
import { query, queryOne } from '../src/config/db.js';
import * as medicineService from '../src/services/medicine.service.js';
import * as inventoryService from '../src/services/inventory.service.js';
import * as notificationService from '../src/services/notification.service.js';

async function main() {
  await setupDatabase();
  const auth = await import('../src/services/auth.service.js');
  const { query: dbQuery } = await import('../src/config/db.js');

  const tests = [
    ['medicines list', () => medicineService.listMedicines({ page: 1, limit: 10 })],
    ['categories', () => medicineService.listCategories()],
    ['inventory summary', () => inventoryService.getInventorySummary()],
    ['low stock', () => inventoryService.getLowStock()],
    ['notifications', () => notificationService.listForUser(1, true)],
    ['sales count', () => queryOne('SELECT COUNT(*) as total FROM sales')],
    ['auth roles', () => dbQuery('SELECT role_id, role_name, description FROM roles')],
    ['auth users', () => auth.listUsers()],
  ];
  for (const [name, fn] of tests) {
    try {
      await fn();
      console.log('OK', name);
    } catch (e) {
      console.error('FAIL', name, e.message);
    }
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

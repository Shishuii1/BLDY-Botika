import pool from './db.js';
import { logger } from '../utils/logger.js';
import { ensureSchema } from './ensureSchema.js';

/** Add columns missing from older DB installs (tables must exist first) */
export async function runMigrations() {
  await ensureSchema();

  const alters = [
    'ALTER TABLE roles ADD COLUMN description VARCHAR(255) NULL',
    'ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'ALTER TABLE users ADD COLUMN is_active TINYINT(1) DEFAULT 1',
    'ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) NULL',
    'ALTER TABLE users ADD COLUMN last_login DATETIME NULL',
    'ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL',
    'ALTER TABLE users ADD COLUMN reset_token_expires DATETIME NULL',
    'ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'ALTER TABLE medicines ADD COLUMN reorder_level INT DEFAULT 10',
    'ALTER TABLE medicines ADD COLUMN is_archived TINYINT(1) DEFAULT 0',
    'ALTER TABLE medicines ADD COLUMN image_url VARCHAR(500) NULL',
    'ALTER TABLE medicines ADD COLUMN branch_id INT DEFAULT 1',
    'ALTER TABLE customers ADD COLUMN loyalty_points INT DEFAULT 0',
    'ALTER TABLE customers ADD COLUMN senior_citizen TINYINT(1) DEFAULT 0',
    'ALTER TABLE customers ADD COLUMN pwd TINYINT(1) DEFAULT 0',
  ];

  for (const sql of alters) {
    try {
      await pool.execute(sql);
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') continue;
      if (err.code === 'ER_NO_SUCH_TABLE') {
        logger.warn('Migration skipped (table missing):', err.message);
        continue;
      }
      logger.warn('Migration:', err.message);
    }
  }

  await syncRoles();
}

/** Ensure PharmaSys role names exist (handles older DBs that used admin/staff) */
async function syncRoles() {
  const required = [
    ['super_admin', 'Full system access'],
    ['pharmacist', 'Medicine and prescription management'],
    ['cashier', 'POS and customer transactions'],
    ['inventory_staff', 'Stock and supplier management'],
  ];

  for (const [roleName, description] of required) {
    try {
      const existing = await pool.execute('SELECT role_id FROM roles WHERE role_name = ?', [roleName]);
      if (existing[0].length > 0) continue;
      await pool.execute('INSERT INTO roles (role_name, description) VALUES (?, ?)', [roleName, description]);
      logger.info(`Added role: ${roleName}`);
    } catch (err) {
      try {
        await pool.execute('INSERT INTO roles (role_name) VALUES (?)', [roleName]);
      } catch {
        logger.warn(`syncRoles ${roleName}:`, err.message);
      }
    }
  }

  // Map legacy admin account to super_admin role when applicable
  try {
    const [adminRole] = await pool.execute('SELECT role_id FROM roles WHERE role_name = \'admin\' LIMIT 1');
    const [superRole] = await pool.execute('SELECT role_id FROM roles WHERE role_name = \'super_admin\' LIMIT 1');
    if (adminRole[0]?.role_id && superRole[0]?.role_id) {
      await pool.execute(
        'UPDATE users SET role_id = ? WHERE email = \'admin@pharmasys.com\' AND role_id = ?',
        [superRole[0].role_id, adminRole[0].role_id]
      );
    }
  } catch {
    /* optional */
  }
}

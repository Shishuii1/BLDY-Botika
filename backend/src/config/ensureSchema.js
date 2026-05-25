import pool from './db.js';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const DB_NAME = env.db.database.replace(/[^a-zA-Z0-9_]/g, '') || 'pharmasys';

/**
 * Order matters: create tables that have NO FK dependencies on later tables first.
 * Previously `users` ran before `suppliers`; if `users` failed, `suppliers` was never created.
 */
const CREATE_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS branches (
    branch_id INT PRIMARY KEY AUTO_INCREMENT,
    branch_name VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(30),
    email VARCHAR(100),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id INT PRIMARY KEY AUTO_INCREMENT,
    company_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(30),
    address TEXT,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT,
    role_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    avatar_url VARCHAR(500),
    is_active TINYINT(1) DEFAULT 1,
    last_login DATETIME NULL,
    reset_token VARCHAR(255) NULL,
    reset_token_expires DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS medicines (
    medicine_id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT DEFAULT 1,
    barcode VARCHAR(50) UNIQUE,
    medicine_name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    brand_name VARCHAR(200),
    category_id INT,
    dosage VARCHAR(100),
    description TEXT,
    supplier_id INT,
    quantity INT NOT NULL DEFAULT 0,
    reorder_level INT DEFAULT 10,
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    selling_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    expiration_date DATE,
    batch_number VARCHAR(50),
    prescription_required TINYINT(1) DEFAULT 0,
    image_url VARCHAR(500),
    is_archived TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE SET NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(30),
    address TEXT,
    loyalty_points INT DEFAULT 0,
    senior_citizen TINYINT(1) DEFAULT 0,
    pwd TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS inventory_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    medicine_id INT NOT NULL,
    user_id INT,
    branch_id INT,
    action_type ENUM('stock_in','stock_out','sale','return','adjustment','damaged','expired') NOT NULL,
    quantity_change INT NOT NULL,
    quantity_before INT NOT NULL,
    quantity_after INT NOT NULL,
    batch_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sales (
    sale_id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    branch_id INT,
    user_id INT NOT NULL,
    customer_id INT,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    vat_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount_type ENUM('none','senior','pwd','promo','manual') DEFAULT 'none',
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    change_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    payment_method ENUM('cash','card','gcash') NOT NULL DEFAULT 'cash',
    status ENUM('completed','voided','refunded') DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sale_items (
    sale_item_id INT PRIMARY KEY AUTO_INCREMENT,
    sale_id INT NOT NULL,
    medicine_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE RESTRICT
  )`,
  `CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    medicine_id INT,
    doctor_name VARCHAR(100),
    prescription_date DATE,
    notes TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS discounts (
    discount_id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    discount_type ENUM('percentage','fixed') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    valid_from DATE,
    valid_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    sale_id INT NOT NULL,
    payment_method ENUM('cash','card','gcash') NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    reference_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS returns (
    return_id INT PRIMARY KEY AUTO_INCREMENT,
    sale_id INT NOT NULL,
    user_id INT NOT NULL,
    reason TEXT,
    refund_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status ENUM('pending','approved','rejected') DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT
  )`,
  `CREATE TABLE IF NOT EXISTS return_items (
    return_item_id INT PRIMARY KEY AUTO_INCREMENT,
    return_id INT NOT NULL,
    medicine_id INT NOT NULL,
    quantity INT NOT NULL,
    refund_amount DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (return_id) REFERENCES returns(return_id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE RESTRICT
  )`,
  `CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    branch_id INT,
    type ENUM('low_stock','expiring','sale','system','inventory') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
  )`,
];

async function tableExists(table) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) as c FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = ?`,
    [table]
  );
  return Number(rows[0].c) > 0;
}

async function tableEmpty(table) {
  if (!(await tableExists(table))) return true;
  const [rows] = await pool.execute(`SELECT COUNT(*) as c FROM \`${table}\``);
  return Number(rows[0].c) === 0;
}

async function seedIfEmpty() {
  if (await tableEmpty('roles')) {
    await pool.execute(
      `INSERT INTO roles (role_name, description) VALUES
       ('super_admin', 'Full system access'),
       ('pharmacist', 'Medicine and prescription management'),
       ('cashier', 'POS and customer transactions'),
       ('inventory_staff', 'Stock and supplier management')`
    );
    logger.info('Seeded roles');
  }

  if (await tableEmpty('branches')) {
    await pool.execute(
      `INSERT INTO branches (branch_name, address, phone, email) VALUES
       ('Main Branch', '123 Pharmacy Street, Manila', '+639171234567', 'main@pharmasys.local')`
    );
    logger.info('Seeded branches');
  }

  if (await tableEmpty('categories')) {
    await pool.execute(
      `INSERT INTO categories (name, description) VALUES
       ('Analgesics', 'Pain relief'),
       ('Antibiotics', 'Antibacterial'),
       ('Vitamins', 'Supplements'),
       ('Cardiovascular', 'Heart and BP'),
       ('Dermatology', 'Skin'),
       ('OTC', 'General OTC')`
    );
    logger.info('Seeded categories');
  }

  if (await tableEmpty('suppliers')) {
    await pool.execute(
      `INSERT INTO suppliers (company_name, contact_person, email, phone, address) VALUES
       ('MedSupply PH', 'Roberto Cruz', 'sales@medsupply.ph', '+6328123456', 'Manila'),
       ('PharmaCore Inc', 'Lisa Tan', 'orders@pharmacore.ph', '+6328987654', 'Laguna'),
       ('HealthFirst Distributors', 'Mark Lim', 'info@healthfirst.ph', '+6328111222', 'Cebu')`
    );
    logger.info('Seeded suppliers');
  }

  if (await tableEmpty('customers')) {
    await pool.execute(
      `INSERT INTO customers (full_name, email, phone, loyalty_points, senior_citizen, pwd) VALUES
       ('Walk-in Customer', NULL, NULL, 0, 0, 0),
       ('Pedro Garcia', 'pedro@email.com', '+639171111111', 120, 1, 0)`
    );
    logger.info('Seeded customers');
  }

  if (await tableEmpty('medicines')) {
    await pool.execute(
      `INSERT INTO medicines (branch_id, barcode, medicine_name, generic_name, brand_name, category_id, dosage, supplier_id, quantity, reorder_level, unit_price, selling_price, expiration_date, batch_number, prescription_required) VALUES
       (1, '8901234567890', 'Paracetamol 500mg', 'Paracetamol', 'Biogesic', 1, '500mg', 1, 500, 50, 2.50, 5.00, '2027-06-30', 'BATCH-001', 0),
       (1, '8901234567891', 'Amoxicillin 500mg', 'Amoxicillin', 'Amoxil', 2, '500mg', 2, 200, 30, 8.00, 15.00, '2026-12-31', 'BATCH-002', 1),
       (1, '8901234567892', 'Vitamin C 500mg', 'Ascorbic Acid', 'Cecon', 3, '500mg', 1, 350, 40, 3.00, 8.00, '2028-03-15', 'BATCH-003', 0)`
    );
    logger.info('Seeded medicines');
  }
}

/** Last-resort if a prior DDL step failed mid-chain */
async function ensureSuppliersTable() {
  const sql = `CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id INT PRIMARY KEY AUTO_INCREMENT,
    company_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(30),
    address TEXT,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`;
  await pool.execute(sql);
}

export async function ensureSchema() {
  await pool.execute(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );

  for (let i = 0; i < CREATE_STATEMENTS.length; i++) {
    const sql = CREATE_STATEMENTS[i];
    try {
      await pool.execute(sql);
    } catch (err) {
      logger.error(`ensureSchema DDL [${i}] failed:`, err.message);
      await ensureSuppliersTable().catch(() => {});
      throw err;
    }
  }

  await ensureSuppliersTable().catch(() => {});

  if (!(await tableExists('suppliers'))) {
    throw new Error('Critical: suppliers table still missing after ensureSchema. Check MySQL user privileges (CREATE).');
  }

  await seedIfEmpty();
  logger.info('Database schema verified (all tables exist)');
}

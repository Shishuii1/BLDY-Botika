-- PharmaSys Complete Database Schema
CREATE DATABASE IF NOT EXISTS pharmasys CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pharmasys;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS return_items;
DROP TABLE IF EXISTS returns;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS sale_items;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS prescriptions;
DROP TABLE IF EXISTS inventory_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS medicines;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS discounts;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS branches;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE roles (
  role_id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE branches (
  branch_id INT PRIMARY KEY AUTO_INCREMENT,
  branch_name VARCHAR(100) NOT NULL,
  address TEXT,
  phone VARCHAR(30),
  email VARCHAR(100),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
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
  FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE SET NULL,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role_id)
);

CREATE TABLE categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suppliers (
  supplier_id INT PRIMARY KEY AUTO_INCREMENT,
  company_name VARCHAR(150) NOT NULL,
  contact_person VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(30),
  address TEXT,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE medicines (
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
  FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE SET NULL,
  INDEX idx_medicines_name (medicine_name),
  INDEX idx_medicines_barcode (barcode),
  INDEX idx_medicines_expiry (expiration_date),
  INDEX idx_medicines_stock (quantity)
);

CREATE TABLE customers (
  customer_id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(30),
  address TEXT,
  loyalty_points INT DEFAULT 0,
  senior_citizen TINYINT(1) DEFAULT 0,
  pwd TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customers_phone (phone)
);

CREATE TABLE inventory_logs (
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
  FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE SET NULL,
  INDEX idx_inventory_medicine (medicine_id),
  INDEX idx_inventory_date (created_at)
);

CREATE TABLE sales (
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
  FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE SET NULL,
  INDEX idx_sales_date (created_at),
  INDEX idx_sales_invoice (invoice_number)
);

CREATE TABLE sale_items (
  sale_item_id INT PRIMARY KEY AUTO_INCREMENT,
  sale_id INT NOT NULL,
  medicine_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE RESTRICT,
  INDEX idx_sale_items_sale (sale_id)
);

CREATE TABLE prescriptions (
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
);

CREATE TABLE discounts (
  discount_id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE,
  name VARCHAR(100) NOT NULL,
  discount_type ENUM('percentage','fixed') NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  valid_from DATE,
  valid_until DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  sale_id INT NOT NULL,
  payment_method ENUM('cash','card','gcash') NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  reference_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE
);

CREATE TABLE returns (
  return_id INT PRIMARY KEY AUTO_INCREMENT,
  sale_id INT NOT NULL,
  user_id INT NOT NULL,
  reason TEXT,
  refund_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status ENUM('pending','approved','rejected') DEFAULT 'approved',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

CREATE TABLE return_items (
  return_item_id INT PRIMARY KEY AUTO_INCREMENT,
  return_id INT NOT NULL,
  medicine_id INT NOT NULL,
  quantity INT NOT NULL,
  refund_amount DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (return_id) REFERENCES returns(return_id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE RESTRICT
);

CREATE TABLE notifications (
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
  FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE SET NULL,
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_read (is_read)
);

CREATE TABLE audit_logs (
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
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_date (created_at)
);

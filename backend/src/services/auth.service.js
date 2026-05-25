import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query, queryOne, execute } from '../config/db.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export async function login(email, password) {
  const user = await queryOne(
    `SELECT u.*, r.role_name FROM users u
     JOIN roles r ON u.role_id = r.role_id
     WHERE u.email = ? AND u.is_active = 1`,
    [email]
  );
  if (!user) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });

  try {
    await query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);
  } catch {
    /* last_login column may be missing until migration runs */
  }

  const token = signToken(user.user_id);
  const safeUser = {
    user_id: user.user_id,
    branch_id: user.branch_id,
    role_id: user.role_id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    role_name: user.role_name,
  };

  return { user: safeUser, token };
}

async function insertUser(data, { returnToken = false } = {}) {
  const existing = await queryOne('SELECT user_id FROM users WHERE email = ?', [data.email]);
  if (existing) throw Object.assign(new Error('Email already registered'), { statusCode: 400 });

  const role = await queryOne('SELECT role_id, role_name FROM roles WHERE role_id = ?', [data.role_id]);
  if (!role) throw Object.assign(new Error('Invalid role'), { statusCode: 400 });

  const hash = await bcrypt.hash(data.password, 10);
  const result = await execute(
    `INSERT INTO users (branch_id, role_id, full_name, email, password_hash, phone)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.branch_id || 1, data.role_id, data.full_name, data.email, hash, data.phone || null]
  );

  const user = await queryOne(
    `SELECT u.user_id, u.full_name, u.email, u.phone, u.branch_id, u.role_id, u.is_active, r.role_name
     FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = ?`,
    [result.insertId]
  );

  if (returnToken) {
    return { user, token: signToken(user.user_id) };
  }
  return { user };
}

export async function register(data) {
  const roleId = data.role_id || 3;
  return insertUser({ ...data, role_id: roleId }, { returnToken: true });
}

export async function createUserByAdmin(data) {
  return insertUser(data);
}

export async function listUsers() {
  return query(
    `SELECT u.user_id, u.full_name, u.email, u.phone,
            COALESCE(u.is_active, 1) as is_active,
            u.branch_id, r.role_name, r.role_id, b.branch_name
     FROM users u
     JOIN roles r ON u.role_id = r.role_id
     LEFT JOIN branches b ON u.branch_id = b.branch_id
     ORDER BY u.full_name ASC`
  );
}

export async function forgotPassword(email) {
  const user = await queryOne('SELECT user_id FROM users WHERE email = ?', [email]);
  if (!user) return { message: 'If email exists, reset link was sent' };

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000);

  await query(
    'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE user_id = ?',
    [token, expires, user.user_id]
  );

  return { message: 'If email exists, reset link was sent', resetToken: env.nodeEnv === 'development' ? token : undefined };
}

async function ensureRoles() {
  const row = await queryOne('SELECT COUNT(*) as count FROM roles');
  if (row?.count > 0) return;

  await query(
    `INSERT INTO roles (role_name, description) VALUES
     ('super_admin', 'Full system access'),
     ('pharmacist', 'Medicine and prescription management'),
     ('cashier', 'POS and customer transactions'),
     ('inventory_staff', 'Stock and supplier management')`
  );
  logger.info('Default roles created');
}

async function ensureBranch() {
  const row = await queryOne('SELECT branch_id FROM branches WHERE branch_id = 1');
  if (row) return;

  await query(
    `INSERT INTO branches (branch_id, branch_name, address, phone, email) VALUES
     (1, 'Main Branch', 'Main Street', '+639000000000', 'main@pharmasys.local')`
  );
}

export async function ensureDefaultAdmin() {
  await ensureRoles();
  await ensureBranch();

  const admin = await queryOne('SELECT user_id FROM users WHERE email = ?', ['admin@pharmasys.com']);
  if (admin) return;

  const role = await queryOne('SELECT role_id FROM roles WHERE role_name = ?', ['super_admin']);
  if (!role) {
    logger.warn('super_admin role missing — cannot create default admin');
    return;
  }

  const hash = await bcrypt.hash('Admin@123', 10);
  await query(
    `INSERT INTO users (branch_id, role_id, full_name, email, password_hash, phone)
     VALUES (1, ?, 'Super Admin', 'admin@pharmasys.com', ?, '+639000000001')`,
    [role.role_id, hash]
  );
  logger.info('Default admin created: admin@pharmasys.com / Admin@123');
}

function signToken(userId) {
  return jwt.sign({ userId }, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
}

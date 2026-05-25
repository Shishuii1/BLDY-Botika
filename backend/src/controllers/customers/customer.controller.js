import { query, queryOne, execute, countTotal } from '../../config/db.js';
import { success, parsePagination, buildPaginationMeta } from '../../utils/helpers.js';

export async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const search = req.query.search ? `%${req.query.search}%` : null;
  let where = 'WHERE 1=1';
  const params = [];
  if (search) {
    where += ' AND (full_name LIKE ? OR phone LIKE ? OR email LIKE ?)';
    params.push(search, search, search);
  }
  const countRows = await query(`SELECT COUNT(*) as total FROM customers ${where}`, params);
  const rows = await query(
    `SELECT * FROM customers ${where} ORDER BY full_name LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return success(res, { customers: rows, meta: buildPaginationMeta(countTotal(countRows), page, limit) });
}

export async function getOne(req, res) {
  const c = await queryOne('SELECT * FROM customers WHERE customer_id=?', [req.params.id]);
  if (!c) return res.status(404).json({ success: false, message: 'Customer not found' });
  const purchases = await query(
    `SELECT s.sale_id, s.invoice_number, s.total_amount, s.created_at FROM sales s
     WHERE s.customer_id=? ORDER BY s.created_at DESC LIMIT 20`,
    [req.params.id]
  );
  const prescriptions = await query('SELECT * FROM prescriptions WHERE customer_id=?', [req.params.id]);
  return success(res, { ...c, purchases, prescriptions });
}

export async function create(req, res) {
  const b = req.body;
  const r = await execute(
    `INSERT INTO customers (full_name, email, phone, address, senior_citizen, pwd)
     VALUES (?,?,?,?,?,?)`,
    [b.full_name, b.email, b.phone, b.address, b.senior_citizen ? 1 : 0, b.pwd ? 1 : 0]
  );
  const c = await queryOne('SELECT * FROM customers WHERE customer_id=?', [r.insertId]);
  return success(res, c, 'Customer created', 201);
}

export async function update(req, res) {
  const b = req.body;
  await query(
    `UPDATE customers SET full_name=?, email=?, phone=?, address=?, senior_citizen=?, pwd=?, loyalty_points=?
     WHERE customer_id=?`,
    [b.full_name, b.email, b.phone, b.address, b.senior_citizen ? 1 : 0, b.pwd ? 1 : 0, b.loyalty_points ?? 0, req.params.id]
  );
  const c = await queryOne('SELECT * FROM customers WHERE customer_id=?', [req.params.id]);
  return success(res, c);
}

export async function remove(req, res) {
  await query('DELETE FROM customers WHERE customer_id=? AND customer_id > 1', [req.params.id]);
  return success(res, { message: 'Customer deleted' });
}

import { query, queryOne, execute, countTotal } from '../../config/db.js';
import { success } from '../../utils/helpers.js';
import { parsePagination, buildPaginationMeta } from '../../utils/helpers.js';

export async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const countRows = await query('SELECT COUNT(*) as total FROM suppliers WHERE is_active=1');
  const rows = await query('SELECT * FROM suppliers WHERE is_active=1 ORDER BY company_name LIMIT ? OFFSET ?', [limit, offset]);
  return success(res, { suppliers: rows, meta: buildPaginationMeta(countTotal(countRows), page, limit) });
}

export async function getOne(req, res) {
  const s = await queryOne('SELECT * FROM suppliers WHERE supplier_id=?', [req.params.id]);
  if (!s) return res.status(404).json({ success: false, message: 'Supplier not found' });
  const purchases = await query(
    'SELECT m.medicine_name, m.quantity, m.unit_price FROM medicines m WHERE m.supplier_id=?',
    [req.params.id]
  );
  return success(res, { ...s, medicines: purchases });
}

export async function create(req, res) {
  const { company_name, contact_person, email, phone, address } = req.body;
  const r = await execute(
    'INSERT INTO suppliers (company_name, contact_person, email, phone, address) VALUES (?,?,?,?,?)',
    [company_name, contact_person, email, phone, address]
  );
  const s = await queryOne('SELECT * FROM suppliers WHERE supplier_id=?', [r.insertId]);
  return success(res, s, 'Supplier created', 201);
}

export async function update(req, res) {
  const { company_name, contact_person, email, phone, address, is_active } = req.body;
  await query(
    'UPDATE suppliers SET company_name=?, contact_person=?, email=?, phone=?, address=?, is_active=? WHERE supplier_id=?',
    [company_name, contact_person, email, phone, address, is_active ?? 1, req.params.id]
  );
  const s = await queryOne('SELECT * FROM suppliers WHERE supplier_id=?', [req.params.id]);
  return success(res, s);
}

export async function remove(req, res) {
  await query('UPDATE suppliers SET is_active=0 WHERE supplier_id=?', [req.params.id]);
  return success(res, { message: 'Supplier deactivated' });
}

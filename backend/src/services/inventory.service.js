import { query, queryOne, transaction, countTotal } from '../config/db.js';
import { parsePagination, buildPaginationMeta } from '../utils/helpers.js';
import { getMedicineById, updateMedicine } from './medicine.service.js';

export async function adjustStock(data, userId, branchId = 1) {
  return transaction(async (conn) => {
    const [rows] = await conn.execute(
      'SELECT quantity FROM medicines WHERE medicine_id = ? FOR UPDATE',
      [data.medicine_id]
    );
    const med = rows[0];
    if (!med) throw Object.assign(new Error('Medicine not found'), { statusCode: 404 });

    const before = med.quantity;
    let change = data.quantity;
    if (['stock_out', 'damaged', 'expired'].includes(data.action_type)) {
      change = -Math.abs(change);
    } else {
      change = Math.abs(change);
    }

    const after = before + change;
    if (after < 0) throw Object.assign(new Error('Insufficient stock'), { statusCode: 400 });

    await conn.execute('UPDATE medicines SET quantity = ? WHERE medicine_id = ?', [after, data.medicine_id]);
    await conn.execute(
      `INSERT INTO inventory_logs (medicine_id, user_id, branch_id, action_type, quantity_change, quantity_before, quantity_after, batch_number, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.medicine_id, userId, branchId, data.action_type, change, before, after, data.batch_number || null, data.notes || null]
    );

    return { medicine_id: data.medicine_id, quantity_before: before, quantity_after: after };
  });
}

export async function getLogs(queryParams) {
  const { page, limit, offset } = parsePagination(queryParams);
  const medicineId = queryParams.medicine_id;

  let where = 'WHERE 1=1';
  const params = [];
  if (medicineId) {
    where += ' AND il.medicine_id = ?';
    params.push(medicineId);
  }

  const countRows = await query(`SELECT COUNT(*) as total FROM inventory_logs il ${where}`, params);
  const rows = await query(
    `SELECT il.*, m.medicine_name, u.full_name as user_name
     FROM inventory_logs il
     JOIN medicines m ON il.medicine_id = m.medicine_id
     LEFT JOIN users u ON il.user_id = u.user_id
     ${where}
     ORDER BY il.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { logs: rows, meta: buildPaginationMeta(countTotal(countRows), page, limit) };
}

/** Super admin: set exact on-hand quantity and write an adjustment log */
export async function setStockLevel(medicineId, newQuantity, userId, branchId = 1, notes = '') {
  const qty = Number(newQuantity);
  if (!Number.isFinite(qty) || qty < 0) {
    throw Object.assign(new Error('Quantity must be zero or greater'), { statusCode: 400 });
  }

  return transaction(async (conn) => {
    const [rows] = await conn.execute(
      'SELECT quantity FROM medicines WHERE medicine_id = ? FOR UPDATE',
      [medicineId]
    );
    const med = rows[0];
    if (!med) throw Object.assign(new Error('Medicine not found'), { statusCode: 404 });

    const before = med.quantity;
    const change = qty - before;
    if (change === 0) return { medicine_id: medicineId, quantity_before: before, quantity_after: qty };

    await conn.execute('UPDATE medicines SET quantity = ? WHERE medicine_id = ?', [qty, medicineId]);
    await conn.execute(
      `INSERT INTO inventory_logs (medicine_id, user_id, branch_id, action_type, quantity_change, quantity_before, quantity_after, notes)
       VALUES (?, ?, ?, 'adjustment', ?, ?, ?, ?)`,
      [medicineId, userId, branchId, change, before, qty, notes || 'Stock corrected by admin']
    );

    return { medicine_id: medicineId, quantity_before: before, quantity_after: qty };
  });
}

export async function updateStockItem(medicineId, data, userId, branchId = 1) {
  await getMedicineById(medicineId);

  const patch = {};
  if (data.reorder_level !== undefined) patch.reorder_level = Number(data.reorder_level);
  if (data.batch_number !== undefined) patch.batch_number = data.batch_number;
  if (data.expiration_date !== undefined) patch.expiration_date = data.expiration_date || null;

  if (Object.keys(patch).length) {
    await updateMedicine(medicineId, patch);
  }

  if (data.quantity !== undefined) {
    await setStockLevel(medicineId, data.quantity, userId, branchId, data.notes);
  }

  return getMedicineById(medicineId);
}

export async function getLowStock() {
  return query(
    `SELECT m.*, c.name as category_name FROM medicines m
     LEFT JOIN categories c ON m.category_id = c.category_id
     WHERE m.is_archived = 0 AND m.quantity <= m.reorder_level
     ORDER BY m.quantity ASC`
  );
}

export async function getExpiring(days = 90) {
  return query(
    `SELECT m.*, c.name as category_name FROM medicines m
     LEFT JOIN categories c ON m.category_id = c.category_id
     WHERE m.is_archived = 0 AND m.expiration_date IS NOT NULL
       AND m.expiration_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
     ORDER BY m.expiration_date ASC`,
    [days]
  );
}

export async function getInventorySummary() {
  return (
    (await queryOne(`
    SELECT
      COUNT(*) as total_medicines,
      COALESCE(SUM(quantity), 0) as total_units,
      COALESCE(SUM(quantity * selling_price), 0) as total_value,
      SUM(CASE WHEN quantity <= reorder_level THEN 1 ELSE 0 END) as low_stock_count
    FROM medicines WHERE is_archived = 0
  `)) || {
      total_medicines: 0,
      total_units: 0,
      total_value: 0,
      low_stock_count: 0,
    }
  );
}

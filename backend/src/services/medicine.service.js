import { query, queryOne, execute, countTotal } from '../config/db.js';
import { parsePagination, buildPaginationMeta } from '../utils/helpers.js';
import bwipjs from 'bwip-js';
import QRCode from 'qrcode';

export async function listMedicines(queryParams) {
  const { page, limit, offset } = parsePagination(queryParams);
  const search = (queryParams.search || '').trim();
  const categoryId = queryParams.category_id;
  const archived = queryParams.archived === 'true' || queryParams.archived === true;

  let where = 'WHERE COALESCE(m.is_archived, 0) = ?';
  const params = [archived ? 1 : 0];

  if (search) {
    where += ' AND (m.medicine_name LIKE ? OR m.generic_name LIKE ? OR m.barcode LIKE ? OR m.brand_name LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }
  if (categoryId) {
    where += ' AND m.category_id = ?';
    params.push(categoryId);
  }

  const countRows = await query(`SELECT COUNT(*) as total FROM medicines m ${where}`, params);
  const total = countTotal(countRows);

  const rows = await query(
    `SELECT m.*, c.name as category_name, s.company_name as supplier_name
     FROM medicines m
     LEFT JOIN categories c ON m.category_id = c.category_id
     LEFT JOIN suppliers s ON m.supplier_id = s.supplier_id
     ${where}
     ORDER BY m.medicine_name ASC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { medicines: rows, meta: buildPaginationMeta(total, page, limit) };
}

export async function getMedicineById(id) {
  const medicine = await queryOne(
    `SELECT m.*, c.name as category_name, s.company_name as supplier_name
     FROM medicines m
     LEFT JOIN categories c ON m.category_id = c.category_id
     LEFT JOIN suppliers s ON m.supplier_id = s.supplier_id
     WHERE m.medicine_id = ?`,
    [id]
  );
  if (!medicine) throw Object.assign(new Error('Medicine not found'), { statusCode: 404 });
  return medicine;
}

export async function getByBarcode(barcode) {
  const medicine = await queryOne(
    `SELECT m.*, c.name as category_name FROM medicines m
     LEFT JOIN categories c ON m.category_id = c.category_id
     WHERE m.barcode = ? AND m.is_archived = 0`,
    [barcode]
  );
  if (!medicine) throw Object.assign(new Error('Medicine not found'), { statusCode: 404 });
  return medicine;
}

export async function createMedicine(data, imageUrl = null) {
  const barcode = data.barcode || `PH${Date.now()}`;
  const result = await execute(
    `INSERT INTO medicines (
      branch_id, barcode, medicine_name, generic_name, brand_name, category_id,
      dosage, description, supplier_id, quantity, reorder_level, unit_price,
      selling_price, expiration_date, batch_number, prescription_required, image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.branch_id || 1, barcode, data.medicine_name, data.generic_name || null,
      data.brand_name || null, data.category_id || null, data.dosage || null,
      data.description || null, data.supplier_id || null, data.quantity || 0,
      data.reorder_level || 10, data.unit_price, data.selling_price,
      data.expiration_date || null, data.batch_number || null,
      data.prescription_required ? 1 : 0, imageUrl,
    ]
  );
  return getMedicineById(result.insertId);
}

export async function updateMedicine(id, data, imageUrl) {
  await getMedicineById(id);
  const fields = [];
  const values = [];
  const allowed = [
    'medicine_name', 'generic_name', 'brand_name', 'category_id', 'dosage',
    'description', 'supplier_id', 'quantity', 'reorder_level', 'unit_price',
    'selling_price', 'expiration_date', 'batch_number', 'barcode', 'branch_id',
  ];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }
  if (data.prescription_required !== undefined) {
    fields.push('prescription_required = ?');
    values.push(data.prescription_required ? 1 : 0);
  }
  if (imageUrl) {
    fields.push('image_url = ?');
    values.push(imageUrl);
  }
  if (fields.length) {
    values.push(id);
    await query(`UPDATE medicines SET ${fields.join(', ')} WHERE medicine_id = ?`, values);
  }
  return getMedicineById(id);
}

export async function archiveMedicine(id) {
  await query('UPDATE medicines SET is_archived = 1 WHERE medicine_id = ?', [id]);
  return { message: 'Medicine archived' };
}

export async function restoreMedicine(id) {
  await query('UPDATE medicines SET is_archived = 0 WHERE medicine_id = ?', [id]);
  return { message: 'Medicine restored' };
}

export async function deleteMedicine(id) {
  await query('DELETE FROM medicines WHERE medicine_id = ?', [id]);
  return { message: 'Medicine deleted' };
}

export async function generateBarcodePng(text) {
  return bwipjs.toBuffer({
    bcid: 'code128',
    text: text || 'PHARMASYS',
    scale: 3,
    height: 10,
    includetext: true,
  });
}

export async function generateQrDataUrl(text) {
  return QRCode.toDataURL(text || 'PHARMASYS');
}

export async function listCategories() {
  return query('SELECT * FROM categories ORDER BY name');
}

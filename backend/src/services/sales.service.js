import { query, queryOne, transaction, countTotal } from '../config/db.js';
// queryOne used in getSaleById
import { env } from '../config/env.js';
import { generateInvoiceNumber, roundMoney, parsePagination, buildPaginationMeta } from '../utils/helpers.js';

export async function createSale(data, userId, branchId = 1) {
  return transaction(async (conn) => {
    let subtotal = 0;
    const lineItems = [];

    for (const item of data.items) {
      const [medRows] = await conn.execute(
        'SELECT medicine_id, medicine_name, quantity, selling_price, prescription_required FROM medicines WHERE medicine_id = ? AND is_archived = 0 FOR UPDATE',
        [item.medicine_id]
      );
      const med = medRows[0];
      if (!med) throw Object.assign(new Error(`Medicine ${item.medicine_id} not found`), { statusCode: 404 });
      if (med.quantity < item.quantity) {
        throw Object.assign(new Error(`Insufficient stock for ${med.medicine_name}`), { statusCode: 400 });
      }
      const lineSub = roundMoney(med.selling_price * item.quantity);
      subtotal += lineSub;
      lineItems.push({ ...med, quantity: item.quantity, lineSub });
    }

    let discountAmount = data.discount_amount || 0;
    const discountType = data.discount_type || 'none';
    if (discountType === 'senior') discountAmount = roundMoney(subtotal * env.seniorDiscount);
    if (discountType === 'pwd') discountAmount = roundMoney(subtotal * env.pwdDiscount);

    const afterDiscount = roundMoney(subtotal - discountAmount);
    const vatAmount = roundMoney(afterDiscount * env.vatRate / (1 + env.vatRate));
    const totalAmount = roundMoney(afterDiscount);
    const amountPaid = roundMoney(data.amount_paid);
    const changeAmount = roundMoney(Math.max(0, amountPaid - totalAmount));

    if (amountPaid < totalAmount) {
      throw Object.assign(new Error('Insufficient payment amount'), { statusCode: 400 });
    }

    const invoiceNumber = generateInvoiceNumber();
    const [saleResult] = await conn.execute(
      `INSERT INTO sales (invoice_number, branch_id, user_id, customer_id, subtotal, vat_amount, discount_amount, discount_type, total_amount, amount_paid, change_amount, payment_method, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoiceNumber, branchId, userId, data.customer_id || null,
        subtotal, vatAmount, discountAmount, discountType, totalAmount,
        amountPaid, changeAmount, data.payment_method, data.notes || null,
      ]
    );
    const saleId = saleResult.insertId;

    for (const item of lineItems) {
      await conn.execute(
        'INSERT INTO sale_items (sale_id, medicine_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [saleId, item.medicine_id, item.quantity, item.selling_price, item.lineSub]
      );

      const [beforeRows] = await conn.execute('SELECT quantity FROM medicines WHERE medicine_id = ?', [item.medicine_id]);
      const before = beforeRows[0].quantity;
      const after = before - item.quantity;

      await conn.execute('UPDATE medicines SET quantity = ? WHERE medicine_id = ?', [after, item.medicine_id]);
      await conn.execute(
        `INSERT INTO inventory_logs (medicine_id, user_id, branch_id, action_type, quantity_change, quantity_before, quantity_after, notes)
         VALUES (?, ?, ?, 'sale', ?, ?, ?, ?)`,
        [item.medicine_id, userId, branchId, -item.quantity, before, after, `Sale ${invoiceNumber}`]
      );
    }

    await conn.execute(
      'INSERT INTO payments (sale_id, payment_method, amount) VALUES (?, ?, ?)',
      [saleId, data.payment_method, totalAmount]
    );

    return getSaleById(saleId, conn);
  });
}

export async function getSaleById(id, conn = null) {
  const saleSql = `SELECT s.*, u.full_name as cashier_name, c.full_name as customer_name
     FROM sales s
     LEFT JOIN users u ON s.user_id = u.user_id
     LEFT JOIN customers c ON s.customer_id = c.customer_id
     WHERE s.sale_id = ?`;
  const itemsSql = `SELECT si.*, m.medicine_name, m.barcode FROM sale_items si
     JOIN medicines m ON si.medicine_id = m.medicine_id WHERE si.sale_id = ?`;

  let sale;
  let items;
  if (conn) {
    const [saleRows] = await conn.execute(saleSql, [id]);
    sale = saleRows[0];
    const [itemRows] = await conn.execute(itemsSql, [id]);
    items = itemRows;
  } else {
    sale = await queryOne(saleSql, [id]);
    items = await query(itemsSql, [id]);
  }

  if (!sale) throw Object.assign(new Error('Sale not found'), { statusCode: 404 });
  return { ...sale, items };
}

export async function listSales(queryParams) {
  const { page, limit, offset } = parsePagination(queryParams);
  const countRows = await query('SELECT COUNT(*) as total FROM sales');
  const rows = await query(
    `SELECT s.sale_id, s.invoice_number, s.total_amount, s.payment_method, s.status, s.created_at,
            u.full_name as cashier_name, c.full_name as customer_name
     FROM sales s
     LEFT JOIN users u ON s.user_id = u.user_id
     LEFT JOIN customers c ON s.customer_id = c.customer_id
     ORDER BY s.created_at DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return { sales: rows, meta: buildPaginationMeta(countTotal(countRows), page, limit) };
}

export async function processReturn(data, userId) {
  return transaction(async (conn) => {
    const [sales] = await conn.execute('SELECT * FROM sales WHERE sale_id = ?', [data.sale_id]);
    const sale = sales[0];
    if (!sale) throw Object.assign(new Error('Sale not found'), { statusCode: 404 });

    let refundTotal = 0;
    for (const item of data.items) {
      const [si] = await conn.execute(
        'SELECT * FROM sale_items WHERE sale_id = ? AND medicine_id = ?',
        [data.sale_id, item.medicine_id]
      );
      if (!si[0] || si[0].quantity < item.quantity) {
        throw Object.assign(new Error('Invalid return quantity'), { statusCode: 400 });
      }
      const refund = roundMoney(si[0].unit_price * item.quantity);
      refundTotal += refund;

      const [med] = await conn.execute('SELECT quantity FROM medicines WHERE medicine_id = ? FOR UPDATE', [item.medicine_id]);
      const before = med[0].quantity;
      const after = before + item.quantity;
      await conn.execute('UPDATE medicines SET quantity = ? WHERE medicine_id = ?', [after, item.medicine_id]);
      await conn.execute(
        `INSERT INTO inventory_logs (medicine_id, user_id, action_type, quantity_change, quantity_before, quantity_after, notes)
         VALUES (?, ?, 'return', ?, ?, ?, ?)`,
        [item.medicine_id, userId, item.quantity, before, after, data.reason]
      );
    }

    const [ret] = await conn.execute(
      'INSERT INTO returns (sale_id, user_id, reason, refund_amount) VALUES (?, ?, ?, ?)',
      [data.sale_id, userId, data.reason, refundTotal]
    );

    await conn.execute('UPDATE sales SET status = \'refunded\' WHERE sale_id = ?', [data.sale_id]);
    return { return_id: ret.insertId, refund_amount: refundTotal };
  });
}

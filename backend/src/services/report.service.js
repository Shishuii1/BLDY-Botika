import { query } from '../config/db.js';
import PDFDocument from 'pdfkit';

export async function salesReport(from, to) {
  return query(
    `SELECT DATE(created_at) as date, COUNT(*) as transactions,
            SUM(subtotal) as subtotal, SUM(vat_amount) as vat,
            SUM(discount_amount) as discounts, SUM(total_amount) as revenue
     FROM sales WHERE status = 'completed'
       AND DATE(created_at) BETWEEN ? AND ?
     GROUP BY DATE(created_at) ORDER BY date`,
    [from, to]
  );
}

export async function inventoryReport() {
  return query(
    `SELECT m.medicine_id, m.medicine_name, m.barcode, m.quantity, m.reorder_level,
            m.selling_price, m.expiration_date, c.name as category_name,
            (m.quantity * m.selling_price) as stock_value
     FROM medicines m LEFT JOIN categories c ON m.category_id = c.category_id
     WHERE m.is_archived = 0 ORDER BY m.medicine_name`
  );
}

export async function financialSummary(from, to) {
  const [row] = await query(
    `SELECT COUNT(*) as total_sales, COALESCE(SUM(total_amount),0) as revenue,
            COALESCE(SUM(vat_amount),0) as total_vat, COALESCE(SUM(discount_amount),0) as total_discounts
     FROM sales WHERE status = 'completed' AND DATE(created_at) BETWEEN ? AND ?`,
    [from, to]
  );
  return row;
}

export async function topSelling(from, to, limit = 10) {
  return query(
    `SELECT m.medicine_id, m.medicine_name, SUM(si.quantity) as qty_sold, SUM(si.subtotal) as revenue
     FROM sale_items si
     JOIN sales s ON si.sale_id = s.sale_id
     JOIN medicines m ON si.medicine_id = m.medicine_id
     WHERE s.status = 'completed' AND DATE(s.created_at) BETWEEN ? AND ?
     GROUP BY m.medicine_id ORDER BY qty_sold DESC LIMIT ?`,
    [from, to, limit]
  );
}

export function generateSalesPdf(rows, res) {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=sales-report.pdf');
  doc.pipe(res);
  doc.fontSize(18).text('PharmaSys Sales Report', { align: 'center' });
  doc.moveDown();
  rows.forEach((r) => {
    doc.fontSize(10).text(`${r.date}: ${r.transactions} txns — ₱${Number(r.revenue).toFixed(2)}`);
  });
  doc.end();
}

import * as salesService from '../../services/sales.service.js';
import { success } from '../../utils/helpers.js';
import PDFDocument from 'pdfkit';

export async function create(req, res) {
  const data = await salesService.createSale(req.body, req.user.user_id, req.user.branch_id || 1);
  req.app.get('io')?.emit('sale:completed', { sale_id: data.sale_id, total: data.total_amount });
  return success(res, data, 'Sale completed', 201);
}

export async function list(req, res) {
  const data = await salesService.listSales(req.query);
  return success(res, data);
}

export async function getOne(req, res) {
  const data = await salesService.getSaleById(req.params.id);
  return success(res, data);
}

export async function processReturn(req, res) {
  const data = await salesService.processReturn(req.body, req.user.user_id);
  return success(res, data, 'Return processed');
}

export async function receiptPdf(req, res) {
  const sale = await salesService.getSaleById(req.params.id);
  const doc = new PDFDocument({ margin: 40, size: [226, 600] });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=receipt-${sale.invoice_number}.pdf`);
  doc.pipe(res);
  doc.fontSize(14).text('PharmaSys Receipt', { align: 'center' });
  doc.fontSize(9).text(sale.invoice_number, { align: 'center' });
  doc.moveDown();
  sale.items.forEach((i) => {
    doc.text(`${i.medicine_name} x${i.quantity} — ₱${Number(i.subtotal).toFixed(2)}`);
  });
  doc.moveDown();
  doc.text(`Subtotal: ₱${Number(sale.subtotal).toFixed(2)}`);
  doc.text(`VAT: ₱${Number(sale.vat_amount).toFixed(2)}`);
  doc.text(`Discount: ₱${Number(sale.discount_amount).toFixed(2)}`);
  doc.fontSize(11).text(`TOTAL: ₱${Number(sale.total_amount).toFixed(2)}`, { underline: true });
  doc.text(`Paid (${sale.payment_method}): ₱${Number(sale.amount_paid).toFixed(2)}`);
  doc.text(`Change: ₱${Number(sale.change_amount).toFixed(2)}`);
  doc.end();
}

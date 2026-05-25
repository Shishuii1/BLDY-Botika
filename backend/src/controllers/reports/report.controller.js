import * as reportService from '../../services/report.service.js';
import { success } from '../../utils/helpers.js';
import ExcelJS from 'exceljs';

export async function sales(req, res) {
  const from = req.query.from || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const to = req.query.to || new Date().toISOString().slice(0, 10);
  const data = await reportService.salesReport(from, to);
  return success(res, { from, to, rows: data });
}

export async function inventory(req, res) {
  const data = await reportService.inventoryReport();
  return success(res, data);
}

export async function financial(req, res) {
  const from = req.query.from || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const to = req.query.to || new Date().toISOString().slice(0, 10);
  const data = await reportService.financialSummary(from, to);
  const top = await reportService.topSelling(from, to);
  return success(res, { summary: data, topSelling: top, from, to });
}

export async function salesPdf(req, res) {
  const from = req.query.from;
  const to = req.query.to;
  const rows = await reportService.salesReport(from, to);
  reportService.generateSalesPdf(rows, res);
}

export async function salesExcel(req, res) {
  const from = req.query.from;
  const to = req.query.to;
  const rows = await reportService.salesReport(from, to);
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sales');
  ws.columns = [
    { header: 'Date', key: 'date' },
    { header: 'Transactions', key: 'transactions' },
    { header: 'Revenue', key: 'revenue' },
  ];
  rows.forEach((r) => ws.addRow(r));
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=sales-report.xlsx');
  await wb.xlsx.write(res);
}

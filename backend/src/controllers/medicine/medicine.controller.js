import * as medicineService from '../../services/medicine.service.js';
import { success } from '../../utils/helpers.js';
import path from 'path';

export async function list(req, res) {
  const data = await medicineService.listMedicines(req.query);
  return success(res, data);
}

export async function getOne(req, res) {
  const data = await medicineService.getMedicineById(req.params.id);
  return success(res, data);
}

export async function getBarcode(req, res) {
  const data = await medicineService.getByBarcode(req.params.barcode);
  return success(res, data);
}

export async function create(req, res) {
  const imageUrl = req.file ? `/uploads/medicines/${req.file.filename}` : null;
  const data = await medicineService.createMedicine(req.body, imageUrl);
  return success(res, data, 'Medicine created', 201);
}

export async function update(req, res) {
  const imageUrl = req.file ? `/uploads/medicines/${req.file.filename}` : null;
  const data = await medicineService.updateMedicine(req.params.id, req.body, imageUrl);
  return success(res, data, 'Medicine updated');
}

export async function archive(req, res) {
  const data = await medicineService.archiveMedicine(req.params.id);
  return success(res, data, 'Medicine archived');
}

export async function restore(req, res) {
  const data = await medicineService.restoreMedicine(req.params.id);
  return success(res, data, 'Medicine restored');
}

export async function remove(req, res) {
  const data = await medicineService.deleteMedicine(req.params.id);
  return success(res, data);
}

export async function barcodeImage(req, res) {
  const med = await medicineService.getMedicineById(req.params.id);
  const buffer = await medicineService.generateBarcodePng(med.barcode);
  res.set('Content-Type', 'image/png');
  res.send(buffer);
}

export async function qrCode(req, res) {
  const med = await medicineService.getMedicineById(req.params.id);
  const url = await medicineService.generateQrDataUrl(med.barcode);
  return success(res, { qr: url });
}

export async function categories(req, res) {
  const data = await medicineService.listCategories();
  return success(res, data);
}

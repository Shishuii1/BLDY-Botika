import * as inventoryService from '../../services/inventory.service.js';
import { success } from '../../utils/helpers.js';

export async function adjust(req, res) {
  const data = await inventoryService.adjustStock(
    req.body,
    req.user.user_id,
    req.user.branch_id || 1
  );
  req.app.get('io')?.emit('inventory:update', data);
  return success(res, data, 'Stock updated');
}

export async function logs(req, res) {
  const data = await inventoryService.getLogs(req.query);
  return success(res, data);
}

export async function lowStock(req, res) {
  const data = await inventoryService.getLowStock();
  return success(res, data);
}

export async function expiring(req, res) {
  const data = await inventoryService.getExpiring(req.query.days || 90);
  return success(res, data);
}

export async function summary(req, res) {
  const data = await inventoryService.getInventorySummary();
  return success(res, data);
}

export async function updateStock(req, res) {
  const data = await inventoryService.updateStockItem(
    req.params.id,
    req.body,
    req.user.user_id,
    req.user.branch_id || 1
  );
  req.app.get('io')?.emit('inventory:update', data);
  return success(res, data, 'Stock updated');
}

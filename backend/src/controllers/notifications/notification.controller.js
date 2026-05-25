import * as notificationService from '../../services/notification.service.js';
import { success } from '../../utils/helpers.js';

export async function list(req, res) {
  const data = await notificationService.listForUser(req.user.user_id, req.query.unread === 'true');
  return success(res, data);
}

export async function markRead(req, res) {
  const data = await notificationService.markRead(req.params.id, req.user.user_id);
  return success(res, data);
}

export async function markAllRead(req, res) {
  const data = await notificationService.markAllRead(req.user.user_id);
  return success(res, data);
}

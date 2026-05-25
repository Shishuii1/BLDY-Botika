import { query } from '../config/db.js';
import * as notificationService from '../services/notification.service.js';

export async function checkLowStock(app) {
  const low = await query(
    'SELECT medicine_id, medicine_name, quantity, reorder_level FROM medicines WHERE is_archived=0 AND quantity <= reorder_level'
  );
  const io = app.get('io');
  for (const m of low) {
    await notificationService.createNotification({
      type: 'low_stock',
      title: 'Low Stock',
      message: `${m.medicine_name} has ${m.quantity} units (reorder: ${m.reorder_level})`,
      link: '/inventory',
    });
    io?.emit('notification:new', { type: 'low_stock', medicine: m.medicine_name });
  }
}

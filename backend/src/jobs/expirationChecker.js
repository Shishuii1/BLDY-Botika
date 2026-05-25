import { query } from '../config/db.js';
import * as notificationService from '../services/notification.service.js';

export async function checkExpiration(app) {
  const expiring = await query(
    `SELECT medicine_id, medicine_name, expiration_date FROM medicines
     WHERE is_archived=0 AND expiration_date IS NOT NULL
       AND expiration_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)`
  );
  const io = app.get('io');
  for (const m of expiring) {
    await notificationService.createNotification({
      type: 'expiring',
      title: 'Expiring Medicine',
      message: `${m.medicine_name} expires on ${m.expiration_date}`,
      link: '/medicines',
    });
    io?.emit('notification:new', { type: 'expiring', medicine: m.medicine_name });
  }
}

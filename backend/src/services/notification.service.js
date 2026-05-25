import { query, execute } from '../config/db.js';

export async function listForUser(userId, unreadOnly = false) {
  let sql = 'SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL';
  const params = [userId];
  if (unreadOnly) sql += ' AND is_read = 0';
  sql += ' ORDER BY created_at DESC LIMIT 50';
  return query(sql, params);
}

export async function markRead(id, userId) {
  await query('UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND (user_id = ? OR user_id IS NULL)', [id, userId]);
  return { message: 'Marked as read' };
}

export async function markAllRead(userId) {
  await query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
  return { message: 'All marked as read' };
}

export async function createNotification({ userId, branchId, type, title, message, link }) {
  const result = await execute(
    'INSERT INTO notifications (user_id, branch_id, type, title, message, link) VALUES (?, ?, ?, ?, ?, ?)',
    [userId || null, branchId || 1, type, title, message, link || null]
  );
  return result.insertId;
}

export async function broadcastSystem(title, message) {
  const users = await query('SELECT user_id FROM users WHERE is_active = 1');
  for (const u of users) {
    await createNotification({ userId: u.user_id, type: 'system', title, message });
  }
}

import { query } from '../config/db.js';

export function auditLog(action, entityType = null) {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode < 400 && req.user) {
        query(
          `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, user_agent, new_values)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            req.user.user_id,
            action,
            entityType,
            req.params.id ? parseInt(req.params.id, 10) : null,
            req.ip,
            req.get('user-agent')?.slice(0, 255),
            JSON.stringify({ method: req.method, path: req.originalUrl }),
          ]
        ).catch(() => {});
      }
      return originalJson(body);
    };
    next();
  };
}

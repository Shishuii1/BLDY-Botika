import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { queryOne } from '../config/db.js';

export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwt.secret);

    const user = await queryOne(
      `SELECT u.user_id, u.branch_id, u.role_id, u.full_name, u.email, u.phone, u.is_active,
              r.role_name
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.user_id = ? AND u.is_active = 1`,
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

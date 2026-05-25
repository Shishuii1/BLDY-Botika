import { Router } from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { validate } from '../middleware/validateMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize, ROLES } from '../middleware/roleMiddleware.js';
import { loginSchema, registerSchema, forgotPasswordSchema, createUserSchema } from '../validations/auth.validation.js';
import * as authController from '../controllers/auth/auth.controller.js';
import { ensureDefaultAdmin } from '../services/auth.service.js';
import { env } from '../config/env.js';

const router = Router();

router.post('/login', validate(loginSchema), asyncHandler(authController.login));
router.post('/register', validate(registerSchema), asyncHandler(authController.register));
router.post('/forgot-password', validate(forgotPasswordSchema), asyncHandler(authController.forgotPassword));
router.get('/me', protect, asyncHandler(authController.getMe));
router.get('/roles', protect, asyncHandler(authController.getRoles));
router.get('/users', protect, authorize(ROLES.SUPER_ADMIN), asyncHandler(authController.listUsers));
router.post('/users', protect, authorize(ROLES.SUPER_ADMIN), validate(createUserSchema), asyncHandler(authController.createUser));

// Dev only: recreate default admin if missing
router.post('/ensure-admin', asyncHandler(async (req, res) => {
  if (env.nodeEnv === 'production') {
    return res.status(403).json({ success: false, message: 'Not available in production' });
  }
  await ensureDefaultAdmin();
  res.json({
    success: true,
    message: 'Default admin ensured: admin@pharmasys.com / Admin@123',
  });
}));

export default router;

import { Router } from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { protect } from '../middleware/authMiddleware.js';
import * as ctrl from '../controllers/notifications/notification.controller.js';

const router = Router();
router.use(protect);
router.get('/', asyncHandler(ctrl.list));
router.patch('/read-all', asyncHandler(ctrl.markAllRead));
router.patch('/:id/read', asyncHandler(ctrl.markRead));

export default router;

import { Router } from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { protect } from '../middleware/authMiddleware.js';
import * as ctrl from '../controllers/dashboard/dashboard.controller.js';

const router = Router();
router.use(protect);
router.get('/stats', asyncHandler(ctrl.stats));

export default router;

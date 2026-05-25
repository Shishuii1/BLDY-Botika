import { Router } from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize, ROLES } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { stockAdjustmentSchema } from '../validations/inventory.validation.js';
import * as ctrl from '../controllers/inventory/inventory.controller.js';

const router = Router();
router.use(protect);

router.get('/summary', asyncHandler(ctrl.summary));
router.get('/low-stock', asyncHandler(ctrl.lowStock));
router.get('/expiring', asyncHandler(ctrl.expiring));
router.get('/logs', asyncHandler(ctrl.logs));
router.post('/adjust', authorize(ROLES.SUPER_ADMIN, ROLES.INVENTORY, ROLES.PHARMACIST), validate(stockAdjustmentSchema), asyncHandler(ctrl.adjust));
router.put('/stock/:id', authorize(ROLES.SUPER_ADMIN), asyncHandler(ctrl.updateStock));

export default router;

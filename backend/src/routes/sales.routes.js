import { Router } from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize, ROLES } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { createSaleSchema, returnSchema } from '../validations/sales.validation.js';
import * as ctrl from '../controllers/sales/sales.controller.js';

const router = Router();
router.use(protect);

const posRoles = [ROLES.SUPER_ADMIN, ROLES.PHARMACIST, ROLES.CASHIER];

router.get('/', asyncHandler(ctrl.list));
router.get('/:id/receipt', asyncHandler(ctrl.receiptPdf));
router.get('/:id', asyncHandler(ctrl.getOne));
router.post('/', authorize(...posRoles), validate(createSaleSchema), asyncHandler(ctrl.create));
router.post('/return', authorize(...posRoles), validate(returnSchema), asyncHandler(ctrl.processReturn));

export default router;

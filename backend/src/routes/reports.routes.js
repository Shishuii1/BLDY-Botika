import { Router } from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize, ROLES } from '../middleware/roleMiddleware.js';
import * as ctrl from '../controllers/reports/report.controller.js';

const router = Router();
router.use(protect);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.PHARMACIST));

router.get('/sales', asyncHandler(ctrl.sales));
router.get('/inventory', asyncHandler(ctrl.inventory));
router.get('/financial', asyncHandler(ctrl.financial));
router.get('/sales/pdf', asyncHandler(ctrl.salesPdf));
router.get('/sales/excel', asyncHandler(ctrl.salesExcel));

export default router;

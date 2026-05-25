import { Router } from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize, ROLES } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { medicineSchema, medicineIdSchema } from '../validations/medicine.validation.js';
import { uploadMedicineImage } from '../middleware/uploadMiddleware.js';
import * as ctrl from '../controllers/medicine/medicine.controller.js';

const router = Router();
const staff = [ROLES.SUPER_ADMIN, ROLES.PHARMACIST, ROLES.INVENTORY];

router.use(protect);

router.get('/categories', asyncHandler(ctrl.categories));
router.get('/', asyncHandler(ctrl.list));
router.get('/barcode/:barcode', asyncHandler(ctrl.getBarcode));
router.get('/:id/barcode-image', validate(medicineIdSchema), asyncHandler(ctrl.barcodeImage));
router.get('/:id/qr', validate(medicineIdSchema), asyncHandler(ctrl.qrCode));
router.get('/:id', validate(medicineIdSchema), asyncHandler(ctrl.getOne));
router.post('/', authorize(...staff), (req, res, next) => {
  uploadMedicineImage(req, res, (err) => (err ? next(err) : next()));
}, validate(medicineSchema), asyncHandler(ctrl.create));
router.put('/:id', authorize(...staff), validate(medicineIdSchema), (req, res, next) => {
  uploadMedicineImage(req, res, (err) => (err ? next(err) : next()));
}, asyncHandler(ctrl.update));
router.patch('/:id/archive', authorize(...staff), validate(medicineIdSchema), asyncHandler(ctrl.archive));
router.patch('/:id/restore', authorize(...staff), validate(medicineIdSchema), asyncHandler(ctrl.restore));
router.delete('/:id', authorize(ROLES.SUPER_ADMIN), validate(medicineIdSchema), asyncHandler(ctrl.remove));

export default router;

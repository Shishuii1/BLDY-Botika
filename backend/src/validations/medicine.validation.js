import { z } from 'zod';

export const medicineSchema = z.object({
  body: z.object({
    medicine_name: z.string().min(1),
    generic_name: z.string().optional().nullable(),
    brand_name: z.string().optional().nullable(),
    category_id: z.coerce.number().int().optional().nullable(),
    dosage: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    supplier_id: z.coerce.number().int().optional().nullable(),
    quantity: z.coerce.number().int().min(0).optional(),
    reorder_level: z.coerce.number().int().min(0).optional(),
    unit_price: z.coerce.number().min(0),
    selling_price: z.coerce.number().min(0),
    expiration_date: z.string().optional().nullable(),
    batch_number: z.string().optional().nullable(),
    prescription_required: z.coerce.boolean().optional(),
    barcode: z.string().optional().nullable(),
    branch_id: z.coerce.number().int().optional(),
  }),
});

export const medicineIdSchema = z.object({
  params: z.object({ id: z.coerce.number().int() }),
});

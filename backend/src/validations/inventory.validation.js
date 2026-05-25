import { z } from 'zod';

export const stockAdjustmentSchema = z.object({
  body: z.object({
    medicine_id: z.coerce.number().int(),
    action_type: z.enum(['stock_in', 'stock_out', 'adjustment', 'damaged', 'expired']),
    quantity: z.coerce.number().int().positive(),
    batch_number: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

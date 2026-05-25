import { z } from 'zod';

const saleItemSchema = z.object({
  medicine_id: z.number().int(),
  quantity: z.number().int().positive(),
});

export const createSaleSchema = z.object({
  body: z.object({
    customer_id: z.number().int().optional().nullable(),
    items: z.array(saleItemSchema).min(1),
    payment_method: z.enum(['cash', 'card', 'gcash']),
    amount_paid: z.number().min(0),
    discount_type: z.enum(['none', 'senior', 'pwd', 'promo', 'manual']).optional(),
    discount_amount: z.number().min(0).optional(),
    notes: z.string().optional().nullable(),
  }),
});

export const returnSchema = z.object({
  body: z.object({
    sale_id: z.number().int(),
    reason: z.string().min(3),
    items: z.array(
      z.object({
        medicine_id: z.number().int(),
        quantity: z.number().int().positive(),
      })
    ).min(1),
  }),
});

import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    full_name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().optional(),
    role_id: z.number().int().optional(),
    branch_id: z.number().int().optional(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    full_name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().optional(),
    role_id: z.coerce.number().int().min(1),
    branch_id: z.coerce.number().int().optional(),
  }),
});

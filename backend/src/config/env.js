import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { z } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

const baseEnvSchema = z.object({
  PORT: z.preprocess((value) => {
    if (value === undefined || value === null || value === '') return undefined;
    return Number(value);
  }, z.number().int().positive().default(5000)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DB_HOST: z.string().nonempty(),
  DB_USER: z.string().nonempty(),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string().nonempty(),
  JWT_SECRET: z.string().min(10).default('pharmasys_dev_secret_change_in_production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  SESSION_TIMEOUT_MINUTES: z.preprocess((value) => {
    if (value === undefined || value === null || value === '') return undefined;
    return Number(value);
  }, z.number().int().positive().default(60)),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  CLOUDINARY_CLOUD_NAME: z.string().optional().transform((value) => value || undefined),
  CLOUDINARY_API_KEY: z.string().optional().transform((value) => value || undefined),
  CLOUDINARY_API_SECRET: z.string().optional().transform((value) => value || undefined),
  VAT_RATE: z.preprocess((value) => {
    if (value === undefined || value === null || value === '') return undefined;
    return parseFloat(String(value));
  }, z.number().positive().default(0.12)),
  SENIOR_DISCOUNT: z.preprocess((value) => {
    if (value === undefined || value === null || value === '') return undefined;
    return parseFloat(String(value));
  }, z.number().nonnegative().default(0.2)),
  PWD_DISCOUNT: z.preprocess((value) => {
    if (value === undefined || value === null || value === '') return undefined;
    return parseFloat(String(value));
  }, z.number().nonnegative().default(0.2)),
});

const productionEnvSchema = baseEnvSchema.extend({
  JWT_SECRET: z.string().min(20),
  DB_PASSWORD: z.string().min(1),
  CLIENT_URL: z.string().url(),
});

const parsed = (process.env.NODE_ENV === 'production' ? productionEnvSchema : baseEnvSchema).safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  parsed.error.issues.forEach((issue) => {
    console.error(`- ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

const config = parsed.data;

if (config.NODE_ENV !== 'production' && config.JWT_SECRET === 'pharmasys_dev_secret_change_in_production') {
  console.warn('Warning: using a default JWT_SECRET in non-production mode. Set JWT_SECRET in .env before deploying.');
}

export const env = {
  port: config.PORT,
  nodeEnv: config.NODE_ENV,
  db: {
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASSWORD || '',
    database: config.DB_NAME,
  },
  jwt: {
    secret: config.JWT_SECRET,
    expiresIn: config.JWT_EXPIRES_IN,
  },
  sessionTimeoutMinutes: config.SESSION_TIMEOUT_MINUTES,
  clientUrl: config.CLIENT_URL,
  cloudinary: {
    cloudName: config.CLOUDINARY_CLOUD_NAME,
    apiKey: config.CLOUDINARY_API_KEY,
    apiSecret: config.CLOUDINARY_API_SECRET,
  },
  vatRate: config.VAT_RATE,
  seniorDiscount: config.SENIOR_DISCOUNT,
  pwdDiscount: config.PWD_DISCOUNT,
};

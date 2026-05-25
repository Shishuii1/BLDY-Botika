import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { dbReadyMiddleware } from './config/dbReady.js';

import authRoutes from './routes/auth.routes.js';
import medicineRoutes from './routes/medicine.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import salesRoutes from './routes/sales.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import supplierRoutes from './routes/supplier.routes.js';
import customerRoutes from './routes/customer.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function createApp() {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500,
      message: { success: false, message: 'Too many requests' },
    })
  );

  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Root — browsers go to the web app; API clients get a short index
  app.get('/', (req, res) => {
    if (req.accepts('html')) {
      return res.redirect(env.clientUrl);
    }
    res.json({
      success: true,
      message: 'PharmaSys API — use the web app or /api routes',
      webApp: env.clientUrl,
      health: '/api/health',
      apiIndex: '/api',
    });
  });

  app.get('/api', (req, res) => {
    res.json({
      success: true,
      message: 'PharmaSys REST API',
      version: '1.0.0',
      endpoints: {
        health: 'GET /api/health',
        auth: '/api/auth',
        medicines: '/api/medicines',
        inventory: '/api/inventory',
        sales: '/api/sales',
        dashboard: '/api/dashboard',
        reports: '/api/reports',
        suppliers: '/api/suppliers',
        customers: '/api/customers',
        notifications: '/api/notifications',
      },
      webApp: env.clientUrl,
    });
  });

  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'PharmaSys API is running', env: env.nodeEnv });
  });

  app.use('/api', dbReadyMiddleware);

  app.use('/api/auth', authRoutes);
  app.use('/api/medicines', medicineRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/sales', salesRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/suppliers', supplierRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

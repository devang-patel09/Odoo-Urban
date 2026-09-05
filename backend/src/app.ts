import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';

export const app = express();

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Base health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Urban Furniture Accounting ERP',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '1.0.0',
  });
});

// Route imports
import authRoutes from './routes/authRoutes';
import {
  contactRoutes,
  productRoutes,
  categoryRoutes,
  accountRoutes,
  journalRoutes,
  analyticRoutes,
} from './routes/masterDataRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/analytics', analyticRoutes);

// Centralized error handler
app.use(errorHandler);

export default app;

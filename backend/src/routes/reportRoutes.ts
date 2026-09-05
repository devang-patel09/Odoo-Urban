import { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

export const reportRoutes = Router();

reportRoutes.use(authenticate);

// Financial Reports (Restricted to Admin and Accountant)
reportRoutes.get(
  '/profit-and-loss',
  requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]),
  ReportController.getProfitAndLoss
);

reportRoutes.get(
  '/balance-sheet',
  requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]),
  ReportController.getBalanceSheet
);

reportRoutes.get(
  '/trial-balance',
  requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]),
  ReportController.getTrialBalance
);

reportRoutes.get(
  '/general-ledger',
  requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]),
  ReportController.getGeneralLedger
);

reportRoutes.get(
  '/aged-receivables',
  requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]),
  ReportController.getAgedReceivables
);

reportRoutes.get(
  '/aged-payables',
  requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]),
  ReportController.getAgedPayables
);

reportRoutes.get(
  '/dashboard-kpis',
  requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]),
  ReportController.getDashboardKPIs
);

reportRoutes.get(
  '/sales-analytics',
  requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]),
  ReportController.getSalesAnalytics
);

reportRoutes.get(
  '/purchase-analytics',
  requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]),
  ReportController.getPurchaseAnalytics
);


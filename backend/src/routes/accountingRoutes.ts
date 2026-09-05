import { Router } from 'express';
import { AccountingController } from '../controllers/accountingController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

export const accountingRoutes = Router();

accountingRoutes.use(authenticate);

accountingRoutes.get(
  '/journal-entries',
  requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]),
  AccountingController.listJournalEntries
);

accountingRoutes.get(
  '/journal-entries/:id',
  requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]),
  AccountingController.getJournalEntry
);

accountingRoutes.post(
  '/journal-entries',
  requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]),
  AccountingController.createManualJournalEntry
);

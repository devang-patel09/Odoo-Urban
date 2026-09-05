import { Router } from 'express';
import { BudgetController } from '../controllers/budgetController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

export const budgetRoutes = Router();

budgetRoutes.use(authenticate);

budgetRoutes.get('/', BudgetController.listBudgets);
budgetRoutes.get('/:id', BudgetController.getBudget);

budgetRoutes.post(
  '/',
  requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]),
  BudgetController.createBudget
);

budgetRoutes.post(
  '/:id/confirm',
  requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]),
  BudgetController.confirmBudget
);

budgetRoutes.post(
  '/:id/revise',
  requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]),
  BudgetController.reviseBudget
);

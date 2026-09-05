import { Request, Response, NextFunction } from 'express';
import { BudgetService } from '../services/budgetService';
import { successResponse } from '../utils/response';
import { z } from 'zod';

const createBudgetSchema = z.object({
  name: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
  responsibleId: z.number().int().positive().nullable().optional(),
  analyticAccountId: z.number().int().positive(),
  committedAmount: z.number().positive(),
  notes: z.string().optional(),
});

const reviseBudgetSchema = z.object({
  committedAmount: z.number().positive(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

export class BudgetController {
  static async listBudgets(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, search } = req.query as any;
      const budgets = await BudgetService.listBudgets({ status, search });
      return successResponse(res, budgets, 'Budgets retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getBudget(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const budget = await BudgetService.getBudget(id);
      return successResponse(res, budget, 'Budget details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createBudget(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createBudgetSchema.parse(req.body);
      const budget = await BudgetService.createBudget(validated);
      return successResponse(res, budget, 'Budget created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async confirmBudget(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const budget = await BudgetService.confirmBudget(id);
      return successResponse(res, budget, 'Budget confirmed');
    } catch (error) {
      next(error);
    }
  }

  static async reviseBudget(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const validated = reviseBudgetSchema.parse(req.body);
      const revision = await BudgetService.reviseBudget(id, validated);
      return successResponse(res, revision, 'Budget revised successfully', 201);
    } catch (error) {
      next(error);
    }
  }
}

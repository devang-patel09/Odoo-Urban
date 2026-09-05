import { PrismaClient, BudgetStatus, AnalyticType, EntryStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export interface CreateBudgetInput {
  name: string;
  startDate: string;
  endDate: string;
  responsibleId?: number | null;
  analyticAccountId: number;
  committedAmount: number;
  notes?: string;
}

export interface ReviseBudgetInput {
  committedAmount: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export class BudgetService {
  /**
   * Calculate live achieved amounts for a single budget based on posted journal items
   */
  private static async computeBudgetMetrics(budget: any) {
    // Query posted journal items tagged with this analytic account within the budget date range
    const items = await prisma.journalItem.findMany({
      where: {
        analyticAccountId: budget.analyticAccountId,
        journalEntry: {
          status: EntryStatus.POSTED,
          date: {
            gte: budget.startDate,
            lte: budget.endDate,
          },
        },
      },
      include: {
        account: true,
      },
    });

    let achieved = 0;
    if (budget.type === AnalyticType.EXPENSE) {
      for (const item of items) {
        achieved += Number(item.debit) - Number(item.credit);
      }
    } else {
      for (const item of items) {
        achieved += Number(item.credit) - Number(item.debit);
      }
    }

    const committed = Number(budget.committedAmount);
    const achievedPercentage = committed > 0 ? Number(((achieved / committed) * 100).toFixed(2)) : 0;
    const amountToAchieve = Number((committed - achieved).toFixed(2));

    return {
      ...budget,
      achievedAmount: achieved,
      achievedPercentage,
      amountToAchieve,
    };
  }

  /**
   * List all budgets with calculated metrics
   */
  static async listBudgets(params?: { status?: BudgetStatus; search?: string }) {
    const where: any = {};
    if (params?.status) where.status = params.status;
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search } },
        { analyticAccount: { name: { contains: params.search } } },
      ];
    }

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        analyticAccount: true,
        responsibleContact: true,
        originalBudget: { select: { id: true, name: true, committedAmount: true } },
        revisedBudgets: { select: { id: true, name: true, committedAmount: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute live metrics for each budget
    return Promise.all(budgets.map((b) => this.computeBudgetMetrics(b)));
  }

  /**
   * Get single budget with computed metrics and full revision tree
   */
  static async getBudget(id: number) {
    const budget = await prisma.budget.findUnique({
      where: { id },
      include: {
        analyticAccount: true,
        responsibleContact: true,
        originalBudget: {
          include: {
            analyticAccount: true,
            responsibleContact: true,
          },
        },
        revisedBudgets: {
          include: {
            analyticAccount: true,
            responsibleContact: true,
          },
        },
      },
    });

    if (!budget) {
      const err = new Error('Budget not found') as any;
      err.statusCode = 404;
      throw err;
    }

    return this.computeBudgetMetrics(budget);
  }

  /**
   * Create a new budget
   */
  static async createBudget(input: CreateBudgetInput) {
    const analytic = await prisma.analyticAccount.findUnique({
      where: { id: input.analyticAccountId },
    });

    if (!analytic) {
      const err = new Error('Selected Analytic Account not found') as any;
      err.statusCode = 404;
      throw err;
    }

    const budget = await prisma.budget.create({
      data: {
        name: input.name,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        responsibleId: input.responsibleId || null,
        analyticAccountId: input.analyticAccountId,
        type: analytic.type,
        committedAmount: new Decimal(input.committedAmount),
        status: BudgetStatus.DRAFT,
        notes: input.notes || null,
      },
      include: {
        analyticAccount: true,
        responsibleContact: true,
      },
    });

    return this.computeBudgetMetrics(budget);
  }

  /**
   * Confirm a budget (moves from DRAFT to CONFIRMED)
   */
  static async confirmBudget(id: number) {
    const budget = await prisma.budget.findUnique({ where: { id } });
    if (!budget) {
      const err = new Error('Budget not found') as any;
      err.statusCode = 404;
      throw err;
    }

    if (budget.status !== BudgetStatus.DRAFT) {
      const err = new Error(`Cannot confirm budget in ${budget.status} status`) as any;
      err.statusCode = 400;
      throw err;
    }

    const updated = await prisma.budget.update({
      where: { id },
      data: { status: BudgetStatus.CONFIRMED },
      include: { analyticAccount: true, responsibleContact: true },
    });

    return this.computeBudgetMetrics(updated);
  }

  /**
   * Revise a budget:
   * Sets current confirmed budget to REVISED, creates a new child budget with updated amount
   */
  static async reviseBudget(id: number, input: ReviseBudgetInput) {
    const original = await prisma.budget.findUnique({
      where: { id },
      include: { revisedBudgets: true },
    });

    if (!original) {
      const err = new Error('Original budget not found') as any;
      err.statusCode = 404;
      throw err;
    }

    if (original.status !== BudgetStatus.CONFIRMED) {
      const err = new Error('Only CONFIRMED budgets can be revised') as any;
      err.statusCode = 400;
      throw err;
    }

    return prisma.$transaction(async (tx) => {
      // 1. Mark original budget as REVISED
      await tx.budget.update({
        where: { id: original.id },
        data: { status: BudgetStatus.REVISED },
      });

      // 2. Determine revision name
      const revisionCount = original.revisedBudgets.length + 1;
      const cleanBaseName = original.name.replace(/ \(Rev \d+\)$/, '');
      const revisionName = `${cleanBaseName} (Rev ${revisionCount})`;

      // 3. Create new budget with revision link
      const newBudget = await tx.budget.create({
        data: {
          name: revisionName,
          startDate: input.startDate ? new Date(input.startDate) : original.startDate,
          endDate: input.endDate ? new Date(input.endDate) : original.endDate,
          responsibleId: original.responsibleId,
          analyticAccountId: original.analyticAccountId,
          type: original.type,
          committedAmount: new Decimal(input.committedAmount),
          status: BudgetStatus.CONFIRMED,
          notes: input.notes || `Revised from ${original.name}`,
          originalBudgetId: original.id,
        },
        include: {
          analyticAccount: true,
          responsibleContact: true,
          originalBudget: true,
        },
      });

      return newBudget;
    });
  }
}

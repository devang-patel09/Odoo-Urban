import { Request, Response, NextFunction } from 'express';
import { AccountingService } from '../services/accountingService';
import { successResponse } from '../utils/response';
import { z } from 'zod';

const manualEntrySchema = z.object({
  date: z.string(),
  journalId: z.number().int().positive(),
  reference: z.string().optional(),
  items: z.array(
    z.object({
      accountId: z.number().int().positive(),
      partnerId: z.number().int().positive().nullable().optional(),
      analyticAccountId: z.number().int().positive().nullable().optional(),
      description: z.string().optional(),
      debit: z.number().min(0),
      credit: z.number().min(0),
    })
  ).min(2),
});

export class AccountingController {
  static async listJournalEntries(req: Request, res: Response, next: NextFunction) {
    try {
      const { journalId, status, search, startDate, endDate } = req.query as any;
      const entries = await AccountingService.listJournalEntries({
        journalId: journalId ? parseInt(journalId, 10) : undefined,
        status,
        search,
        startDate,
        endDate,
      });
      return successResponse(res, entries, 'Journal entries retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getJournalEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const entry = await AccountingService.getJournalEntry(id);
      return successResponse(res, entry, 'Journal entry details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createManualJournalEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = manualEntrySchema.parse(req.body);
      const entry = await AccountingService.createManualJournalEntry(validated);
      return successResponse(res, entry, 'Manual journal entry posted successfully', 201);
    } catch (error) {
      next(error);
    }
  }
}

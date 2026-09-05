import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/reportService';
import { successResponse } from '../utils/response';

export class ReportController {
  static async getProfitAndLoss(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const report = await ReportService.getProfitAndLoss(startDate, endDate);
      return successResponse(res, report, 'Profit and Loss statement retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getBalanceSheet(req: Request, res: Response, next: NextFunction) {
    try {
      const { asOfDate } = req.query as { asOfDate?: string };
      const report = await ReportService.getBalanceSheet(asOfDate);
      return successResponse(res, report, 'Balance Sheet retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getTrialBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const report = await ReportService.getTrialBalance(startDate, endDate);
      return successResponse(res, report, 'Trial Balance retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getGeneralLedger(req: Request, res: Response, next: NextFunction) {
    try {
      const accountId = req.query.accountId ? parseInt(req.query.accountId as string, 10) : undefined;
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const report = await ReportService.getGeneralLedger(accountId, startDate, endDate);
      return successResponse(res, report, 'General Ledger retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getAgedReceivables(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await ReportService.getAgedReceivables();
      return successResponse(res, report, 'Aged Receivables retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getAgedPayables(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await ReportService.getAgedPayables();
      return successResponse(res, report, 'Aged Payables retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getDashboardKPIs(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await ReportService.getDashboardKPIs();
      return successResponse(res, report, 'Dashboard KPIs retrieved');
    } catch (error) {
      next(error);
    }
  }
}

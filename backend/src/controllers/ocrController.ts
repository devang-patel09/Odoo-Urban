import { Request, Response, NextFunction } from 'express';
import { OCRService } from '../services/ocrService';
import { successResponse } from '../utils/response';
import { z } from 'zod';

const ocrSchema = z.object({
  text: z.string().min(5),
});

export class OCRController {
  static async parseDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { text } = ocrSchema.parse(req.body);
      const parsed = await OCRService.parseDocument(text);
      return successResponse(res, parsed, 'Document parsed successfully');
    } catch (error) {
      next(error);
    }
  }
}

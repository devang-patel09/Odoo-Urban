import { Router } from 'express';
import { OCRController } from '../controllers/ocrController';
import { authenticate } from '../middleware/auth';

export const ocrRoutes = Router();

ocrRoutes.use(authenticate);
ocrRoutes.post('/parse', OCRController.parseDocument);

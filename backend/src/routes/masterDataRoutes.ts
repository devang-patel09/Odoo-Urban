import { Router } from 'express';
import { MasterDataController } from '../controllers/masterDataController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

export const contactRoutes = Router();
contactRoutes.use(authenticate);
contactRoutes.get('/', MasterDataController.listContacts);
contactRoutes.get('/:id', MasterDataController.getContact);
contactRoutes.post('/', requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]), MasterDataController.createContact);
contactRoutes.put('/:id', requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]), MasterDataController.updateContact);
contactRoutes.patch('/:id/status', requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]), MasterDataController.toggleContactStatus);

export const productRoutes = Router();
productRoutes.use(authenticate);
productRoutes.get('/', MasterDataController.listProducts);
productRoutes.get('/stock-summary', MasterDataController.getStockSummary);
productRoutes.get('/:id', MasterDataController.getProduct);
productRoutes.post('/', requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]), MasterDataController.createProduct);
productRoutes.put('/:id', requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]), MasterDataController.updateProduct);
productRoutes.patch('/:id/status', requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]), MasterDataController.toggleProductStatus);

export const categoryRoutes = Router();
categoryRoutes.use(authenticate);
categoryRoutes.get('/', MasterDataController.listCategories);
categoryRoutes.post('/', requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]), MasterDataController.createCategory);

export const accountRoutes = Router();
accountRoutes.use(authenticate);
accountRoutes.get('/', MasterDataController.listAccounts);
accountRoutes.get('/:id', MasterDataController.getAccount);
accountRoutes.post('/', requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]), MasterDataController.createAccount);
accountRoutes.put('/:id', requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]), MasterDataController.updateAccount);

export const journalRoutes = Router();
journalRoutes.use(authenticate);
journalRoutes.get('/', MasterDataController.listJournals);
journalRoutes.post('/', requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]), MasterDataController.createJournal);

export const analyticRoutes = Router();
analyticRoutes.use(authenticate);
analyticRoutes.get('/', MasterDataController.listAnalyticAccounts);
analyticRoutes.post('/', requireRole([UserRole.ADMIN, UserRole.ACCOUNTANT]), MasterDataController.createAnalyticAccount);

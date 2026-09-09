import { Router } from 'express';
import * as documentsController from '../controllers/documents.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';

const router = Router();

// Public routes
router.get('/', documentsController.getPublicDocuments);
router.get('/stats', documentsController.getStats);
router.get('/:id', documentsController.getDocument);
router.get('/:id/download', documentsController.downloadDocument);

// Admin routes (authenticated)
router.get('/admin/list', authMiddleware, documentsController.getAdminDocuments);
router.post('/', authMiddleware, uploadSingle, documentsController.createDocument);
router.put('/:id', authMiddleware, uploadSingle, documentsController.updateDocument);
router.delete('/:id', authMiddleware, documentsController.deleteDocument);

export default router;

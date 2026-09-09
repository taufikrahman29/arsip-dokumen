import { Router } from 'express';
import * as categoriesController from '../controllers/categories.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Public
router.get('/', categoriesController.getCategories);
router.get('/:id', categoriesController.getCategory);

// Admin
router.post('/', authMiddleware, categoriesController.createCategory);
router.put('/:id', authMiddleware, categoriesController.updateCategory);
router.delete('/:id', authMiddleware, categoriesController.deleteCategory);

export default router;

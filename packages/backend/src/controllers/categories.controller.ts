import { Request, Response, NextFunction } from 'express';
import * as categoriesService from '../services/categories.service.js';
import { createCategorySchema, updateCategorySchema } from '../utils/validators.js';
import { sendSuccess } from '../utils/response.js';

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await categoriesService.getCategories();
    sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
}

export async function getCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoriesService.getCategoryById(String(req.params.id));
    sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createCategorySchema.parse(req.body);
    const category = await categoriesService.createCategory(data);
    sendSuccess(res, category, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateCategorySchema.parse(req.body);
    const category = await categoriesService.updateCategory(String(req.params.id), data);
    sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    await categoriesService.deleteCategory(String(req.params.id));
    sendSuccess(res, { message: 'Kategori berhasil dihapus' });
  } catch (error) {
    next(error);
  }
}

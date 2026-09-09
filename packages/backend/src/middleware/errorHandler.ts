import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, sendError } from '../utils/response.js';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  console.error(`[ERROR] ${err.message}`, err.stack);

  // Zod validation errors
  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    sendError(res, 400, 'VALIDATION_ERROR', messages);
    return;
  }

  // Custom AppError
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message);
    return;
  }

  // Prisma errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any;
    if (prismaErr.code === 'P2002') {
      const field = prismaErr.meta?.target?.[0] || 'field';
      sendError(res, 409, 'DUPLICATE_ENTRY', `Data dengan ${field} tersebut sudah ada`);
      return;
    }
    if (prismaErr.code === 'P2025') {
      sendError(res, 404, 'NOT_FOUND', 'Data tidak ditemukan');
      return;
    }
  }

  // Multer errors
  if (err.constructor.name === 'MulterError') {
    const multerErr = err as any;
    if (multerErr.code === 'LIMIT_FILE_SIZE') {
      sendError(res, 413, 'FILE_TOO_LARGE', 'Ukuran file melebihi batas maksimum');
      return;
    }
    sendError(res, 400, 'UPLOAD_ERROR', multerErr.message);
    return;
  }

  // Generic server error
  sendError(res, 500, 'INTERNAL_ERROR', 'Terjadi kesalahan internal server');
}

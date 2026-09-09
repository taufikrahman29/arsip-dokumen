import { Request, Response, NextFunction } from 'express';
import * as documentsService from '../services/documents.service.js';
import { createDocumentSchema, updateDocumentSchema, documentQuerySchema } from '../utils/validators.js';
import { sendSuccess, sendPaginated, buildPaginationMeta, AppError } from '../utils/response.js';
import prisma from '../config/database.js';
import path from 'path';

// Public: get documents (only PUBLIC visibility)
export async function getPublicDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const query = documentQuerySchema.parse(req.query);
    const { data, total } = await documentsService.getDocuments({
      ...query,
      includePrivate: false,
    });

    const meta = buildPaginationMeta(query.page, query.limit, total);
    sendPaginated(res, data, meta);
  } catch (error) {
    next(error);
  }
}

// Admin: get all documents (PUBLIC + PRIVATE)
export async function getAdminDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const query = documentQuerySchema.parse(req.query);
    const { data, total } = await documentsService.getDocuments({
      ...query,
      includePrivate: true,
    });

    const meta = buildPaginationMeta(query.page, query.limit, total);
    sendPaginated(res, data, meta);
  } catch (error) {
    next(error);
  }
}

// Get single document
export async function getDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await documentsService.getDocumentById(String(req.params.id));
    sendSuccess(res, doc);
  } catch (error) {
    next(error);
  }
}

// Admin: create document
export async function createDocument(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      throw new AppError(400, 'FILE_REQUIRED', 'File dokumen wajib diunggah');
    }

    const input = createDocumentSchema.parse(req.body);

    // Get uploader name
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { name: true },
    });

    const doc = await documentsService.createDocument({
      ...input,
      file: req.file,
      userId: req.user!.userId,
      userName: user?.name || 'Admin',
    });

    sendSuccess(res, doc, 201);
  } catch (error) {
    next(error);
  }
}

// Admin: update document
export async function updateDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateDocumentSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { name: true },
    });

    const doc = await documentsService.updateDocument(
      String(req.params.id),
      { ...input, file: req.file },
      req.user!.userId,
      user?.name || 'Admin'
    );

    sendSuccess(res, doc);
  } catch (error) {
    next(error);
  }
}

// Admin: delete document (soft delete)
export async function deleteDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { name: true },
    });

    await documentsService.deleteDocument(
      String(req.params.id),
      req.user!.userId,
      user?.name || 'Admin'
    );

    sendSuccess(res, { message: 'Dokumen berhasil dihapus' });
  } catch (error) {
    next(error);
  }
}

// Public: download document
export async function downloadDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await documentsService.logDownload(String(req.params.id), req.ip);

    // Send file
    const filePath = doc.filePath;
    res.download(filePath, doc.fileName, (err) => {
      if (err) {
        next(new AppError(404, 'FILE_NOT_FOUND', 'File fisik tidak ditemukan di server'));
      }
    });
  } catch (error) {
    next(error);
  }
}

// Public: get document stats
export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await documentsService.getDocumentStats();
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
}

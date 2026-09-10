import prisma from '../config/database.js';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/response.js';
import { storageService } from './storage.service.js';
import { createLog } from './logs.service.js';

interface CreateDocumentInput {
  title: string;
  documentNumber?: string | null;
  description?: string | null;
  categoryId?: string | null;
  year: number;
  documentDate?: string | null;
  visibility: 'PUBLIC' | 'PRIVATE';
  file: Express.Multer.File;
  userId: string;
  userName: string;
}

interface UpdateDocumentInput {
  title?: string;
  documentNumber?: string | null;
  description?: string | null;
  categoryId?: string | null;
  year?: number;
  documentDate?: string | null;
  visibility?: 'PUBLIC' | 'PRIVATE';
  file?: Express.Multer.File;
}

interface DocumentQuery {
  search?: string;
  categoryId?: string;
  year?: number;
  visibility?: 'PUBLIC' | 'PRIVATE';
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  includePrivate?: boolean;
}

export async function getDocuments(query: DocumentQuery) {
  const { search, categoryId, year, visibility, page, limit, sortBy, sortOrder, includePrivate } = query;

  const where: any = {
    deletedAt: null, // Exclude soft-deleted
  };

  // Public endpoint: only show PUBLIC docs
  if (!includePrivate) {
    where.visibility = 'PUBLIC';
  } else if (visibility) {
    where.visibility = visibility;
  }

  if (categoryId) where.categoryId = categoryId;
  if (year) where.year = year;

  // FULLTEXT search using raw query for better MySQL FULLTEXT support
  if (search && search.trim()) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { documentNumber: { contains: search } },
    ];
  }

  const orderBy: any = {};
  const sortField = sortBy === 'created_at' ? 'createdAt' : sortBy === 'document_date' ? 'documentDate' : sortBy;
  (orderBy as any)[sortField] = sortOrder;

  const [data, total] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: { select: { id: true, name: true } },
        uploader: { select: { id: true, name: true } },
      },
    }),
    prisma.document.count({ where }),
  ]);

  // Serialize BigInt to number for JSON
  const serializedData = data.map((doc: any) => ({
    ...doc,
    fileSize: Number(doc.fileSize),
  }));

  return { data: serializedData, total };
}

export async function getDocumentById(id: string) {
  const doc = await prisma.document.findFirst({
    where: { id, deletedAt: null },
    include: {
      category: { select: { id: true, name: true } },
      uploader: { select: { id: true, name: true } },
    },
  });

  if (!doc) {
    throw new AppError(404, 'DOCUMENT_NOT_FOUND', 'Dokumen tidak ditemukan');
  }

  return { ...doc, fileSize: Number(doc.fileSize) };
}

export async function createDocument(input: CreateDocumentInput) {
  const uploadResult = storageService.processUploadedFile(input.file);

  const doc = await prisma.document.create({
    data: {
      title: input.title,
      documentNumber: input.documentNumber || null,
      description: input.description || null,
      categoryId: input.categoryId || null,
      year: input.year,
      documentDate: input.documentDate ? new Date(input.documentDate) : null,
      fileName: uploadResult.fileName,
      filePath: uploadResult.filePath,
      fileUrl: uploadResult.fileUrl,
      fileType: uploadResult.fileType,
      fileSize: uploadResult.fileSize,
      visibility: input.visibility,
      uploadedBy: input.userId,
    },
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  await createLog({
    userId: input.userId,
    userName: input.userName,
    action: 'UPLOAD',
    documentId: doc.id,
    description: `Mengunggah dokumen "${doc.title}"`,
  });

  return { ...doc, fileSize: Number(doc.fileSize) };
}

export async function updateDocument(id: string, input: UpdateDocumentInput, userId: string, userName: string) {
  const existing = await prisma.document.findFirst({ where: { id, deletedAt: null } });
  if (!existing) {
    throw new AppError(404, 'DOCUMENT_NOT_FOUND', 'Dokumen tidak ditemukan');
  }

  const updateData: any = {};

  if (input.title !== undefined) updateData.title = input.title;
  if (input.documentNumber !== undefined) updateData.documentNumber = input.documentNumber;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.categoryId !== undefined) updateData.categoryId = input.categoryId;
  if (input.year !== undefined) updateData.year = input.year;
  if (input.documentDate !== undefined) updateData.documentDate = input.documentDate ? new Date(input.documentDate) : null;
  if (input.visibility !== undefined) updateData.visibility = input.visibility;

  // Replace file if new one uploaded
  if (input.file) {
    const uploadResult = storageService.processUploadedFile(input.file);
    updateData.fileName = uploadResult.fileName;
    updateData.filePath = uploadResult.filePath;
    updateData.fileUrl = uploadResult.fileUrl;
    updateData.fileType = uploadResult.fileType;
    updateData.fileSize = uploadResult.fileSize;

    // Delete old file
    await storageService.deleteFile(existing.fileName);
  }

  const doc = await prisma.document.update({
    where: { id },
    data: updateData,
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  await createLog({
    userId,
    userName,
    action: 'UPDATE',
    documentId: doc.id,
    description: `Memperbarui dokumen "${doc.title}"`,
  });

  return { ...doc, fileSize: Number(doc.fileSize) };
}

export async function deleteDocument(id: string, userId: string, userName: string) {
  const existing = await prisma.document.findFirst({ where: { id, deletedAt: null } });
  if (!existing) {
    throw new AppError(404, 'DOCUMENT_NOT_FOUND', 'Dokumen tidak ditemukan');
  }

  // Soft delete
  await prisma.document.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  // Delete physical file
  await storageService.deleteFile(existing.fileName);

  await createLog({
    userId,
    userName,
    action: 'DELETE',
    documentId: id,
    description: `Menghapus dokumen "${existing.title}"`,
  });
}

export async function logDownload(documentId: string, ip?: string) {
  const doc = await prisma.document.findFirst({ where: { id: documentId, deletedAt: null } });
  if (!doc) {
    throw new AppError(404, 'DOCUMENT_NOT_FOUND', 'Dokumen tidak ditemukan');
  }

  await createLog({
    action: 'DOWNLOAD',
    documentId,
    description: `Dokumen "${doc.title}" diunduh${ip ? ` dari IP ${ip}` : ''}`,
  });

  return doc;
}

export async function getDocumentStats() {
  const [totalDocuments, totalPublic, totalPrivate, categoryCounts] = await Promise.all([
    prisma.document.count({ where: { deletedAt: null } }),
    prisma.document.count({ where: { deletedAt: null, visibility: 'PUBLIC' } }),
    prisma.document.count({ where: { deletedAt: null, visibility: 'PRIVATE' } }),
    prisma.category.count(),
  ]);

  return {
    totalDocuments,
    totalPublic,
    totalPrivate,
    totalCategories: categoryCounts,
  };
}

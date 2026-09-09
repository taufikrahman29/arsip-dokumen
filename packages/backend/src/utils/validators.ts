import { z } from 'zod';

// =============================================
// Auth Validators
// =============================================

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token wajib diisi'),
});

// =============================================
// Document Validators
// =============================================

export const createDocumentSchema = z.object({
  title: z.string().min(1, 'Judul dokumen wajib diisi').max(255),
  documentNumber: z.string().max(100).optional().nullable(),
  description: z.string().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  year: z.coerce.number().int().min(1900).max(2100),
  documentDate: z.string().optional().nullable(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
});

export const updateDocumentSchema = createDocumentSchema.partial();

export const documentQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  year: z.coerce.number().int().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['created_at', 'title', 'year', 'document_date']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// =============================================
// Category Validators
// =============================================

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi').max(100),
  description: z.string().optional().nullable(),
});

export const updateCategorySchema = createCategorySchema.partial();

// =============================================
// Settings Validators
// =============================================

export const updateSettingsSchema = z.object({
  siteTitle: z.string().max(255).optional(),
  siteTagline: z.string().optional(),
  institutionName: z.string().max(255).optional(),
  primaryColor: z.string().max(20).optional(),
  heroOverlayOpacity: z.coerce.number().int().min(0).max(100).optional(),
  heroOverlayColor: z.string().max(20).optional(),
});

// =============================================
// Log Query Validators
// =============================================

export const logQuerySchema = z.object({
  action: z.enum(['LOGIN', 'LOGOUT', 'UPLOAD', 'UPDATE', 'DELETE', 'DOWNLOAD']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

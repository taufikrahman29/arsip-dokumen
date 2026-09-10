import prisma from '../config/database.js';
import { AppError } from '../utils/response.js';

export async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          documents: {
            where: { deletedAt: null },
          },
        },
      },
    },
  });

  return categories.map((cat: any) => ({
    ...cat,
    documentCount: cat._count.documents,
    _count: undefined,
  }));
}

export async function getCategoryById(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          documents: {
            where: { deletedAt: null },
          },
        },
      },
    },
  });

  if (!category) {
    throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Kategori tidak ditemukan');
  }

  return {
    ...category,
    documentCount: category._count.documents,
    _count: undefined,
  };
}

export async function createCategory(data: { name: string; description?: string | null }) {
  return prisma.category.create({
    data: {
      name: data.name,
      description: data.description || null,
    },
  });
}

export async function updateCategory(id: string, data: { name?: string; description?: string | null }) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Kategori tidak ditemukan');
  }

  return prisma.category.update({
    where: { id },
    data,
  });
}

export async function deleteCategory(id: string) {
  const existing = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          documents: {
            where: { deletedAt: null },
          },
        },
      },
    },
  });

  if (!existing) {
    throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Kategori tidak ditemukan');
  }

  if (existing._count.documents > 0) {
    throw new AppError(
      400,
      'CATEGORY_HAS_DOCUMENTS',
      `Kategori "${existing.name}" masih memiliki ${existing._count.documents} dokumen. Pindahkan atau hapus dokumen terlebih dahulu.`
    );
  }

  await prisma.category.delete({ where: { id } });
}

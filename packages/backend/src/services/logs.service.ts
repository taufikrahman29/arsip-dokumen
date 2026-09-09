import prisma from '../config/database.js';
import { Action } from '@prisma/client';

interface LogParams {
  userId?: string;
  userName?: string;
  action: Action;
  documentId?: string;
  description: string;
}

export async function createLog(params: LogParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId || null,
        userName: params.userName || null,
        action: params.action,
        documentId: params.documentId || null,
        description: params.description,
      },
    });
  } catch (error) {
    // Don't throw — logging should never break the main operation
    console.error('Failed to create activity log:', error);
  }
}

export async function getLogs(query: {
  action?: Action;
  page: number;
  limit: number;
}) {
  const { action, page, limit } = query;

  const where: any = {};
  if (action) where.action = action;

  const [data, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
        document: { select: { id: true, title: true } },
      },
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { data, total };
}

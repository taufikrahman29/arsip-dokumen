import { Request, Response, NextFunction } from 'express';
import * as logsService from '../services/logs.service.js';
import { logQuerySchema } from '../utils/validators.js';
import { sendPaginated, buildPaginationMeta } from '../utils/response.js';

export async function getLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const query = logQuerySchema.parse(req.query);
    const { data, total } = await logsService.getLogs(query);
    const meta = buildPaginationMeta(query.page, query.limit, total);
    sendPaginated(res, data, meta);
  } catch (error) {
    next(error);
  }
}

import { Router } from 'express';
import * as logsController from '../controllers/logs.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Admin only
router.get('/', authMiddleware, logsController.getLogs);

export default router;

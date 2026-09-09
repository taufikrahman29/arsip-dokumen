import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Public
router.get('/', settingsController.getSettings);

// Admin (multi-file upload for logo, emblem, bg)
router.put(
  '/',
  authMiddleware,
  upload.fields([
    { name: 'siteLogo', maxCount: 1 },
    { name: 'heroEmblem', maxCount: 1 },
    { name: 'heroBg', maxCount: 1 },
  ]),
  settingsController.updateSettings
);

export default router;

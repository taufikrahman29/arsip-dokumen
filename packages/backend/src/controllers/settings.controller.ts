import { Request, Response, NextFunction } from 'express';
import * as settingsService from '../services/settings.service.js';
import { updateSettingsSchema } from '../utils/validators.js';
import { sendSuccess } from '../utils/response.js';

export async function getSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await settingsService.getSettings();
    sendSuccess(res, settings);
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateSettingsSchema.parse(req.body);

    const files: any = {};
    if (req.files && typeof req.files === 'object') {
      const fileMap = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (fileMap['siteLogo']?.[0]) files.siteLogo = fileMap['siteLogo'][0];
      if (fileMap['heroEmblem']?.[0]) files.heroEmblem = fileMap['heroEmblem'][0];
      if (fileMap['heroBg']?.[0]) files.heroBg = fileMap['heroBg'][0];
    }

    const settings = await settingsService.updateSettings(data, files);
    sendSuccess(res, settings);
  } catch (error) {
    next(error);
  }
}

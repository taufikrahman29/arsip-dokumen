import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import { loginSchema, refreshTokenSchema } from '../utils/validators.js';
import { sendSuccess } from '../utils/response.js';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await authService.login(email, password, ip, userAgent);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const result = await authService.refreshAccessToken(refreshToken);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.logout(req.user!.userId);
    sendSuccess(res, { message: 'Berhasil logout' });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getProfile(req.user!.userId);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
}

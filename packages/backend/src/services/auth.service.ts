import prisma from '../config/database.js';
import { comparePassword } from '../utils/hash.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiryDate,
  type JwtPayload,
} from '../utils/jwt.js';
import { AppError } from '../utils/response.js';
import { createLog } from './logs.service.js';

export async function login(email: string, password: string, ip?: string, userAgent?: string) {
  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email atau password salah');
  }

  // Verify password
  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email atau password salah');
  }

  // Generate tokens
  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store refresh token in session
  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      ipAddress: ip || null,
      userAgent: userAgent || null,
      expiresAt: getRefreshTokenExpiryDate(),
    },
  });

  // Log activity
  await createLog({
    userId: user.id,
    userName: user.name,
    action: 'LOGIN',
    description: `Admin ${user.name} berhasil login`,
  });

  const { password: _, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
}

export async function refreshAccessToken(refreshToken: string) {
  // Verify refresh token
  let decoded: JwtPayload;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token tidak valid atau sudah kadaluarsa');
  }

  // Check if session exists and is valid
  const session = await prisma.session.findFirst({
    where: {
      refreshToken,
      userId: decoded.userId,
      expiresAt: { gt: new Date() },
    },
  });

  if (!session) {
    throw new AppError(401, 'SESSION_NOT_FOUND', 'Sesi tidak ditemukan atau sudah berakhir');
  }

  // Get user
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) {
    throw new AppError(401, 'USER_NOT_FOUND', 'Pengguna tidak ditemukan');
  }

  // Generate new access token
  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
  const newAccessToken = generateAccessToken(payload);

  return { accessToken: newAccessToken };
}

export async function logout(userId: string) {
  // Delete all sessions for user
  await prisma.session.deleteMany({ where: { userId } });

  // Get user name for log
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });

  await createLog({
    userId,
    userName: user?.name || 'Unknown',
    action: 'LOGOUT',
    description: `Admin ${user?.name || 'Unknown'} logout`,
  });
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'Pengguna tidak ditemukan');
  }

  const { password: _, ...safeUser } = user;
  return safeUser;
}

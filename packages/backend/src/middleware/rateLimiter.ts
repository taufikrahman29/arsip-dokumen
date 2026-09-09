import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Very high limit so admin and users are never rate-limited
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Terlalu banyak permintaan, coba lagi nanti',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT',
      message: 'Terlalu banyak percobaan login, coba lagi dalam 15 menit',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

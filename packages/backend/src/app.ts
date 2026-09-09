import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import documentsRoutes from './routes/documents.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import logsRoutes from './routes/logs.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// =============================================
// Global Middleware
// =============================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

// =============================================
// Static Files (uploaded documents)
// =============================================
const uploadPath = path.resolve(env.UPLOAD_DIR);
app.use('/uploads', express.static(uploadPath));

// =============================================
// API Routes
// =============================================
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/logs', logsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    },
  });
});

// =============================================
// Error Handler (must be last)
// =============================================
app.use(errorHandler);

export default app;

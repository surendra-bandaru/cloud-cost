import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import logger from './utils/logger';
import routes from './routes';
import { initializeJobs } from './jobs';

dotenv.config();

// Run DB migrations on startup
try {
  logger.info('Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  logger.info('Database migrations completed');
} catch (e: any) {
  logger.warn('Migration failed, trying db push...', e.message);
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    logger.info('Database schema pushed successfully');
  } catch (e2: any) {
    logger.warn('DB push also failed, continuing anyway:', e2.message);
  }
}

const app = express();
const PORT = process.env.PORT || 4000;

// Health check - before rate limiter
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: '*', credentials: false }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  try {
    initializeJobs();
  } catch (e) {
    logger.warn('Jobs initialization failed, continuing without jobs');
  }
});

export default app;

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import logger from './utils/logger';
import routes from './routes';
import { initializeJobs } from './jobs';

dotenv.config();

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

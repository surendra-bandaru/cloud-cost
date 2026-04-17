import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const analyticsController = new AnalyticsController();

router.use(authenticate);

router.get('/cost-by-service', analyticsController.getCostByService);
router.get('/cost-by-region', analyticsController.getCostByRegion);
router.get('/cost-by-tag', analyticsController.getCostByTag);
router.get('/anomalies', analyticsController.detectAnomalies);
router.get('/optimization-recommendations', analyticsController.getOptimizationRecommendations);
router.get('/cost-allocation', analyticsController.getCostAllocation);

export default router;

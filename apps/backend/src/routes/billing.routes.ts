import { Router } from 'express';
import { BillingController } from '../controllers/billing.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const billingController = new BillingController();

router.use(authenticate);

router.get('/summary', billingController.getSummary);
router.get('/trends', billingController.getTrends);
router.get('/services', billingController.getServiceBreakdown);
router.get('/resources', billingController.getResourceCosts);
router.get('/forecast', billingController.getForecast);
router.post('/sync', billingController.syncBillingData);

export default router;

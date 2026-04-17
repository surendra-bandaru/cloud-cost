import { Router } from 'express';
import authRoutes from './auth.routes';
import billingRoutes from './billing.routes';
import budgetRoutes from './budget.routes';
import analyticsRoutes from './analytics.routes';
import cloudAccountRoutes from './cloudAccount.routes';
import alertRoutes from './alert.routes';
import organizationRoutes from './organization.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/billing', billingRoutes);
router.use('/budgets', budgetRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/cloud-accounts', cloudAccountRoutes);
router.use('/alerts', alertRoutes);
router.use('/organizations', organizationRoutes);

export default router;

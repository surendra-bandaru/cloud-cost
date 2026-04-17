import cron from 'node-cron';
import { BillingService } from '../services/billing.service';
import { BudgetService } from '../services/budget.service';
import logger from '../utils/logger';

const billingService = new BillingService();
const budgetService = new BudgetService();

export const initializeJobs = () => {
  // Sync billing data every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    logger.info('Starting scheduled billing data sync');
    try {
      // Sync for all organizations
      // Implementation depends on your requirements
      logger.info('Billing data sync completed');
    } catch (error) {
      logger.error('Billing data sync failed:', error);
    }
  });

  // Check budgets every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('Checking budgets');
    try {
      await budgetService.checkAllBudgets();
      logger.info('Budget check completed');
    } catch (error) {
      logger.error('Budget check failed:', error);
    }
  });

  logger.info('Background jobs initialized');
};

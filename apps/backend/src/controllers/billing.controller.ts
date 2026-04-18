import { Request, Response, NextFunction } from 'express';
import { BillingService } from '../services/billing.service';

export class BillingController {
  private billingService: BillingService;

  constructor() {
    this.billingService = new BillingService();
  }

  getSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate, provider, accountId } = req.query;
      const organizationId = req.user?.organizationId ?? '';

      const summary = await this.billingService.getSummary({
        organizationId,
        startDate: startDate as string,
        endDate: endDate as string,
        provider: provider as string,
        accountId: accountId as string,
      });

      res.json(summary);
    } catch (error) {
      next(error);
    }
  };

  getTrends = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { period, groupBy } = req.query;
      const organizationId = req.user?.organizationId ?? '';

      const trends = await this.billingService.getTrends({
        organizationId,
        period: period as string,
        groupBy: groupBy as string,
      });

      res.json(trends);
    } catch (error) {
      next(error);
    }
  };

  getServiceBreakdown = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;
      const organizationId = req.user?.organizationId ?? '';

      const breakdown = await this.billingService.getServiceBreakdown({
        organizationId,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json(breakdown);
    } catch (error) {
      next(error);
    }
  };

  getResourceCosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate, limit } = req.query;
      const organizationId = req.user?.organizationId ?? '';

      const resources = await this.billingService.getResourceCosts({
        organizationId,
        startDate: startDate as string,
        endDate: endDate as string,
        limit: limit ? parseInt(limit as string) : 50,
      });

      res.json(resources);
    } catch (error) {
      next(error);
    }
  };

  getForecast = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { days } = req.query;
      const organizationId = req.user?.organizationId ?? '';

      const forecast = await this.billingService.getForecast({
        organizationId,
        days: days ? parseInt(days as string) : 30,
      });

      res.json(forecast);
    } catch (error) {
      next(error);
    }
  };

  syncBillingData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { accountId } = req.body;
      const organizationId = req.user?.organizationId ?? '';

      console.log(`Starting billing sync for org: ${organizationId}, account: ${accountId || 'all'}`);
      const result = await this.billingService.syncBillingData(organizationId, accountId);
      console.log('Billing sync result:', result);

      res.json({ message: 'Sync complete', result });
    } catch (error: any) {
      console.error('Billing sync error:', error.message);
      next(error);
    }
  };
}

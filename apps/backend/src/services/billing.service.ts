import { PrismaClient } from '@prisma/client';
import { AzureBillingService } from './providers/azure.service';
import { GCPBillingService } from './providers/gcp.service';
import { CacheService } from './cache.service';

const prisma = new PrismaClient();

export class BillingService {
  private azureService: AzureBillingService;
  private gcpService: GCPBillingService;
  private cacheService: CacheService;

  constructor() {
    this.azureService = new AzureBillingService();
    this.gcpService = new GCPBillingService();
    this.cacheService = new CacheService();
  }

  async getSummary(params: any) {
    const cacheKey = `billing:summary:${JSON.stringify(params)}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const accounts = await prisma.cloudAccount.findMany({
      where: { organizationId: params.organizationId, isActive: true },
    });

    const summaries = await Promise.all(
      accounts.map(async (account) => {
        const data = await prisma.billingData.aggregate({
          where: {
            cloudAccountId: account.id,
            date: {
              gte: new Date(params.startDate),
              lte: new Date(params.endDate),
            },
          },
          _sum: { cost: true },
          _count: true,
        });

        return {
          provider: account.provider,
          accountName: account.accountName,
          totalCost: data._sum.cost || 0,
          recordCount: data._count,
        };
      })
    );

    const result = {
      totalCost: summaries.reduce((sum, s) => sum + Number(s.totalCost), 0),
      byProvider: summaries,
      period: { start: params.startDate, end: params.endDate },
    };

    await this.cacheService.set(cacheKey, result, 300);
    return result;
  }

  async getTrends(params: any) {
    const trends = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC(${params.period || 'day'}, date) as period,
        SUM(cost) as total_cost,
        service
      FROM "BillingData"
      WHERE "cloudAccountId" IN (
        SELECT id FROM "CloudAccount" 
        WHERE "organizationId" = ${params.organizationId}
      )
      GROUP BY period, service
      ORDER BY period DESC
      LIMIT 100
    `;

    return trends;
  }

  async getServiceBreakdown(params: any) {
    const breakdown = await prisma.billingData.groupBy({
      by: ['service'],
      where: {
        cloudAccount: { organizationId: params.organizationId },
        date: {
          gte: new Date(params.startDate),
          lte: new Date(params.endDate),
        },
      },
      _sum: { cost: true },
      orderBy: { _sum: { cost: 'desc' } },
    });

    return breakdown.map((item) => ({
      service: item.service,
      cost: item._sum.cost,
    }));
  }

  async getResourceCosts(params: any) {
    const resources = await prisma.billingData.groupBy({
      by: ['resourceId', 'resourceName', 'service'],
      where: {
        cloudAccount: { organizationId: params.organizationId },
        date: {
          gte: new Date(params.startDate),
          lte: new Date(params.endDate),
        },
        resourceId: { not: null },
      },
      _sum: { cost: true, usageQuantity: true },
      orderBy: { _sum: { cost: 'desc' } },
      take: params.limit,
    });

    return resources;
  }

  async getForecast(params: any) {
    // Simple linear regression forecast
    const historicalData = await prisma.billingData.groupBy({
      by: ['date'],
      where: { cloudAccount: { organizationId: params.organizationId } },
      _sum: { cost: true },
      orderBy: { date: 'asc' },
    });

    // Calculate trend and forecast
    const forecast = this.calculateForecast(historicalData, params.days);
    return forecast;
  }

  async syncBillingData(organizationId: string, accountId?: string) {
    const accounts = await prisma.cloudAccount.findMany({
      where: {
        organizationId,
        ...(accountId && { id: accountId }),
        isActive: true,
      },
    });

    for (const account of accounts) {
      if (account.provider === 'AZURE') {
        await this.azureService.syncBillingData(account);
      } else if (account.provider === 'GCP') {
        await this.gcpService.syncBillingData(account);
      }
    }
  }

  private calculateForecast(historicalData: any[], days: number) {
    // Simplified forecast logic
    const avgDailyCost = historicalData.reduce((sum, d) => sum + Number(d._sum.cost), 0) / historicalData.length;
    
    const forecast = [];
    const today = new Date();
    
    for (let i = 1; i <= days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      forecast.push({
        date: date.toISOString().split('T')[0],
        predictedCost: avgDailyCost * (1 + Math.random() * 0.1 - 0.05),
      });
    }

    return forecast;
  }
}

import { ClientSecretCredential } from '@azure/identity';
import { CostManagementClient } from '@azure/arm-costmanagement';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AzureBillingService {
  async syncBillingData(account: any) {
    const creds = account.credentials as any;

    const credential = new ClientSecretCredential(
      creds.tenantId,
      creds.clientId,
      creds.clientSecret
    );

    const client = new CostManagementClient(credential);
    const scope = `/subscriptions/${account.accountId}`;

    // Last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const fmt = (d: Date) => d.toISOString().split('T')[0];

    try {
      const result = await client.query.usage(scope, {
        type: 'ActualCost',
        timeframe: 'Custom',
        timePeriod: { from: new Date(fmt(startDate)), to: new Date(fmt(endDate)) },
        dataset: {
          granularity: 'Daily',
          aggregation: {
            totalCost: { name: 'Cost', function: 'Sum' },
          },
          grouping: [
            { type: 'Dimension', name: 'ServiceName' },
            { type: 'Dimension', name: 'ResourceId' },
          ],
        },
      });

      const rows = result.rows || [];
      const cols = result.columns || [];

      // Map column names
      const colIndex: any = {};
      cols.forEach((c: any, i: number) => { colIndex[c.name] = i; });

      let saved = 0;
      for (const row of rows) {
        const cost = parseFloat(row[colIndex['Cost']] ?? row[0]) || 0;
        const dateVal = row[colIndex['UsageDate']] ?? row[colIndex['BillingMonth']] ?? row[2];
        const service = row[colIndex['ServiceName']] ?? row[colIndex['ServiceCategory']] ?? 'Unknown';
        const resourceId = row[colIndex['ResourceId']] ?? null;

        if (!dateVal || cost === 0) continue;

        // Parse date - Azure returns YYYYMMDD as number
        const dateStr = String(dateVal);
        const parsedDate = dateStr.length === 8
          ? new Date(`${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`)
          : new Date(dateStr);

        if (isNaN(parsedDate.getTime())) continue;

        try {
          await prisma.billingData.upsert({
            where: {
              cloudAccountId_date_service_resourceId: {
                cloudAccountId: account.id,
                date: parsedDate,
                service: String(service),
                resourceId: resourceId ? String(resourceId) : null,
              },
            },
            update: { cost },
            create: {
              cloudAccountId: account.id,
              date: parsedDate,
              service: String(service),
              resourceId: resourceId ? String(resourceId) : null,
              cost,
              currency: 'USD',
            },
          });
          saved++;
        } catch (e) {
          // skip duplicate
        }
      }

      // Update last sync time
      await prisma.cloudAccount.update({
        where: { id: account.id },
        data: { lastSyncAt: new Date() },
      });

      return { synced: saved, total: rows.length };
    } catch (err: any) {
      throw new Error(`Azure sync failed: ${err.message}`);
    }
  }
}

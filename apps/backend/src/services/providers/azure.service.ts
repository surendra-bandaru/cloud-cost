import { ClientSecretCredential } from '@azure/identity';
import { ConsumptionManagementClient } from '@azure/arm-consumption';
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

    const client = new ConsumptionManagementClient(credential, account.accountId);
    const scope = `/subscriptions/${account.accountId}`;

    // Last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const fmt = (d: Date) => d.toISOString().split('T')[0];

    try {
      console.log(`Starting Azure sync for account: ${account.accountId}, scope: ${scope}`);

      const usageDetails = client.usageDetails.list(scope, {
        expand: 'properties/meterDetails',
        filter: `properties/usageStart ge '${fmt(startDate)}' AND properties/usageEnd le '${fmt(endDate)}'`,
      });

      let saved = 0;
      let skipped = 0;
      let debugged = false;
      for await (const item of usageDetails) {
        const props = (item as any).properties || {};

        // Log first item to see actual field names
        if (!debugged) {
          console.log('Azure item sample:', JSON.stringify(item, null, 2).slice(0, 1000));
          console.log('Azure props keys:', Object.keys(props));
          debugged = true;
        }

        // Try all possible cost field names Azure uses
        const cost = parseFloat(
          props.pretaxCost ??
          props.cost ??
          props.costInBillingCurrency ??
          props.effectivePrice ??
          props.paygCostInBillingCurrency ??
          props.quantity ??
          0
        );
        const service = props.consumedService || props.meterDetails?.meterCategory || props.product || props.meterCategory || 'Unknown';
        const resourceId = props.instanceId || props.resourceId || props.resourceGroup || null;
        const dateStr = props.usageStart || props.date || props.billingPeriodStartDate;

        if (!dateStr) { skipped++; continue; }

        const parsedDate = new Date(dateStr);
        if (isNaN(parsedDate.getTime())) { skipped++; continue; }

        try {
          await prisma.billingData.upsert({
            where: {
              cloudAccountId_date_service_resourceId: {
                cloudAccountId: account.id,
                date: parsedDate,
                service: String(service).slice(0, 255),
                resourceId: resourceId ? String(resourceId).slice(0, 500) : 'unknown',
              },
            },
            update: { cost },
            create: {
              cloudAccountId: account.id,
              date: parsedDate,
              service: String(service).slice(0, 255),
              resourceId: resourceId ? String(resourceId).slice(0, 500) : 'unknown',
              resourceName: props.resourceName || null,
              region: props.resourceLocation || null,
              cost,
              currency: props.billingCurrency || 'USD',
            },
          });
          saved++;
        } catch (e) {
          skipped++;
        }
      }

      console.log(`Azure sync complete: ${saved} saved, ${skipped} skipped`);

      await prisma.cloudAccount.update({
        where: { id: account.id },
        data: { lastSyncAt: new Date() },
      });

      return { synced: saved, skipped };
    } catch (err: any) {
      console.error('Azure sync error:', err.message);
      throw new Error(`Azure sync failed: ${err.message}`);
    }
  }
}

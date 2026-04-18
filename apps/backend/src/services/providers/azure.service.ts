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
      const usageDetails = client.usageDetails.list(scope, {
        expand: 'properties/meterDetails',
        filter: `properties/usageStart ge '${fmt(startDate)}' AND properties/usageEnd le '${fmt(endDate)}'`,
      });

      let saved = 0;
      for await (const item of usageDetails) {
        const props = (item as any).properties || {};
        const cost = parseFloat(props.pretaxCost ?? props.cost ?? props.costInBillingCurrency ?? 0);
        const service = props.consumedService || props.meterDetails?.meterCategory || props.product || 'Unknown';
        const resourceId = props.instanceId || props.resourceId || null;
        const dateStr = props.usageStart || props.date;

        if (!dateStr || cost === 0) continue;

        const parsedDate = new Date(dateStr);
        if (isNaN(parsedDate.getTime())) continue;

        try {
          await prisma.billingData.upsert({
            where: {
              cloudAccountId_date_service_resourceId: {
                cloudAccountId: account.id,
                date: parsedDate,
                service: String(service).slice(0, 255),
                resourceId: resourceId ? String(resourceId).slice(0, 500) : null,
              },
            },
            update: { cost },
            create: {
              cloudAccountId: account.id,
              date: parsedDate,
              service: String(service).slice(0, 255),
              resourceId: resourceId ? String(resourceId).slice(0, 500) : null,
              resourceName: props.resourceName || null,
              region: props.resourceLocation || null,
              cost,
              currency: props.billingCurrency || 'USD',
            },
          });
          saved++;
        } catch (e) {
          // skip duplicates
        }
      }

      await prisma.cloudAccount.update({
        where: { id: account.id },
        data: { lastSyncAt: new Date() },
      });

      return { synced: saved };
    } catch (err: any) {
      throw new Error(`Azure sync failed: ${err.message}`);
    }
  }
}

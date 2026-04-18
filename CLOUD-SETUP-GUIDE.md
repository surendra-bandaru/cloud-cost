# Cloud Provider Setup Guide

This guide explains how to set up Azure and GCP accounts to connect with the Cloud Billing Platform.

## Azure Setup

### Prerequisites
- Azure subscription with billing access
- Azure CLI installed (optional but recommended)
- Owner or Contributor role on the subscription

### Step 1: Create Service Principal

#### Option A: Using Azure CLI (Recommended)
```bash
# Login to Azure
az login

# Create Service Principal with Cost Management Reader role
az ad sp create-for-rbac \
  --name "CloudBillingApp" \
  --role "Cost Management Reader" \
  --scopes /subscriptions/{SUBSCRIPTION_ID}

# Output will show:
# {
#   "appId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",      # This is your Client ID
#   "displayName": "CloudBillingApp",
#   "password": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",          # This is your Client Secret
#   "tenant": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"      # This is your Tenant ID
# }
```

#### Option B: Using Azure Portal
1. Go to Azure Portal → Azure Active Directory
2. Navigate to App registrations → New registration
3. Name: "CloudBillingApp"
4. Click Register
5. Copy the **Application (client) ID** and **Directory (tenant) ID**
6. Go to Certificates & secrets → New client secret
7. Copy the **Client Secret Value** (you won't see it again!)
8. Go to your Subscription → Access control (IAM)
9. Add role assignment → "Cost Management Reader"
10. Select the app you just created

### Step 2: Assign Required Permissions

The Service Principal needs these roles at the Subscription level:
- **Cost Management Reader** - To read billing and cost data
- **Reader** (optional) - To read resource metadata

```bash
# Assign Cost Management Reader role
az role assignment create \
  --assignee {CLIENT_ID} \
  --role "Cost Management Reader" \
  --scope /subscriptions/{SUBSCRIPTION_ID}

# Optionally assign Reader role for resource details
az role assignment create \
  --assignee {CLIENT_ID} \
  --role "Reader" \
  --scope /subscriptions/{SUBSCRIPTION_ID}
```

### Step 3: Get Subscription ID

```bash
# List all subscriptions
az account list --output table

# Or get current subscription
az account show --query id -o tsv
```

### Step 4: Test the Service Principal

```bash
# Login as Service Principal
az login --service-principal \
  -u {CLIENT_ID} \
  -p {CLIENT_SECRET} \
  --tenant {TENANT_ID}

# Test cost management access
az consumption usage list --top 5
```

### Required Information for App
- **Tenant ID**: Your Azure AD tenant ID
- **Client ID**: Service Principal application ID
- **Client Secret**: Service Principal password/secret
- **Subscription ID**: Your Azure subscription ID

---

## GCP Setup

### Prerequisites
- GCP project with billing enabled
- Billing Account access
- Project Owner or Billing Account Administrator role

### Step 1: Enable Required APIs

```bash
# Set your project
gcloud config set project {PROJECT_ID}

# Enable Cloud Billing API
gcloud services enable cloudbilling.googleapis.com

# Enable BigQuery API (if using BigQuery export)
gcloud services enable bigquery.googleapis.com
```

### Step 2: Create Service Account

#### Using gcloud CLI:
```bash
# Create Service Account
gcloud iam service-accounts create billing-app \
  --display-name="Cloud Billing Application" \
  --description="Service account for billing data access"

# Get the Service Account email
SA_EMAIL=$(gcloud iam service-accounts list \
  --filter="displayName:Cloud Billing Application" \
  --format="value(email)")

echo "Service Account: $SA_EMAIL"
```

### Step 3: Assign IAM Roles

#### At Project Level:
```bash
# Assign Viewer role
gcloud projects add-iam-policy-binding {PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/viewer"

# Assign BigQuery Data Viewer (if using BigQuery export)
gcloud projects add-iam-policy-binding {PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/bigquery.dataViewer"
```

#### At Billing Account Level:
```bash
# Get your Billing Account ID
gcloud billing accounts list

# Assign Billing Account Viewer role
gcloud billing accounts add-iam-policy-binding {BILLING_ACCOUNT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/billing.viewer"
```

### Step 4: Create and Download Service Account Key

```bash
# Create JSON key
gcloud iam service-accounts keys create ~/billing-app-key.json \
  --iam-account=${SA_EMAIL}

# View the key (copy this entire JSON)
cat ~/billing-app-key.json
```

**⚠️ Security Warning**: Keep this JSON key secure! It provides access to your GCP resources.

### Step 5: Get Billing Account ID

```bash
# List billing accounts
gcloud billing accounts list

# Output shows:
# ACCOUNT_ID            NAME                OPEN  MASTER_ACCOUNT_ID
# 012345-6789AB-CDEF01  My Billing Account  True
```

### Step 6: (Optional) Set up BigQuery Billing Export

For detailed billing data:

1. Go to GCP Console → Billing → Billing export
2. Enable BigQuery export
3. Select or create a dataset (e.g., `billing_export`)
4. Note the dataset name for configuration

### Required Information for App
- **Project ID**: Your GCP project ID
- **Billing Account ID**: Format like `012345-6789AB-CDEF01`
- **Service Account Key**: The entire JSON key file content

---

## Security Best Practices

### Azure
1. **Rotate secrets regularly**: Update Client Secret every 90 days
2. **Use least privilege**: Only assign Cost Management Reader, not Owner
3. **Enable MFA**: For accounts that manage Service Principals
4. **Monitor access**: Review Service Principal sign-ins regularly
5. **Use Azure Key Vault**: Store secrets in Key Vault instead of app config

### GCP
1. **Rotate keys regularly**: Create new Service Account keys every 90 days
2. **Use least privilege**: Only assign necessary roles
3. **Enable audit logging**: Monitor Service Account usage
4. **Use Secret Manager**: Store keys in GCP Secret Manager
5. **Set key expiration**: Configure automatic key rotation

### General
1. **Never commit credentials**: Don't store credentials in code or git
2. **Use environment variables**: Store credentials as env vars or secrets
3. **Encrypt at rest**: Ensure database encryption for stored credentials
4. **Audit regularly**: Review connected accounts and their permissions
5. **Implement IP restrictions**: Limit API access to known IPs if possible

---

## Troubleshooting

### Azure Issues

**Error: "Insufficient permissions"**
- Verify Service Principal has "Cost Management Reader" role
- Check role assignment at correct scope (Subscription level)
- Wait 5-10 minutes for role propagation

**Error: "Invalid client secret"**
- Client secret may have expired
- Create new client secret in Azure Portal
- Update credentials in the app

**Error: "Subscription not found"**
- Verify Subscription ID is correct
- Ensure Service Principal has access to the subscription

### GCP Issues

**Error: "Permission denied"**
- Verify Service Account has "Billing Account Viewer" role
- Check role assignment at Billing Account level
- Wait a few minutes for IAM propagation

**Error: "API not enabled"**
- Enable Cloud Billing API: `gcloud services enable cloudbilling.googleapis.com`
- Enable in Console: APIs & Services → Enable APIs and Services

**Error: "Invalid service account key"**
- Ensure entire JSON key is copied correctly
- Check for extra spaces or line breaks
- Verify key hasn't been deleted in GCP Console

---

## Testing Your Setup

### Test Azure Connection
```bash
# Using Azure CLI
az login --service-principal \
  -u {CLIENT_ID} \
  -p {CLIENT_SECRET} \
  --tenant {TENANT_ID}

# Fetch cost data
az consumption usage list --top 5
```

### Test GCP Connection
```bash
# Authenticate with Service Account
gcloud auth activate-service-account --key-file=billing-app-key.json

# Test billing API access
gcloud billing accounts list
```

---

## Next Steps

After setting up your cloud provider credentials:

1. Navigate to **Settings** in the Cloud Billing Platform
2. Select your cloud provider (Azure or GCP)
3. Enter the required credentials
4. Click **Connect** to save the configuration
5. Go to **Dashboard** to view your billing data
6. Set up **Budgets** and **Alerts** for cost monitoring

For support, contact your platform administrator.

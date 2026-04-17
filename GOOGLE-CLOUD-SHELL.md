# Running on Google Cloud Shell

Google Cloud Shell has some limitations. Here's how to work around them:

## Issue: Docker Compose Version

Google Cloud Shell uses an older Docker Compose version that doesn't support version 3.8.

### Solution: Pull Latest Changes

```bash
cd ~/cloud-cost
git pull
```

The docker-compose files have been updated to use version 3.3 which is compatible.

## Quick Start on Google Cloud Shell

### Step 1: Clone Repository
```bash
cd ~
git clone https://github.com/surendra-bandaru/cloud-cost.git
cd cloud-cost
```

### Step 2: Check Docker Compose Version
```bash
docker-compose --version
```

### Step 3: Start Services

**Option A: Infrastructure Only (Recommended)**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

**Option B: Full Stack**
```bash
docker-compose up -d --build
```

### Step 4: Check Status
```bash
docker-compose ps
```

### Step 5: View Logs
```bash
docker-compose logs -f
```

## If You Still Get Version Errors

Try using the v2 compatible file:
```bash
docker-compose -f docker-compose.v2.yml up -d --build
```

## Install Node.js (if not already installed)

```bash
# Check Node.js version
node --version

# If not installed or old version, install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

## Setup Backend

```bash
cd ~/cloud-cost/apps/backend

# Copy environment file
cp .env.example .env

# Edit with your credentials
nano .env

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push
```

## Setup Frontend

```bash
cd ~/cloud-cost/apps/frontend

# Install dependencies
npm install
```

## Run Development Servers

### Terminal 1: Backend
```bash
cd ~/cloud-cost/apps/backend
npm run dev
```

### Terminal 2: Frontend
```bash
cd ~/cloud-cost/apps/frontend
npm run dev
```

## Access the Application

Google Cloud Shell provides a web preview feature:

1. Click the **Web Preview** button (🔍) in the top right
2. Select **Preview on port 3000** for frontend
3. Or **Change port** to 4000 for backend API

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
sudo lsof -i :5432

# Kill process
sudo kill -9 <PID>
```

### Docker Permission Denied
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Restart shell or run
newgrp docker
```

### Out of Disk Space
```bash
# Clean up Docker
docker system prune -a

# Check disk usage
df -h
```

### Can't Connect to Database
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Test connection
docker exec -it billing-postgres psql -U billing_user -d billing_db
```

## Environment Variables for Cloud Shell

Update `apps/backend/.env`:

```env
# Database (use Docker container)
DATABASE_URL=postgresql://billing_user:billing_pass@localhost:5432/billing_db

# Redis (use Docker container)
REDIS_URL=redis://localhost:6379

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=4000
NODE_ENV=development

# CORS (Cloud Shell URL)
CORS_ORIGIN=https://3000-cs-xxxxx.cloudshell.dev

# Azure (your credentials)
AZURE_TENANT_ID=your-azure-tenant-id
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_SUBSCRIPTION_ID=your-azure-subscription-id

# GCP (your credentials)
GCP_PROJECT_ID=steptoe-130426
GCP_BILLING_ACCOUNT_ID=your-billing-account-id
GOOGLE_APPLICATION_CREDENTIALS=./gcp-service-account.json
```

## GCP Service Account Setup

Since you're already in GCP, you can use Application Default Credentials:

```bash
# Authenticate
gcloud auth application-default login

# Or create a service account
gcloud iam service-accounts create billing-app \
    --display-name="Billing Application"

# Grant permissions
gcloud projects add-iam-policy-binding steptoe-130426 \
    --member="serviceAccount:billing-app@steptoe-130426.iam.gserviceaccount.com" \
    --role="roles/billing.viewer"

# Create key
gcloud iam service-accounts keys create ~/cloud-cost/apps/backend/gcp-service-account.json \
    --iam-account=billing-app@steptoe-130426.iam.gserviceaccount.com
```

## Enable BigQuery Billing Export

1. Go to **Billing** in GCP Console
2. Click **Billing export**
3. Enable **BigQuery export**
4. Note the dataset name (usually `billing_export`)

## Useful Commands

```bash
# Stop all containers
docker-compose down

# Restart containers
docker-compose restart

# View container logs
docker-compose logs -f backend

# Execute command in container
docker exec -it billing-backend sh

# Check running containers
docker ps

# Check Docker Compose version
docker-compose --version

# Update Docker Compose (if needed)
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## Cloud Shell Limitations

- **Session Timeout**: Cloud Shell sessions timeout after 20 minutes of inactivity
- **Disk Space**: Limited to 5GB in home directory
- **Memory**: Limited resources compared to local machine
- **Persistence**: Files in `/tmp` are not persistent

## Recommended Workflow

1. Use Cloud Shell for quick testing and demos
2. Use local development for serious work
3. Keep your code in GitHub
4. Use `git pull` to sync changes

## Next Steps

1. Configure your Azure and GCP credentials
2. Test the API endpoints
3. Access the frontend via Web Preview
4. Deploy to Cloud Run or App Engine for production

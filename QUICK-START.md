# Quick Start Guide

## TL;DR - Get Started in 5 Minutes

### Step 1: Start Infrastructure
```bash
docker-compose -f docker-compose.dev.yml up -d
```
This starts **only** PostgreSQL and Redis in Docker.

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup Backend
```bash
cd apps/backend
cp .env.example .env
npx prisma generate
npx prisma db push
cd ../..
```

### Step 4: Run the Apps
```bash
npm run dev
```

### Step 5: Open Browser
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

---

## What's Running Where?

```
┌─────────────────────────────────────┐
│  IN DOCKER (docker-compose.dev.yml) │
├─────────────────────────────────────┤
│  PostgreSQL  → localhost:5432       │
│  Redis       → localhost:6379       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ON YOUR MACHINE (npm run dev)      │
├─────────────────────────────────────┤
│  Backend     → localhost:4000       │
│  Frontend    → localhost:3000       │
└─────────────────────────────────────┘
```

---

## Common Commands

```bash
# Check what's running in Docker
docker ps

# View database logs
docker logs billing-postgres

# Stop Docker containers
docker-compose -f docker-compose.dev.yml down

# Restart Docker containers
docker-compose -f docker-compose.dev.yml restart

# View all logs
docker-compose -f docker-compose.dev.yml logs -f
```

---

## Troubleshooting

### Port 5432 already in use?
```bash
# Stop local PostgreSQL if running
# Or change port in docker-compose.dev.yml:
ports:
  - "5433:5432"  # Use 5433 instead
```

### Can't connect to database?
```bash
# Check if PostgreSQL is running
docker ps

# Test connection
docker exec -it billing-postgres psql -U billing_user -d billing_db
```

### Need to reset database?
```bash
# Stop and remove volumes
docker-compose -f docker-compose.dev.yml down -v

# Start fresh
docker-compose -f docker-compose.dev.yml up -d

# Recreate schema
cd apps/backend
npx prisma db push
```

---

## Next Steps

1. Configure Azure credentials in `apps/backend/.env`
2. Configure GCP credentials in `apps/backend/.env`
3. Create your first user at http://localhost:3000/register
4. Start building features!

---

## File Structure

```
cloud-cost/
├── docker-compose.dev.yml    ← Infrastructure only (USE THIS!)
├── docker-compose.yml         ← Full stack (for testing)
├── apps/
│   ├── backend/              ← Node.js API
│   │   ├── .env.example      ← Copy to .env
│   │   └── src/
│   └── frontend/             ← Next.js App
│       └── src/
└── package.json              ← Root package.json
```

---

## Why Two Docker Compose Files?

**docker-compose.dev.yml** (Recommended)
- Only runs PostgreSQL + Redis
- You run backend/frontend locally
- Fast development with hot-reload
- Easy debugging

**docker-compose.yml** (For testing)
- Runs everything in Docker
- Slower but production-like
- Good for final testing

**Use dev.yml for daily work!** 🚀

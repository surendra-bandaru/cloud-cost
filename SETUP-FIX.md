# Registration Fix - Quick Setup

## Issues Fixed:
1. ✅ Error message format mismatch between frontend and backend
2. ✅ Frontend now properly displays backend error messages

## Required Steps to Get Registration Working:

### 1. Install Dependencies
```bash
# Backend
cd apps/backend
npm install

# Frontend  
cd ../frontend
npm install
```

### 2. Setup Database
```bash
cd apps/backend

# Start PostgreSQL (choose one):
# - Docker: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=billing_pass -e POSTGRES_USER=billing_user -e POSTGRES_DB=billing_db postgres:15
# - Or use existing PostgreSQL instance

# Create .env file
cp .env.example .env

# Edit .env and set:
DATABASE_URL=postgresql://billing_user:billing_pass@localhost:5432/billing_db
JWT_SECRET=your-secret-key-here-change-this

# Run migrations
npx prisma migrate dev
```

### 3. Start Services
```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - Frontend
cd apps/frontend
npm run dev
```

### 4. Test Registration
- Open http://localhost:3000/register
- Fill in all fields (organizationName is required)
- You should now see proper error messages if something fails

## Common Errors You Might See Now:

- "User already exists" - Email is taken, use different email
- "Database connection failed" - Check DATABASE_URL in .env
- "Invalid JWT" - Set JWT_SECRET in .env

## Quick Test:
```bash
# Test backend health
curl http://localhost:4000/health

# Test registration
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "organizationName": "Test Org"
  }'
```

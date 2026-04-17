# Docker Compose Files Comparison

## Quick Answer
**`docker-compose.dev.yml`** = Only infrastructure (PostgreSQL + Redis)  
**`docker-compose.yml`** = Everything (PostgreSQL + Redis + Backend + Frontend)

---

## Detailed Comparison

### docker-compose.dev.yml (Infrastructure Only)
```yaml
services:
  postgres:  ✅ Database
  redis:     ✅ Cache
  backend:   ❌ Not included
  frontend:  ❌ Not included
```

**Use this when:**
- You want to run backend/frontend on your local machine (not in Docker)
- You need fast development with hot-reload
- You want to debug easily with your IDE
- You're actively developing and making frequent code changes

**Command:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

**Then run locally:**
```bash
npm install
npm run dev
```

---

### docker-compose.yml (Full Stack)
```yaml
services:
  postgres:  ✅ Database
  redis:     ✅ Cache
  backend:   ✅ Node.js API (in Docker)
  frontend:  ✅ Next.js App (in Docker)
```

**Use this when:**
- You want everything running in Docker containers
- You want to test production-like environment
- You want to share exact setup with team
- You don't want to install Node.js locally

**Command:**
```bash
docker-compose up -d --build
```

---

## Visual Workflow Comparison

### Workflow 1: Using docker-compose.dev.yml (Recommended for Development)

```
┌─────────────────────────────────────────────┐
│  Your Computer (Windows)                    │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Docker Containers                  │   │
│  │  ┌──────────┐    ┌──────────┐      │   │
│  │  │PostgreSQL│    │  Redis   │      │   │
│  │  │  :5432   │    │  :6379   │      │   │
│  │  └──────────┘    └──────────┘      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Running Locally (Fast!)            │   │
│  │  ┌──────────┐    ┌──────────┐      │   │
│  │  │ Backend  │    │ Frontend │      │   │
│  │  │  :4000   │    │  :3000   │      │   │
│  │  │ (Node.js)│    │ (Next.js)│      │   │
│  │  └──────────┘    └──────────┘      │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Advantages:**
- ⚡ Fast hot-reload (instant code changes)
- 🐛 Easy debugging with breakpoints
- 💻 Use your favorite IDE tools
- 📦 Direct access to node_modules
- 🔧 Easy to run tests

**Disadvantages:**
- Need Node.js installed (v18+)
- Different environment than production

---

### Workflow 2: Using docker-compose.yml (Full Docker)

```
┌─────────────────────────────────────────────┐
│  Your Computer (Windows)                    │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  All in Docker Containers           │   │
│  │  ┌──────────┐    ┌──────────┐      │   │
│  │  │PostgreSQL│    │  Redis   │      │   │
│  │  │  :5432   │    │  :6379   │      │   │
│  │  └──────────┘    └──────────┘      │   │
│  │                                     │   │
│  │  ┌──────────┐    ┌──────────┐      │   │
│  │  │ Backend  │    │ Frontend │      │   │
│  │  │  :4000   │    │  :3000   │      │   │
│  │  │ (Docker) │    │ (Docker) │      │   │
│  │  └──────────┘    └──────────┘      │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Advantages:**
- 🎯 Exact production environment
- 🚀 Easy to share with team
- 📦 No local Node.js needed
- 🔒 Isolated dependencies

**Disadvantages:**
- Slower hot-reload
- Harder to debug
- More resource intensive
- Need to rebuild on changes

---

## Real-World Usage Examples

### Example 1: Daily Development
```bash
# Morning: Start infrastructure
docker-compose -f docker-compose.dev.yml up -d

# Check if running
docker ps

# Run your apps locally
cd apps/backend
npm run dev

# In another terminal
cd apps/frontend
npm run dev

# Evening: Stop infrastructure
docker-compose -f docker-compose.dev.yml down
```

### Example 2: Testing Full Stack
```bash
# Build and start everything
docker-compose up -d --build

# Check logs
docker-compose logs -f backend

# Test the app
# Open http://localhost:3000

# Stop everything
docker-compose down
```

### Example 3: Fresh Start
```bash
# Stop and remove everything including data
docker-compose down -v

# Start fresh
docker-compose -f docker-compose.dev.yml up -d

# Recreate database
cd apps/backend
npx prisma db push
```

---

## Which Should You Use?

### Use `docker-compose.dev.yml` if:
- ✅ You're actively developing
- ✅ You make frequent code changes
- ✅ You want fast feedback
- ✅ You have Node.js installed
- ✅ You want to use IDE debugging

### Use `docker-compose.yml` if:
- ✅ You want to test the full stack
- ✅ You're demonstrating to someone
- ✅ You don't have Node.js installed
- ✅ You want production-like testing
- ✅ You're deploying/testing deployment

---

## Pro Tip: Use Both!

You can use both files for different purposes:

```bash
# Development (most of the time)
docker-compose -f docker-compose.dev.yml up -d
npm run dev

# Testing before deployment
docker-compose down
docker-compose up -d --build

# Back to development
docker-compose down
docker-compose -f docker-compose.dev.yml up -d
```

---

## Summary Table

| Feature | docker-compose.dev.yml | docker-compose.yml |
|---------|----------------------|-------------------|
| PostgreSQL | ✅ In Docker | ✅ In Docker |
| Redis | ✅ In Docker | ✅ In Docker |
| Backend | ❌ Run locally | ✅ In Docker |
| Frontend | ❌ Run locally | ✅ In Docker |
| Speed | ⚡⚡⚡ Fast | ⚡ Slower |
| Hot Reload | ✅ Instant | ⏱️ Delayed |
| Debugging | ✅ Easy | ❌ Harder |
| Setup Time | 🚀 Quick | 🐢 Slower |
| Resource Usage | 💚 Low | 🔴 High |
| Production-like | ❌ No | ✅ Yes |

**Recommendation:** Use `docker-compose.dev.yml` for daily development! 🎯

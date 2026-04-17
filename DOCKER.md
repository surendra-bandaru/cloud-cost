# Docker Guide

## Understanding Docker Compose Commands

### `docker-compose up -d`
This command will:
1. **Pull** pre-built images (postgres, redis) from Docker Hub
2. **Build** custom images (backend, frontend) using their Dockerfiles
3. **Start** all containers in detached mode (-d flag)

### `docker-compose up -d --build`
Forces rebuild of all images even if they exist:
- Useful when you've made changes to Dockerfiles or code
- Ensures you're running the latest version

### `docker-compose build`
Only builds images without starting containers:
- Good for checking if builds work
- Faster iteration when testing Dockerfile changes

## Recommended Workflows

### For Development (Fastest)
Use local Node.js and only run infrastructure in Docker:

```bash
# Start only database and cache
docker-compose -f docker-compose.dev.yml up -d

# Install dependencies locally
npm install

# Run apps locally
npm run dev
```

**Pros:**
- Fast hot-reload
- Easy debugging
- Direct access to node_modules
- No container overhead

**Cons:**
- Need Node.js installed locally
- Different environment than production

### For Production-like Testing
Run everything in Docker:

```bash
# Build and start all services
docker-compose up -d --build

# Check logs
docker-compose logs -f backend
```

**Pros:**
- Matches production environment
- Isolated dependencies
- Easy to share exact setup

**Cons:**
- Slower hot-reload
- More resource intensive
- Harder to debug

## Common Docker Commands

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# Stop all services
docker-compose down

# Stop and remove volumes (deletes database data!)
docker-compose down -v

# View logs for specific service
docker-compose logs -f backend

# Execute command in running container
docker exec -it billing-backend sh

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# View resource usage
docker stats

# Clean up unused images/containers
docker system prune -a
```

## Troubleshooting

### Port Already in Use
```bash
# Find what's using the port
netstat -ano | findstr :5432

# Kill the process or change port in docker-compose.yml
```

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Check if dependencies are ready
docker-compose ps
```

### Database Connection Issues
```bash
# Verify postgres is running
docker exec -it billing-postgres psql -U billing_user -d billing_db

# Check connection from backend
docker exec -it billing-backend npm run migrate
```

### Build Failures
```bash
# Clean build cache
docker-compose build --no-cache backend

# Remove old images
docker image prune -a
```

## File Structure Impact on Docker

```
apps/backend/
├── Dockerfile          # Defines how to build backend image
├── package.json        # Dependencies to install
└── src/               # Application code

docker-compose.yml      # Orchestrates all services
docker-compose.dev.yml  # Infrastructure only (recommended for dev)
```

## Environment Variables in Docker

Docker Compose passes environment variables in two ways:

1. **Inline in docker-compose.yml:**
```yaml
environment:
  DATABASE_URL: postgresql://user:pass@postgres:5432/db
```

2. **From .env file:**
```yaml
env_file:
  - ./apps/backend/.env
```

## Volumes Explained

```yaml
volumes:
  - ./apps/backend:/app        # Sync local code to container
  - /app/node_modules          # Don't sync node_modules (use container's)
```

This allows hot-reload while keeping dependencies isolated.

## Network Communication

Services in the same Docker network can communicate using service names:

```yaml
# Backend connects to postgres using hostname "postgres"
DATABASE_URL: postgresql://user:pass@postgres:5432/db

# Frontend connects to backend using hostname "backend"
API_URL: http://backend:4000
```

From your host machine, use `localhost`:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Postgres: localhost:5432
- Redis: localhost:6379

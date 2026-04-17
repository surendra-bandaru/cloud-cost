# Enterprise Cloud Billing Management Platform

A comprehensive, enterprise-grade cloud billing management platform for Azure and GCP with advanced analytics, budgeting, and cost optimization features.

## Features

### Core Capabilities
- **Multi-Cloud Support**: Azure and GCP billing integration
- **Real-time Analytics**: Cost trends, forecasting, and anomaly detection
- **Budget Management**: Set budgets with threshold alerts
- **Cost Allocation**: Tag-based cost tracking and allocation
- **Optimization Recommendations**: AI-powered cost savings suggestions
- **Multi-tenant Architecture**: Organization-based access control
- **Role-based Access Control**: Admin, User, and Viewer roles

### Technical Features
- **Modern Stack**: Next.js 14, TypeScript, Prisma, PostgreSQL
- **Real-time Updates**: WebSocket support for live data
- **Caching**: Redis for performance optimization
- **Background Jobs**: Automated billing data sync and budget checks
- **API Documentation**: Swagger/OpenAPI integration
- **Docker Support**: Full containerization with Docker Compose
- **Monorepo**: Turborepo for efficient builds

## Architecture

```
cloud-billing-enterprise/
├── apps/
│   ├── backend/          # Node.js/Express API
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   ├── validators/
│   │   │   └── utils/
│   │   └── prisma/
│   └── frontend/         # Next.js 14 App
│       └── src/
│           ├── app/
│           ├── components/
│           └── lib/
├── packages/             # Shared packages
└── docker-compose.yml
```

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Installation

#### Option A: Development with Local Node.js (Recommended for Development)

1. Clone the repository:
```bash
git clone https://github.com/surendra-bandaru/cloud-cost.git
cd cloud-cost
```

2. Start infrastructure only (PostgreSQL + Redis):
```bash
docker-compose -f docker-compose.dev.yml up -d
```

3. Install dependencies:
```bash
npm install
```

4. Set up backend environment:
```bash
cd apps/backend
cp .env.example .env
# Edit .env with your credentials
```

5. Run database migrations:
```bash
npx prisma generate
npx prisma db push
```

6. Go back to root and start development servers:
```bash
cd ../..
npm run dev
```

#### Option B: Full Docker Setup (All Services in Containers)

1. Clone the repository:
```bash
git clone https://github.com/surendra-bandaru/cloud-cost.git
cd cloud-cost
```

2. Build and start all services:
```bash
docker-compose up -d --build
```

3. Run migrations inside the container:
```bash
docker exec -it billing-backend npx prisma generate
docker exec -it billing-backend npx prisma db push
```

#### Quick Commands

```bash
# Start only infrastructure (postgres + redis)
docker-compose -f docker-compose.dev.yml up -d

# Start all services with build
docker-compose up -d --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs: http://localhost:4000/api-docs

## Configuration

### Azure Setup
1. Create an Azure AD application
2. Grant necessary permissions for billing data access
3. Add credentials to `.env`:
```env
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_SUBSCRIPTION_ID=your-subscription-id
```

### GCP Setup
1. Enable BigQuery Billing Export
2. Create a service account with billing viewer permissions
3. Download service account key JSON
4. Add configuration to `.env`:
```env
GCP_PROJECT_ID=your-project-id
GCP_BILLING_ACCOUNT_ID=your-billing-account-id
GOOGLE_APPLICATION_CREDENTIALS=./gcp-service-account.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Billing
- `GET /api/billing/summary` - Get cost summary
- `GET /api/billing/trends` - Get cost trends
- `GET /api/billing/services` - Service breakdown
- `GET /api/billing/resources` - Resource costs
- `GET /api/billing/forecast` - Cost forecast
- `POST /api/billing/sync` - Sync billing data

### Budgets
- `GET /api/budgets` - List budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/:id/status` - Budget status

### Analytics
- `GET /api/analytics/cost-by-service` - Cost by service
- `GET /api/analytics/cost-by-region` - Cost by region
- `GET /api/analytics/cost-by-tag` - Cost by tag
- `GET /api/analytics/anomalies` - Detect anomalies
- `GET /api/analytics/optimization-recommendations` - Get recommendations

### Cloud Accounts
- `GET /api/cloud-accounts` - List accounts
- `POST /api/cloud-accounts` - Add account
- `PUT /api/cloud-accounts/:id` - Update account
- `DELETE /api/cloud-accounts/:id` - Remove account
- `POST /api/cloud-accounts/:id/sync` - Sync account

### Alerts
- `GET /api/alerts` - List alerts
- `PUT /api/alerts/:id/read` - Mark as read
- `DELETE /api/alerts/:id` - Delete alert

## Database Schema

The platform uses PostgreSQL with Prisma ORM. Key models:
- **User**: User accounts with role-based access
- **Organization**: Multi-tenant organizations
- **CloudAccount**: Azure/GCP account configurations
- **BillingData**: Historical billing records
- **Budget**: Budget definitions and thresholds
- **Alert**: System alerts and notifications
- **CostAllocation**: Tag-based cost allocation

## Background Jobs

Automated tasks run via node-cron:
- **Billing Sync**: Every 6 hours
- **Budget Checks**: Every hour
- **Anomaly Detection**: Daily
- **Report Generation**: Weekly

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on all endpoints
- Helmet.js security headers
- CORS configuration
- Input validation with Joi
- SQL injection protection via Prisma

## Performance

- Redis caching for frequently accessed data
- Database query optimization with indexes
- Compression middleware
- Efficient pagination
- Background job processing

## Monitoring & Logging

- Winston logger with file rotation
- Error tracking and reporting
- Performance metrics
- API request logging

## Testing

```bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage
```

## Deployment

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment
1. Build the applications:
```bash
npm run build
```

2. Set production environment variables

3. Run migrations:
```bash
cd apps/backend
npm run migrate
```

4. Start the services:
```bash
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [repository-url]/issues
- Documentation: [docs-url]
- Email: support@example.com

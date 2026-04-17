# Enterprise Cloud Billing Management Platform

Production-grade Kubernetes application for Azure and GCP cloud billing management with automated CI/CD.

## 🚀 Features

- **Multi-Cloud Support**: Azure and GCP billing integration
- **Real-time Analytics**: Cost trends, forecasting, anomaly detection
- **Budget Management**: Threshold alerts and notifications
- **Auto-scaling**: HPA for dynamic scaling (3-10 pods backend, 2-5 pods frontend)
- **High Availability**: Multi-replica deployments with health checks
- **Secure**: HTTPS/TLS, secrets management, non-root containers

## 📦 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.jjs 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, Prisma
- **Database**: PostgreSQL with StatefulSet
- **Cache**: Redis
- **Container Registry**: Azure Container Registry (ACR)
- **Orchestration**: Kubernetes (AKS)
- **Package Manager**: Helm 3
- **CI/CD**: GitHub Actions
- **Monitoring**: Azure Monitor, Prometheus-ready
- **SSL**: Let's Encrypt via Cert-Manager

## 📋 Prerequisites

- Azure CLI (`az`)
- kubectl
- Helm 3.x
- Docker
- GitHub account
- Azure subscription
- Domain name (for production)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Azure Kubernetes Service                │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Ingress (NGINX + Let's Encrypt)                   │ │
│  └──────────────┬─────────────────────────────────────┘ │
│                 │                                        │
│  ┌──────────────┴──────────────┬────────────────────┐  │
│  │                              │                     │  │
│  │  Frontend (2-5 pods)    Backend (3-10 pods)      │  │
│  │  Next.js + React        Node.js + Express        │  │
│  │  Auto-scaling           Auto-scaling + HPA       │  │
│  └─────────────────────────────┬────────────────────┘  │
│                                 │                        │
│  ┌──────────────┬───────────────┴────────────────────┐ │
│  │              │                                     │ │
│  │  PostgreSQL  │  Redis                             │ │
│  │  StatefulSet │  Deployment                        │ │
│  └──────────────┴────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone repository
git clone https://github.com/surendra-bandaru/cloud-cost.git
cd cloud-cost

# Make scripts executable
chmod +x scripts/*.sh

# Setup AKS cluster
./scripts/setup-aks.sh

# Deploy application
./scripts/deploy-helm.sh
```

### Option 2: Manual Setup

See [K8S-DEPLOYMENT.md](./K8S-DEPLOYMENT.md) for detailed instructions.

## 📦 GitHub Actions CI/CD

### Setup GitHub Secrets

Go to: Repository → Settings → Secrets and variables → Actions

Add these secrets:

```
ACR_NAME=youracrname
ACR_USERNAME=<from Azure>
ACR_PASSWORD=<from Azure>
AZURE_CREDENTIALS=<service principal JSON>
AZURE_RESOURCE_GROUP=billing-platform-rg
AKS_CLUSTER_NAME=billing-aks-cluster
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
POSTGRES_PASSWORD=your-password
AZURE_TENANT_ID=...
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...
AZURE_SUBSCRIPTION_ID=...
GCP_PROJECT_ID=...
GCP_BILLING_ACCOUNT_ID=...
GCP_SERVICE_ACCOUNT_KEY=<base64 encoded>
DOMAIN_NAME=billing.yourdomain.com
API_URL=https://api.billing.yourdomain.com
```

### Workflows

1. **Build and Push** (`.github/workflows/build-and-push.yml`)
   - Triggers on push to `main` or `develop`
   - Builds Docker images
   - Pushes to ACR
   - Runs security scans

2. **Deploy to AKS** (`.github/workflows/deploy-to-aks.yml`)
   - Triggers after successful build
   - Deploys with Helm
   - Runs database migrations
   - Verifies deployment

## 🔧 Configuration

### Helm Values

Edit `helm/billing-platform/values.yaml`:

```yaml
backend:
  replicaCount: 3
  autoscaling:
    minReplicas: 3
    maxReplicas: 10

frontend:
  replicaCount: 2
  autoscaling:
    minReplicas: 2
    maxReplicas: 5

ingress:
  hosts:
    - host: billing.yourdomain.com
    - host: api.billing.yourdomain.com
```

### Environment Variables

Backend environment variables are managed through Kubernetes secrets:
- `backend-secret`: Database URL, JWT secret
- `azure-credentials`: Azure cloud credentials
- `gcp-credentials`: GCP cloud credentials
- `postgres-secret`: PostgreSQL credentials

## 📊 Monitoring

### View Logs
```bash
# Backend logs
kubectl logs -f -l app.kubernetes.io/component=backend -n billing-platform

# Frontend logs
kubectl logs -f -l app.kubernetes.io/component=frontend -n billing-platform
```

### Check Status
```bash
# Pods
kubectl get pods -n billing-platform

# Services
kubectl get svc -n billing-platform

# Ingress
kubectl get ingress -n billing-platform

# HPA status
kubectl get hpa -n billing-platform
```

## 🔄 Updates and Rollbacks

### Update Application
```bash
# Update to new version
helm upgrade billing-platform ./helm/billing-platform \
  --namespace billing-platform \
  --set backend.image.tag=v1.1.0 \
  --set frontend.image.tag=v1.1.0 \
  --reuse-values
```

### Rollback
```bash
# View history
helm history billing-platform -n billing-platform

# Rollback
helm rollback billing-platform -n billing-platform
```

## 🔒 Security

- ✅ HTTPS/TLS with Let's Encrypt
- ✅ Network policies enabled
- ✅ Secrets management with Kubernetes
- ✅ Non-root containers
- ✅ Security scanning with Trivy
- ✅ RBAC enabled
- ✅ Pod security policies
- ✅ Private container registry

## 📈 Scaling

### Horizontal Pod Autoscaling (HPA)

Backend automatically scales based on:
- CPU utilization (70% target)
- Memory utilization (80% target)
- Min: 3 pods, Max: 10 pods

Frontend automatically scales based on:
- CPU utilization (70% target)
- Min: 2 pods, Max: 5 pods

### Manual Scaling
```bash
kubectl scale deployment billing-platform-backend \
  --replicas=5 -n billing-platform
```

## 💰 Cost Optimization

1. Use Azure Reserved Instances for production
2. Enable cluster autoscaler (configured)
3. Set appropriate resource limits
4. Use spot instances for dev/test
5. Monitor with Azure Cost Management

## 🧹 Cleanup

```bash
# Delete application
helm uninstall billing-platform -n billing-platform

# Delete namespace
kubectl delete namespace billing-platform

# Delete AKS cluster
az aks delete \
  --resource-group billing-platform-rg \
  --name billing-aks-cluster \
  --yes

# Delete resource group
az group delete \
  --name billing-platform-rg \
  --yes
```

## 📚 Documentation

- [Kubernetes Deployment Guide](./K8S-DEPLOYMENT.md)
- [Helm Chart Documentation](./helm/billing-platform/README.md)
- [API Documentation](./docs/API.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- GitHub Issues: [Create an issue](https://github.com/surendra-bandaru/cloud-cost/issues)
- Documentation: [Wiki](https://github.com/surendra-bandaru/cloud-cost/wiki)

## 🎯 Roadmap

- [ ] AWS support
- [ ] Advanced ML-based cost predictions
- [ ] Slack/Teams notifications
- [ ] Custom dashboards
- [ ] Cost allocation rules engine
- [ ] Multi-region deployment
- [ ] Disaster recovery setup

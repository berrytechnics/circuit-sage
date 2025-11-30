# CircuitSage Deployment Guide

This guide provides step-by-step instructions for deploying CircuitSage to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
- [Render.com Deployment](#rendercom-deployment)
- [Environment Variables](#environment-variables-reference)
- [Database Setup](#database-setup)
- [Post-Deployment Steps](#post-deployment-steps)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- A GitHub repository with CircuitSage code
- Access to a deployment platform (Render.com, AWS, Google Cloud, etc.)
- PostgreSQL 15+ database (managed or self-hosted)
- Domain name (optional, for custom domains)
- SSL certificate (for HTTPS)

## Deployment Options

### Recommended: Render.com

Render.com is recommended for quick deployments with minimal configuration. The `render.yaml` file is pre-configured for Render.com.

### Alternative Platforms

CircuitSage can be deployed to:
- **AWS** (ECS, EC2, Elastic Beanstalk)
- **Google Cloud Platform** (Cloud Run, Compute Engine)
- **Azure** (App Service, Container Instances)
- **DigitalOcean** (App Platform, Droplets)
- **Heroku** (with modifications)

## Render.com Deployment

### Step 1: Prepare Repository

1. Ensure your code is pushed to GitHub
2. Verify `render.yaml` exists in the root directory
3. Check that Dockerfiles are present:
   - `backend/Dockerfile`
   - `frontend/Dockerfile`

### Step 2: Connect to Render

1. Sign up/login at [render.com](https://render.com)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will detect `render.yaml` and create services automatically

### Step 3: Configure Environment Variables

After services are created, configure environment variables in Render dashboard:

#### Backend Service (`circuit-sage-api`)

Required variables (some auto-configured from database):
- `NODE_ENV=production`
- `PORT=4000` (auto-set)
- `DB_HOST` (auto-set from database)
- `DB_PORT` (auto-set from database)
- `DB_USER` (auto-set from database)
- `DB_PASSWORD` (auto-set from database)
- `DB_NAME` (auto-set from database)
- `JWT_SECRET` (generate strong secret - see below)
- `ENCRYPTION_KEY` (generate 32-character key - see below)
- `ALLOWED_ORIGINS` (set to your frontend URL, comma-separated)
- `IS_DOCKER=true`

#### Frontend Service (`circuit-sage-frontend`)

Required variables:
- `NODE_ENV=production`
- `NEXT_PUBLIC_API_URL` (set to your backend URL, e.g., `https://circuit-sage-api.onrender.com/api`)
- `NEXT_TELEMETRY_DISABLED=1`

### Step 4: Generate Secrets

Generate secure secrets before deployment:

```bash
# Generate JWT Secret (32+ characters)
openssl rand -base64 32

# Generate Encryption Key (exactly 32 characters for AES-256)
openssl rand -hex 16
```

### Step 5: Deploy

1. Render will automatically build and deploy when you push to the connected branch
2. Monitor build logs in Render dashboard
3. Wait for services to become "Live"

### Step 6: Run Database Migrations

Migrations run automatically on backend startup via `backend/scripts/start.sh`. Verify in logs:

1. Go to Backend service logs in Render
2. Look for "Running database migrations..." message
3. Verify "All migrations completed successfully"

If migrations fail, you can run them manually:

```bash
# SSH into backend container (if supported) or use Render shell
cd /app
yarn migrate:prod
```

### Step 7: Verify Deployment

1. **Health Check**: Visit `https://your-backend-url.onrender.com/health`
   - Should return: `{"status":"ok"}`

2. **Frontend**: Visit your frontend URL
   - Should load the login page

3. **API**: Test API endpoint
   ```bash
   curl https://your-backend-url.onrender.com/api/health
   ```

## Environment Variables Reference

### Backend Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | Yes | Environment mode | `production` |
| `PORT` | Yes | Server port | `4000` |
| `DB_HOST` | Yes | Database host | `dpg-xxx.oregon-postgres.render.com` |
| `DB_PORT` | Yes | Database port | `5432` |
| `DB_USER` | Yes | Database username | `circuit_sage_user` |
| `DB_PASSWORD` | Yes | Database password | (auto-generated) |
| `DB_NAME` | Yes | Database name | `circuit_sage_db` |
| `JWT_SECRET` | Yes | JWT signing secret (32+ chars) | (generate with openssl) |
| `ENCRYPTION_KEY` | Yes | Encryption key (32 chars) | (generate with openssl) |
| `ALLOWED_ORIGINS` | Recommended | CORS allowed origins | `https://yourdomain.com` |
| `IS_DOCKER` | Yes | Docker environment flag | `true` |

### Frontend Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | Yes | Environment mode | `production` |
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL | `https://api.yourdomain.com/api` |
| `NEXT_TELEMETRY_DISABLED` | Optional | Disable Next.js telemetry | `1` |

### Generating Secrets

**JWT Secret** (minimum 32 characters):
```bash
openssl rand -base64 32
```

**Encryption Key** (exactly 32 characters for AES-256-GCM):
```bash
openssl rand -hex 16
```

## Database Setup

### Using Render.com Managed PostgreSQL

1. Render automatically creates a PostgreSQL database from `render.yaml`
2. Connection details are auto-injected into backend service
3. No manual setup required

### Using External PostgreSQL

If using an external database:

1. Create PostgreSQL 15+ database
2. Enable UUID extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```
3. Update backend environment variables with connection details
4. Run migrations manually or let startup script handle it

### Database Migrations

Migrations run automatically on backend startup. The startup script (`backend/scripts/start.sh`) will:

1. Check database connection
2. Run all migrations in `database/migrations/` directory
3. Log migration results

To run migrations manually:

```bash
cd backend
yarn migrate:prod
```

## Post-Deployment Steps

### 1. Remove Default Credentials

**CRITICAL**: Remove default admin credentials before production use:

```bash
# Option 1: Use the removal script (if you have access to backend)
yarn ts-node backend/scripts/remove-default-admin.ts

# Option 2: Manually update via API or database
# Change password for admin@circuitsage.com or admin@repairmanager.com
```

See [SECURITY.md](./docs/SECURITY.md) for more details.

### 2. Create Production Admin User

1. Register a new company via `/api/auth/register`
2. First user automatically becomes admin
3. Delete or update default admin credentials

### 3. Configure Custom Domain (Optional)

1. In Render dashboard, go to your service
2. Click "Settings" → "Custom Domain"
3. Add your domain
4. Update DNS records as instructed
5. SSL certificate is auto-provisioned by Render

### 4. Set Up Monitoring

- Monitor application logs in Render dashboard
- Set up health check alerts
- Configure error tracking (see Monitoring section)

### 5. Configure Backups

- Render.com: Automatic daily backups (paid plans)
- External database: Set up automated backups
- Document restore procedures

## Troubleshooting

### Backend Won't Start

**Check logs for:**
- Database connection errors
- Missing environment variables
- Migration failures

**Common fixes:**
```bash
# Verify environment variables are set
# Check database is accessible
# Review migration logs
```

### Frontend Build Fails

**Common issues:**
- `NEXT_PUBLIC_API_URL` not set
- Build timeout (increase in Render settings)
- Memory limits (upgrade plan)

**Fix:**
```bash
# Ensure NEXT_PUBLIC_API_URL is set before build
# Check Render build logs for specific errors
```

### Database Connection Errors

**Symptoms:**
- "Unable to connect to the database"
- Connection timeout errors

**Fixes:**
1. Verify database credentials in environment variables
2. Check database is running and accessible
3. Verify network connectivity (firewall rules)
4. For Render: Ensure database and backend are in same region

### Migrations Fail

**Symptoms:**
- "Migration failed" in logs
- Database schema errors

**Fixes:**
1. Check migration files are present in container
2. Verify database has UUID extension enabled
3. Review migration logs for specific SQL errors
4. Run migrations manually if needed

### CORS Errors

**Symptoms:**
- Frontend can't connect to API
- CORS policy errors in browser console

**Fixes:**
1. Set `ALLOWED_ORIGINS` environment variable
2. Include frontend URL in `ALLOWED_ORIGINS` (comma-separated)
3. Restart backend service after updating

### Health Check Fails

**Check:**
1. Backend service is running
2. `/health` endpoint is accessible
3. No errors in backend logs

**Test:**
```bash
curl https://your-backend-url.onrender.com/health
```

## Rollback Procedure

If deployment fails:

1. **Render.com**: Use "Manual Deploy" → select previous successful commit
2. **Database**: Restore from backup if migrations caused issues
3. **Environment**: Revert environment variable changes

## Monitoring & Maintenance

### Application Monitoring

- **Logs**: Monitor Render dashboard logs
- **Health Checks**: Set up automated health check monitoring
- **Error Tracking**: Integrate Sentry or similar (see Monitoring section)

### Database Maintenance

- **Backups**: Verify backups are running
- **Performance**: Monitor query performance
- **Updates**: Keep PostgreSQL updated

### Security Updates

- **Dependencies**: Regularly update npm packages
- **Secrets**: Rotate JWT_SECRET and ENCRYPTION_KEY periodically
- **SSL**: Ensure SSL certificates are valid

## Additional Resources

- [Security Guide](./docs/SECURITY.md)
- [Integration Setup](./docs/INTEGRATIONS.md)
- [README](./README.md)
- [Render.com Documentation](https://render.com/docs)

## Support

For deployment issues:

1. Check logs in Render dashboard
2. Review this guide
3. Check [Troubleshooting](#troubleshooting) section
4. Review application logs for specific errors




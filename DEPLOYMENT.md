# CircuitSage Deployment Guide

This guide walks you through deploying CircuitSage to Render's free tier for sandbox/client testing.

## Prerequisites

- GitHub account with the CircuitSage repository
- Render account (sign up at [render.com](https://render.com))
- Basic understanding of environment variables

## Platform: Render

Render offers:
- **Free tier** for web services (spins down after 15 minutes of inactivity)
- **Free PostgreSQL** database (free for 90 days, then $7/month)
- **Docker support** with automatic builds
- **GitHub integration** for automatic deployments
- **SSL certificates** included automatically

## Deployment Steps

### Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub:

```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

### Step 2: Create Render Account and Connect GitHub

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Blueprint" (or use "New +" → "Web Service" for manual setup)
3. Connect your GitHub account if prompted
4. Select your CircuitSage repository

### Step 3: Deploy Using Blueprint (Recommended)

If you're using the `render.yaml` file:

1. In Render dashboard, click "New +" → "Blueprint"
2. Connect your GitHub repository
3. Render will automatically detect `render.yaml` and create all services
4. Review the services:
   - `circuit-sage-db` (PostgreSQL)
   - `circuit-sage-api` (Backend API)
   - `circuit-sage-frontend` (Frontend)

### Step 4: Manual Service Setup (Alternative)

If Blueprint doesn't work, create services manually:

#### 4.1 Create PostgreSQL Database

1. Click "New +" → "PostgreSQL"
2. Name: `circuit-sage-db`
3. Database: `repair_business`
4. User: `repair_admin`
5. Plan: **Free** (or Starter for production)
6. Click "Create Database"
7. Note the connection details (host, port, user, password, database name)

#### 4.2 Create Backend Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `circuit-sage-api`
   - **Environment**: Docker
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your deployment branch)
   - **Root Directory**: Leave empty (uses root)
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Docker Context**: `.` (project root)
   - **Plan**: **Free**
4. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=4000
   DB_HOST=<from database service>
   DB_PORT=5432
   DB_USER=<from database service>
   DB_PASSWORD=<from database service>
   DB_NAME=repair_business
   JWT_SECRET=<generate a secure random string>
   IS_DOCKER=true
   ```
5. Click "Create Web Service"

#### 4.3 Create Frontend Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `circuit-sage-frontend`
   - **Environment**: Docker
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Dockerfile Path**: `./frontend/Dockerfile`
   - **Docker Context**: `.` (project root)
   - **Plan**: **Free**
4. **Environment Variables**:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://circuit-sage-api.onrender.com/api
   NEXT_TELEMETRY_DISABLED=1
   ```
   > **Important**: Replace `circuit-sage-api.onrender.com` with your actual backend service URL
5. Click "Create Web Service"

### Step 5: Run Database Migrations

After the backend service is deployed, run migrations:

#### Option A: Using Render Shell (Recommended)

1. Go to your backend service in Render dashboard
2. Click "Shell" tab
3. Run:
   ```bash
   yarn migrate:prod
   ```

#### Option B: Manual Migration Script

1. SSH into the backend service (if available)
2. Or use Render's shell to run:
   ```bash
   cd /app
   yarn migrate:prod
   ```

#### Option C: One-time Migration Service

Create a temporary "Shell Script" service in Render:
1. Click "New +" → "Background Worker"
2. Use the same environment variables as backend
3. Command: `yarn migrate:prod`
4. Run once, then delete the service

### Step 6: Verify Deployment

1. **Check Backend Health**:
   - Visit: `https://circuit-sage-api.onrender.com/health`
   - Should return: `{"status":"ok"}`

2. **Check Frontend**:
   - Visit: `https://circuit-sage-frontend.onrender.com`
   - Should load the login page

3. **Test Login**:
   - Email: `admin@circuitsage.com`
   - Password: `admin123`
   - **Important**: Change this password immediately!

### Step 7: Update Frontend API URL

After backend is deployed:

1. Go to frontend service → Environment
2. Update `NEXT_PUBLIC_API_URL` to your backend URL:
   ```
   NEXT_PUBLIC_API_URL=https://circuit-sage-api.onrender.com/api
   ```
3. Save changes (will trigger rebuild)

## Environment Variables Reference

### Backend Service

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `4000` |
| `DB_HOST` | Database host | From Render DB service |
| `DB_PORT` | Database port | `5432` |
| `DB_USER` | Database user | From Render DB service |
| `DB_PASSWORD` | Database password | From Render DB service |
| `DB_NAME` | Database name | `repair_business` |
| `JWT_SECRET` | JWT signing secret | Generate secure random string |
| `IS_DOCKER` | Docker flag | `true` |

### Frontend Service

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://circuit-sage-api.onrender.com/api` |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry | `1` |

### Generating JWT Secret

Use a secure random string generator:

```bash
# Using openssl
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Post-Deployment Tasks

### 1. Change Default Admin Password

1. Log in with default credentials
2. Go to Settings → Users
3. Update admin password immediately

### 2. Configure Custom Domain (Optional)

1. Go to service → Settings → Custom Domains
2. Add your domain
3. Update DNS records as instructed
4. SSL certificate will be auto-generated

### 3. Set Up Monitoring

- Render provides basic logs in the dashboard
- Consider setting up external monitoring for production

### 4. Database Backups

- Render free tier doesn't include automatic backups
- For production, upgrade to a paid plan or set up manual backups

## Troubleshooting

### Backend Won't Start

1. **Check Logs**: Go to service → Logs
2. **Common Issues**:
   - Database connection failed → Verify DB environment variables
   - Port already in use → Render assigns ports automatically, use `PORT` env var
   - Migration errors → Check migration logs

### Frontend Can't Connect to Backend

1. **Verify API URL**: Check `NEXT_PUBLIC_API_URL` matches backend URL
2. **CORS Issues**: Backend should allow frontend domain (check `cors` middleware)
3. **Network**: Ensure both services are in same region

### Database Connection Errors

1. **Check Environment Variables**: All DB vars must be set correctly
2. **Database Status**: Ensure database service is running
3. **Connection String**: Verify host, port, user, password, database name

### Migrations Not Running

1. **Manual Run**: Use Render shell to run `yarn migrate:prod`
2. **Check Paths**: Verify migrations directory is copied to Docker image
3. **Permissions**: Ensure database user has CREATE privileges

### Services Spinning Down

- Free tier services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds to wake up
- Consider upgrading to paid plan for always-on service

## Cost Estimate

### Free Tier (Sandbox/Testing)
- **Web Services**: $0/month (spins down when idle)
- **PostgreSQL**: $0/month (first 90 days), then $7/month
- **Total**: $0-7/month

### Paid Tier (Production)
- **Web Services**: $7/month per service (always-on)
- **PostgreSQL**: $7/month (Starter plan)
- **Total**: ~$21/month for full stack

## Alternative Platforms

### Railway

Railway offers similar Docker-based deployment:

1. Sign up at [railway.app](https://railway.app)
2. Connect GitHub repository
3. Create PostgreSQL service
4. Create backend service (Docker)
5. Create frontend service (Docker)
6. Set environment variables

Railway provides $5/month free credit, good for testing.

### Fly.io

Fly.io is another Docker-native platform:

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Create `fly.toml` configuration
3. Deploy: `fly deploy`

## Security Considerations

1. **JWT Secret**: Use a strong, randomly generated secret
2. **Database Password**: Use Render-generated password (don't hardcode)
3. **Environment Variables**: Never commit secrets to Git
4. **HTTPS**: Render provides SSL automatically
5. **CORS**: Configure CORS to allow only your frontend domain

## Updating Deployment

### Automatic Updates

Render automatically deploys when you push to the connected branch.

### Manual Updates

1. Go to service → Manual Deploy
2. Select branch/commit
3. Click "Deploy"

### Rolling Back

1. Go to service → Deploys
2. Find previous successful deployment
3. Click "Redeploy"

## Support

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Render Support**: [render.com/support](https://render.com/support)
- **CircuitSage Issues**: GitHub repository issues

## Next Steps

After successful deployment:

1. Test all features with client access
2. Monitor logs for errors
3. Set up error tracking (e.g., Sentry)
4. Configure backups for production
5. Plan for production deployment with paid tier


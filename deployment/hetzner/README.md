# Hetzner Cloud Deployment Guide

This guide walks you through deploying Circuit Sage to a Hetzner Cloud server with Docker Compose, Nginx reverse proxy, and SSL certificates.

## Prerequisites

- Hetzner Cloud server (Ubuntu 24.04 recommended)
- Domain name pointing to your server's IP address
- SSH access to your server
- Basic knowledge of Linux command line

## Quick Start

### 1. Initial Server Setup

SSH into your Hetzner server and run:

```bash
# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/your-repo/circuit-sage/main/deployment/hetzner/setup-server.sh | sudo bash

# Or clone the repository first
git clone https://github.com/your-repo/circuit-sage.git
cd circuit-sage
sudo bash deployment/hetzner/setup-server.sh
```

This script will:
- Update system packages
- Install Docker and Docker Compose
- Install Nginx and Certbot
- Configure firewall (UFW)
- Set up automatic security updates

### 2. Configure Environment Variables

```bash
# Copy the example file
cp deployment/hetzner/env.production.example .env.production

# Edit with your values
nano .env.production
```

**Required variables:**
- `DOMAIN_NAME` - Your domain name (e.g., `circuitsage.com`)
- `POSTGRES_PASSWORD` - Strong database password
- `JWT_SECRET` - Generate with: `openssl rand -base64 32`
- `ENCRYPTION_KEY` - Generate with: `openssl rand -hex 16`
- `ALLOWED_ORIGINS` - Your domain(s) for CORS
- `NEXT_PUBLIC_API_URL` - Your API URL (e.g., `https://circuitsage.com/api`)

### 3. Deploy Application

```bash
# Make deploy script executable
chmod +x deployment/hetzner/deploy.sh

# Run deployment
./deployment/hetzner/deploy.sh
```

The deployment script will:
- Build Docker images
- Start all services (database, backend, frontend)
- Configure Nginx reverse proxy
- Set up SSL certificate with Let's Encrypt
- Configure automatic SSL renewal

## Architecture

```
Internet
  ↓
Nginx (Ports 80/443)
  ↓
├── Frontend Container (Port 3000) → /
└── Backend Container (Port 4000) → /api
      ↓
  PostgreSQL Container (Port 5432, internal only)
```

## Manual Steps

### DNS Configuration

Before running the deployment, ensure your domain DNS is configured:

1. **A Record**: Point your domain to your Hetzner server IP
   ```
   yourdomain.com → YOUR_SERVER_IP
   ```

2. **Optional - WWW subdomain**:
   ```
   www.yourdomain.com → YOUR_SERVER_IP
   ```

### SSL Certificate Setup

The deployment script attempts to set up SSL automatically. If it fails:

```bash
# Stop nginx temporarily
sudo systemctl stop nginx

# Obtain certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update nginx config
sudo nano /etc/nginx/sites-available/circuit-sage
# Uncomment SSL certificate lines

# Test and reload nginx
sudo nginx -t
sudo systemctl start nginx
```

### Firewall Configuration

The setup script configures UFW with:
- Port 22 (SSH)
- Port 80 (HTTP)
- Port 443 (HTTPS)

To check firewall status:
```bash
sudo ufw status
```

## Managing Services

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f postgres
```

### Restart Services

```bash
# Restart all services
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker compose -f docker-compose.prod.yml restart backend
```

### Stop Services

```bash
docker compose -f docker-compose.prod.yml down
```

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build
```

## Post-Deployment

### 1. Verify Deployment

- Frontend: `https://yourdomain.com`
- Backend API: `https://yourdomain.com/api/health`
- Should return: `{"status":"ok"}`

### 2. Remove Default Credentials

**CRITICAL**: Remove default admin credentials after first login:

```bash
# Option 1: Use the removal script
docker compose -f docker-compose.prod.yml exec backend yarn ts-node scripts/remove-default-admin.ts

# Option 2: Change password via web interface
# Log in and change password immediately
```

Default credentials:
- Email: `admin@repairtix.com`
- Password: `admin123`

### 3. Create Production Admin

1. Register a new company via `/api/auth/register`
2. First user automatically becomes admin
3. Delete or update default admin credentials

## Troubleshooting

### Services Won't Start

```bash
# Check container status
docker compose -f docker-compose.prod.yml ps

# Check logs for errors
docker compose -f docker-compose.prod.yml logs

# Check if ports are in use
sudo netstat -tulpn | grep -E ':(3000|4000|5432|80|443)'
```

### Database Connection Issues

```bash
# Check database container
docker compose -f docker-compose.prod.yml ps postgres

# Check database logs
docker compose -f docker-compose.prod.yml logs postgres

# Test connection
docker compose -f docker-compose.prod.yml exec postgres psql -U circuit_sage_user -d circuit_sage_db
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check nginx logs
sudo tail -f /var/log/nginx/circuit-sage-error.log
sudo tail -f /var/log/nginx/circuit-sage-access.log

# Restart nginx
sudo systemctl restart nginx
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

### Frontend Not Loading

1. Check if frontend container is running:
   ```bash
   docker compose -f docker-compose.prod.yml ps frontend
   ```

2. Check frontend logs:
   ```bash
   docker compose -f docker-compose.prod.yml logs frontend
   ```

3. Verify NEXT_PUBLIC_API_URL is set correctly in .env.production

### Backend API Not Responding

1. Check backend health:
   ```bash
   curl http://localhost:4000/health
   ```

2. Check backend logs:
   ```bash
   docker compose -f docker-compose.prod.yml logs backend
   ```

3. Verify database connection:
   ```bash
   docker compose -f docker-compose.prod.yml exec backend yarn migrate:prod
   ```

## Security Best Practices

1. **Change Default Passwords**: Immediately change all default credentials
2. **Keep Updated**: Regularly update system packages and Docker images
3. **Firewall**: Only expose necessary ports (22, 80, 443)
4. **SSL**: Always use HTTPS in production
5. **Backups**: Set up regular database backups
6. **Monitoring**: Monitor logs and set up alerts
7. **Secrets**: Never commit .env.production to version control

## Backup and Restore

### Database Backup

```bash
# Create backup
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U circuit_sage_user circuit_sage_db > backup_$(date +%Y%m%d).sql

# Restore from backup
docker compose -f docker-compose.prod.yml exec -T postgres psql -U circuit_sage_user circuit_sage_db < backup_YYYYMMDD.sql
```

### Automated Backups

Set up a cron job for daily backups:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /opt/circuit-sage && docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U circuit_sage_user circuit_sage_db > backups/backup_$(date +\%Y\%m\%d).sql
```

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Hetzner Cloud Documentation](https://docs.hetzner.com/)

## Support

For issues specific to Circuit Sage deployment:
1. Check logs: `docker compose -f docker-compose.prod.yml logs`
2. Review this guide's troubleshooting section
3. Check application logs for specific errors


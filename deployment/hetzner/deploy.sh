#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "Circuit Sage - Deployment Script"
echo "========================================="

# Check if running from project root
if [ ! -f "docker-compose.prod.yml" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}Error: .env.production file not found!${NC}"
    echo -e "${YELLOW}Please copy deployment/hetzner/env.production.example to .env.production and configure it.${NC}"
    exit 1
fi

# Load environment variables
set -a
source .env.production
set +a

# Validate required variables
REQUIRED_VARS=("POSTGRES_PASSWORD" "JWT_SECRET" "ENCRYPTION_KEY" "ALLOWED_ORIGINS" "NEXT_PUBLIC_API_URL" "DOMAIN_NAME")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}Error: Missing required environment variables:${NC}"
    printf '%s\n' "${MISSING_VARS[@]}"
    exit 1
fi

echo -e "${GREEN}Step 1: Building Docker images...${NC}"
docker compose -f docker-compose.prod.yml build --no-cache

echo -e "${GREEN}Step 2: Stopping existing containers...${NC}"
docker compose -f docker-compose.prod.yml down || true

echo -e "${GREEN}Step 3: Starting services...${NC}"
docker compose -f docker-compose.prod.yml up -d

echo -e "${GREEN}Step 4: Waiting for services to be healthy...${NC}"
sleep 10

# Check if containers are running
if ! docker compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo -e "${RED}Error: Some containers failed to start${NC}"
    echo -e "${YELLOW}Checking logs...${NC}"
    docker compose -f docker-compose.prod.yml logs
    exit 1
fi

echo -e "${GREEN}Step 5: Setting up Nginx configuration...${NC}"
# Copy nginx config
sudo cp deployment/hetzner/nginx.conf /etc/nginx/sites-available/circuit-sage

# Replace domain placeholder
sudo sed -i "s/yourdomain.com/$DOMAIN_NAME/g" /etc/nginx/sites-available/circuit-sage

# Enable site
sudo ln -sf /etc/nginx/sites-available/circuit-sage /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
if ! sudo nginx -t; then
    echo -e "${RED}Error: Nginx configuration test failed${NC}"
    exit 1
fi

echo -e "${GREEN}Step 6: Setting up SSL certificate...${NC}"
# Stop nginx temporarily for certbot
sudo systemctl stop nginx || true

# Obtain certificate
sudo certbot certonly --standalone \
    --preferred-challenges http \
    -d "$DOMAIN_NAME" \
    --email "${SSL_EMAIL:-admin@$DOMAIN_NAME}" \
    --agree-tos \
    --non-interactive || {
    echo -e "${YELLOW}Warning: SSL certificate setup failed. You may need to set up DNS first.${NC}"
    echo -e "${YELLOW}Continuing without SSL for now...${NC}"
}

# Update nginx config with SSL paths
if [ -f "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" ]; then
    sudo sed -i "s|# ssl_certificate|ssl_certificate|g" /etc/nginx/sites-available/circuit-sage
    sudo sed -i "s|# ssl_certificate_key|ssl_certificate_key|g" /etc/nginx/sites-available/circuit-sage
    echo -e "${GREEN}SSL certificate configured successfully${NC}"
else
    echo -e "${YELLOW}SSL certificate not found. Using HTTP only for now.${NC}"
    echo -e "${YELLOW}You can set up SSL later by running:${NC}"
    echo -e "${YELLOW}  sudo certbot --nginx -d $DOMAIN_NAME${NC}"
fi

# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx

echo -e "${GREEN}Step 7: Setting up SSL certificate auto-renewal...${NC}"
# Add cron job for certificate renewal
(crontab -l 2>/dev/null | grep -v "certbot renew"; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -

echo -e "${GREEN}Step 8: Checking service health...${NC}"
sleep 5

# Check backend health
if curl -f -s http://localhost:4000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${YELLOW}⚠ Backend health check failed (this may be normal if migrations are still running)${NC}"
fi

# Check frontend
if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is responding${NC}"
else
    echo -e "${YELLOW}⚠ Frontend check failed${NC}"
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Deployment completed!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Services are running:"
echo "  - Frontend: http://$DOMAIN_NAME (or http://$(hostname -I | awk '{print $1}'))"
echo "  - Backend API: http://$DOMAIN_NAME/api"
echo ""
echo "To view logs:"
echo "  docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "To stop services:"
echo "  docker compose -f docker-compose.prod.yml down"
echo ""
echo -e "${YELLOW}Important: Remove default admin credentials after first login!${NC}"


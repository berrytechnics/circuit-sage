#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "Circuit Sage - Quick Update"
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

echo -e "${GREEN}Step 1: Pulling latest code...${NC}"
git pull

echo -e "${GREEN}Step 2: Rebuilding and restarting containers...${NC}"
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

echo -e "${GREEN}Step 3: Waiting for services to be healthy...${NC}"
sleep 10

# Check if containers are running
if ! docker compose -f docker-compose.prod.yml --env-file .env.production ps | grep -q "Up"; then
    echo -e "${RED}Error: Some containers failed to start${NC}"
    echo -e "${YELLOW}Checking logs...${NC}"
    docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=50
    exit 1
fi

echo -e "${GREEN}Step 4: Checking service health...${NC}"
sleep 5

# Check backend health with retries
BACKEND_HEALTHY=false
for i in {1..10}; do
    if curl -f -s http://localhost:4000/health > /dev/null 2>&1; then
        BACKEND_HEALTHY=true
        echo -e "${GREEN}✓ Backend is healthy${NC}"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

if [ "$BACKEND_HEALTHY" = false ]; then
    echo -e "${YELLOW}⚠ Backend health check failed${NC}"
    echo -e "${YELLOW}Checking backend logs...${NC}"
    docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=50 backend
fi

# Check frontend with retries
FRONTEND_HEALTHY=false
for i in {1..10}; do
    if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
        FRONTEND_HEALTHY=true
        echo -e "${GREEN}✓ Frontend is responding${NC}"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

if [ "$FRONTEND_HEALTHY" = false ]; then
    echo -e "${YELLOW}⚠ Frontend check failed${NC}"
    echo -e "${YELLOW}Checking frontend logs...${NC}"
    docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=50 frontend
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Quick update completed!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Services are running:"
echo "  - Frontend: https://${DOMAIN_NAME:-yourdomain.com}"
echo "  - Backend API: https://${DOMAIN_NAME:-yourdomain.com}/api"
echo ""
echo "To view logs:"
echo "  docker compose -f docker-compose.prod.yml --env-file .env.production logs -f"
echo ""


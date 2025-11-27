#!/bin/bash

# Demo script to create Cloudflare tunnels for both frontend and backend
# This allows you to share your local application with others via public URLs

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_PORT=${FRONTEND_PORT:-3000}
BACKEND_PORT=${BACKEND_PORT:-4000}
FRONTEND_URL="http://localhost:${FRONTEND_PORT}"
BACKEND_URL="http://localhost:${BACKEND_PORT}"
FRONTEND_PID=""

echo -e "${BLUE}=== Circuit Sage Demo Tunnel Setup ===${NC}\n"

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo -e "${RED}Error: cloudflared is not installed.${NC}"
    echo -e "${YELLOW}Please install it first:${NC}"
    echo "  macOS: brew install cloudflared"
    echo "  Linux: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
    echo "  Or download from: https://github.com/cloudflare/cloudflared/releases"
    exit 1
fi

echo -e "${GREEN}✓ cloudflared is installed${NC}"

# Check if backend is running
if ! curl -s "${BACKEND_URL}/health" > /dev/null 2>&1; then
    echo -e "${YELLOW}Warning: Backend doesn't appear to be running on ${BACKEND_URL}${NC}"
    echo -e "${YELLOW}Make sure the backend is started before running this script.${NC}"
    echo ""
    echo "To start the backend:"
    echo "  cd backend && npm run dev"
    echo "  OR"
    echo "  npm run dev (from project root)"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓ Backend is running on ${BACKEND_URL}${NC}"
fi

# Check if frontend is running
if ! curl -s "${FRONTEND_URL}" > /dev/null 2>&1; then
    echo -e "${YELLOW}Warning: Frontend doesn't appear to be running on ${FRONTEND_URL}${NC}"
    echo -e "${YELLOW}Make sure the frontend is started before running this script.${NC}"
    echo ""
    echo "To start the frontend:"
    echo "  cd frontend && npm run dev"
    echo "  OR"
    echo "  npm run dev (from project root)"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓ Frontend is running on ${FRONTEND_URL}${NC}"
fi

echo ""
echo -e "${BLUE}Starting Cloudflare tunnels...${NC}"
echo -e "${YELLOW}This will create public URLs for both frontend and backend.${NC}"
echo ""

# Start backend tunnel in background and capture URL
echo -e "${BLUE}Starting backend tunnel...${NC}"
BACKEND_TUNNEL_OUTPUT=$(mktemp)
BACKEND_TUNNEL_URL=""

# Start cloudflared in background, redirect ALL output to file (including stderr)
cloudflared tunnel --url "${BACKEND_URL}" > "$BACKEND_TUNNEL_OUTPUT" 2>&1 &
BACKEND_TUNNEL_PID=$!

# Wait for backend tunnel URL
echo -e "${YELLOW}Waiting for backend tunnel URL (this may take a few seconds)...${NC}"
for i in {1..20}; do
    sleep 1
    # Check output file for URL - look for the line that contains the URL
    if [ -f "$BACKEND_TUNNEL_OUTPUT" ]; then
        BACKEND_TUNNEL_URL=$(grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' "$BACKEND_TUNNEL_OUTPUT" 2>/dev/null | head -1 || echo "")
        if [ -n "$BACKEND_TUNNEL_URL" ]; then
            break
        fi
    fi
    # Show progress dots (every 2 seconds)
    if [ $((i % 2)) -eq 0 ]; then
        echo -n "."
    fi
done
echo "" # New line after dots

if [ -z "$BACKEND_TUNNEL_URL" ]; then
    echo -e "${RED}Failed to get backend tunnel URL after 20 seconds.${NC}"
    echo -e "${YELLOW}Last 10 lines of tunnel output:${NC}"
    tail -10 "$BACKEND_TUNNEL_OUTPUT" 2>/dev/null || true
    kill $BACKEND_TUNNEL_PID 2>/dev/null || true
    rm -f "$BACKEND_TUNNEL_OUTPUT"
    exit 1
fi

BACKEND_API_URL="${BACKEND_TUNNEL_URL}/api"
echo -e "${GREEN}✓ Backend tunnel: ${BACKEND_TUNNEL_URL}${NC}"
echo -e "${GREEN}✓ Backend API: ${BACKEND_API_URL}${NC}"
echo ""

# Create or update frontend .env.local with backend URL
FRONTEND_ENV_FILE="frontend/.env.local"
FRONTEND_ENV_BACKUP="frontend/.env.local.backup"

if [ -f "$FRONTEND_ENV_FILE" ]; then
    # Backup existing file
    cp "$FRONTEND_ENV_FILE" "$FRONTEND_ENV_BACKUP"
    echo -e "${YELLOW}Backed up existing .env.local${NC}"
fi

# Update or create .env.local
if grep -q "NEXT_PUBLIC_API_URL" "$FRONTEND_ENV_FILE" 2>/dev/null; then
    # Update existing
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=${BACKEND_API_URL}|" "$FRONTEND_ENV_FILE"
    else
        # Linux
        sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=${BACKEND_API_URL}|" "$FRONTEND_ENV_FILE"
    fi
else
    # Add new
    echo "NEXT_PUBLIC_API_URL=${BACKEND_API_URL}" >> "$FRONTEND_ENV_FILE"
fi

echo -e "${GREEN}✓ Updated frontend/.env.local with backend tunnel URL${NC}"
echo ""

# Function to find and kill frontend process
kill_frontend() {
    local pid
    # Try to find process on frontend port
    if command -v lsof &> /dev/null; then
        # macOS/Linux with lsof
        pid=$(lsof -ti:${FRONTEND_PORT} 2>/dev/null || echo "")
    elif command -v netstat &> /dev/null; then
        # Alternative method with netstat
        pid=$(netstat -tlnp 2>/dev/null | grep ":${FRONTEND_PORT}" | awk '{print $7}' | cut -d'/' -f1 | head -1 || echo "")
    fi
    
    if [ -n "$pid" ]; then
        echo -e "${YELLOW}Found frontend process (PID: $pid), stopping it...${NC}"
        kill $pid 2>/dev/null || true
        sleep 2
        # Force kill if still running
        kill -9 $pid 2>/dev/null || true
        echo -e "${GREEN}✓ Frontend stopped${NC}"
        return 0
    fi
    return 1
}

# Function to start frontend in background
start_frontend() {
    local frontend_dir="frontend"
    local start_cmd
    
    # Check if we're in the project root or frontend directory
    if [ -f "package.json" ] && [ -d "frontend" ]; then
        # We're in project root
        start_cmd="cd frontend && NEXT_PUBLIC_API_URL=${BACKEND_API_URL} npm run dev"
    elif [ -f "package.json" ] && [ -f "next.config.js" ]; then
        # We're already in frontend directory
        frontend_dir="."
        start_cmd="NEXT_PUBLIC_API_URL=${BACKEND_API_URL} npm run dev"
    else
        echo -e "${RED}Error: Cannot determine frontend directory${NC}"
        return 1
    fi
    
    echo -e "${BLUE}Starting frontend with tunneled backend URL...${NC}"
    
    # Start frontend in background
    (
        cd "$frontend_dir" || exit 1
        export NEXT_PUBLIC_API_URL="${BACKEND_API_URL}"
        npm run dev > /tmp/circuit-sage-frontend.log 2>&1
    ) &
    FRONTEND_PID=$!
    
    # Wait for frontend to be ready
    echo -e "${YELLOW}Waiting for frontend to start...${NC}"
    for i in {1..30}; do
        sleep 1
        if curl -s "${FRONTEND_URL}" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Frontend started successfully (PID: $FRONTEND_PID)${NC}"
            return 0
        fi
        # Show progress dots (every 3 seconds)
        if [ $((i % 3)) -eq 0 ]; then
            echo -n "."
        fi
    done
    echo "" # New line after dots
    
    echo -e "${RED}Frontend failed to start within 30 seconds${NC}"
    echo -e "${YELLOW}Check /tmp/circuit-sage-frontend.log for errors${NC}"
    return 1
}

# Try to automatically restart frontend
echo -e "${BLUE}Attempting to automatically restart frontend...${NC}"
if kill_frontend; then
    sleep 1
    if start_frontend; then
        echo -e "${GREEN}✓ Frontend restarted automatically${NC}"
    else
        echo -e "${YELLOW}Automatic restart failed. Please restart manually:${NC}"
        echo "  cd frontend && NEXT_PUBLIC_API_URL=${BACKEND_API_URL} npm run dev"
        echo ""
        read -p "Press Enter once frontend is restarted, or Ctrl+C to cancel..."
    fi
else
    echo -e "${YELLOW}Could not find running frontend process.${NC}"
    echo -e "${YELLOW}Starting frontend with tunneled backend URL...${NC}"
    if ! start_frontend; then
        echo -e "${YELLOW}Please start frontend manually:${NC}"
        echo "  cd frontend && NEXT_PUBLIC_API_URL=${BACKEND_API_URL} npm run dev"
        echo ""
        read -p "Press Enter once frontend is started, or Ctrl+C to cancel..."
    fi
fi

echo ""

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping tunnels and frontend...${NC}"
    kill $BACKEND_TUNNEL_PID 2>/dev/null || true
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo -e "${GREEN}✓ Stopped frontend process${NC}"
    fi
    # Restore .env.local backup if it exists
    if [ -f "$FRONTEND_ENV_BACKUP" ]; then
        mv "$FRONTEND_ENV_BACKUP" "$FRONTEND_ENV_FILE"
        echo -e "${GREEN}✓ Restored original .env.local${NC}"
    fi
    rm -f "$BACKEND_TUNNEL_OUTPUT" /tmp/circuit-sage-frontend.log /tmp/circuit-sage-backend-url.txt
    exit 0
}

trap cleanup INT TERM

echo -e "${BLUE}Starting frontend tunnel...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all tunnels.${NC}"
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  Demo URLs:${NC}"
echo -e "${GREEN}  Backend:  ${BACKEND_TUNNEL_URL}${NC}"
echo -e "${GREEN}  Frontend: (will appear below)${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Frontend tunnel starting...${NC}"
echo ""

# Start frontend tunnel (this will block and show the frontend URL)
cloudflared tunnel --url "${FRONTEND_URL}"

# Cleanup on exit
cleanup


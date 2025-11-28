# CircuitSage: Electronics Repair Business Management System

![Backend CI](https://github.com/berrytechnics/circuit-sage/actions/workflows/backend-ci.yml/badge.svg)
![Frontend CI](https://github.com/berrytechnics/circuit-sage/actions/workflows/frontend-ci.yml/badge.svg)

A comprehensive management system for electronics repair businesses with ticketing, inventory management, invoicing, and customer management features.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Database Management](#database-management)
- [API Documentation](#api-documentation)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Overview

CircuitSage is a full-stack web application designed to manage all aspects of an electronics repair business. The system provides:

- **Customer Management**: Complete customer profiles with contact information and history
- **Ticketing System**: Track repair jobs from intake to completion with status updates, technician assignment, and notes
- **Invoicing**: Generate invoices with line items, tax calculation, and payment tracking
- **Inventory Management**: Track parts and supplies with reorder thresholds
- **Purchase Orders**: Manage supplier orders and receiving
- **Multi-Tenancy**: Support for multiple companies with location-based organization
- **Role-Based Access Control**: Granular permissions system for different user roles

## Technology Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **ORM**: Kysely (type-safe SQL query builder)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: express-validator
- **Logging**: Winston

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **State Management**: Zustand
- **HTTP Client**: Axios

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Testing**: Jest (backend), Playwright (E2E)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (version 20.10+) and **Docker Compose** (version 2.0+)
- **Node.js** (version 18+) - for local development outside Docker
- **npm** or **yarn** - for managing dependencies
- **Git** - for version control

### Verifying Installation

```bash
docker --version
docker-compose --version
node --version
npm --version
```

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/berrytechnics/circuit-sage.git
cd circuit-sage
```

### 2. Install Root Dependencies

```bash
npm install
```

This installs the CircuitSage CLI tool and its dependencies.

### 3. Start the Application

The CLI automatically handles environment setup and container management:

```bash
# Development mode with live logs
npm run dev

# Development mode in background (detached)
npm run dev -- -d

# Production mode
npm run start
```

The first run will:
- Create `.env` files from examples if they don't exist
- Build Docker images
- Start PostgreSQL, backend API, and frontend containers
- Run database migrations automatically

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Health Check**: http://localhost:4000/health
- **Database**: localhost:5432 (credentials in `docker-compose.yml`)

### 5. Default Login Credentials

After initialization, log in with:

- **Email**: admin@circuitsage.com
- **Password**: admin123

**⚠️ Important**: Change the default admin password immediately after first login!

## Project Structure

```
circuit-sage/
├── backend/                    # Express TypeScript backend
│   ├── src/
│   │   ├── __tests__/          # Test suites
│   │   ├── config/             # Configuration (DB, errors, logger, types, permissions)
│   │   ├── middlewares/        # Express middlewares (auth, RBAC, validation, tenant)
│   │   ├── routes/             # API route handlers
│   │   ├── services/           # Business logic layer
│   │   ├── utils/              # Utility functions (asyncHandler, auth helpers)
│   │   ├── validators/         # Request validation schemas
│   │   ├── app.ts              # Express app configuration
│   │   └── server.ts           # Server entry point
│   ├── scripts/                # Utility scripts (migrations, role updates)
│   ├── Dockerfile              # Production Docker image
│   ├── Dockerfile.dev          # Development Docker image
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
├── frontend/                   # Next.js TypeScript frontend
│   ├── src/
│   │   ├── __tests__/          # Test files
│   │   ├── app/                # Next.js App Router pages
│   │   │   ├── customers/      # Customer management pages
│   │   │   ├── tickets/        # Ticket management pages
│   │   │   ├── invoices/       # Invoice management pages
│   │   │   ├── inventory/      # Inventory management pages
│   │   │   ├── purchase-orders/ # Purchase order pages
│   │   │   ├── locations/      # Location management pages
│   │   │   ├── assets/         # Asset management pages
│   │   │   ├── settings/       # Settings and permissions pages
│   │   │   ├── dashboard/      # Dashboard page
│   │   │   ├── login/          # Authentication pages
│   │   │   └── register/       # Registration page
│   │   ├── components/         # Reusable React components
│   │   ├── lib/                # Utilities and API clients
│   │   │   ├── api/           # API client functions
│   │   │   ├── utils/         # Helper utilities
│   │   │   ├── ThemeContext.tsx
│   │   │   └── UserContext.tsx
│   │   └── styles/            # Global styles
│   ├── e2e/                   # Playwright E2E tests
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.js
├── database/
│   ├── init/                  # Database initialization scripts
│   ├── migrations/            # Database migration files
│   └── scripts/               # Database utility scripts
├── planning/                  # Project planning documents
├── docker-compose.yml         # Docker Compose configuration
├── cli.js                     # CircuitSage CLI tool
├── package.json               # Root package.json with CLI commands
├── README.md                  # This file
└── QUICK_START.md            # User-focused quick start guide
```

## Architecture

### Backend Architecture

The backend follows a layered architecture:

1. **Routes Layer** (`src/routes/`): Define API endpoints and HTTP methods
2. **Middleware Layer** (`src/middlewares/`): Handle authentication, authorization, validation, and tenant isolation
3. **Service Layer** (`src/services/`): Contains business logic and database operations
4. **Database Layer**: PostgreSQL with Kysely for type-safe queries

### Request Flow

```
HTTP Request
  ↓
Route Handler (routes/)
  ↓
Authentication Middleware (JWT validation)
  ↓
RBAC Middleware (Permission checking)
  ↓
Tenant Middleware (Company/Location isolation)
  ↓
Validation Middleware (Request validation)
  ↓
Service Layer (Business logic)
  ↓
Database (Kysely queries)
  ↓
Response
```

### Frontend Architecture

The frontend uses Next.js 14 App Router:

- **Pages**: Server and client components in `src/app/`
- **Components**: Reusable UI components in `src/components/`
- **API Clients**: Centralized API functions in `src/lib/api/`
- **Context**: User and Theme context for global state
- **Permissions**: Client-side permission checking via `UserContext`

### Multi-Tenancy

The system supports multiple companies, each with:
- Multiple locations
- Company-specific role permissions
- Isolated data (customers, tickets, invoices, etc.)
- Location-based filtering

## Development Workflow

### Using the CircuitSage CLI

The project includes a powerful CLI tool for common development tasks:

```bash
# View all available commands
node cli.js --help

# Or use npm scripts (recommended)
npm run dev          # Start development environment
npm run start        # Start production environment
npm run stop         # Stop containers
npm run stop -- -r   # Stop and remove containers
npm run cleanup      # Clean up all Docker resources
npm run logs         # View container logs
npm run logs -- -s backend --follow  # Follow backend logs
npm run health       # Check service health
npm run shell -- -s backend  # Open shell in backend container
```

### Local Development (Without Docker)

#### Backend

```bash
cd backend
npm install  # or yarn install

# Create .env file from example
cp .env.example .env

# Start PostgreSQL (or use Docker for DB only)
docker-compose up -d postgres

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

#### Frontend

```bash
cd frontend
npm install  # or yarn install

# Create .env file from example
cp .env.example .env

# Start development server
npm run dev
```

### Hot Reloading

Both backend and frontend support hot reloading in development mode:

- **Backend**: Uses `ts-node-dev` for automatic restarts on file changes
- **Frontend**: Next.js built-in hot module replacement

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for both backend and frontend
- **Prettier**: Recommended (not enforced)

Run linting:

```bash
# Backend
cd backend && npm run lint

# Frontend
cd frontend && npm run lint
```

## Testing

### Backend Tests

Backend tests use Jest and Supertest:

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Test files are located in `backend/src/__tests__/`:
- Route integration tests
- Service layer tests
- Authentication and validation tests

### Frontend Tests

```bash
cd frontend

# Unit tests (Jest)
npm test

# E2E tests (Playwright)
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

### Running Tests via CLI

```bash
# Run backend tests
npm run test -- -s backend

# Run with coverage
npm run test -- -s backend --coverage
```

## Database Management

### Migrations

The project uses SQL migrations stored in `database/migrations/`:

```bash
# Run migrations
npm run db:migrate

# Undo last migration
npm run db:migrate:undo

# Reset database (undo all, then migrate)
npm run db:reset

# Undo all migrations
npm run db:migrate:undo -- --all
```

### Database Access

```bash
# Open PostgreSQL shell
npm run shell -- -s db

# Or directly
docker exec -it circuit-sage-db psql -U repair_admin -d repair_business
```

### Backups

```bash
# Create backup
npm run db:backup

# Create backup with custom filename
npm run db:backup -- -o my-backup.sql

# Restore backup
npm run db:restore my-backup.sql
```

## API Documentation

### Authentication

All endpoints (except `/user/register`, `/user/login`, and `/health`) require authentication via JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Core Endpoints

#### Customers
- `GET /api/customer` - List customers (with search)
- `GET /api/customer/:id` - Get customer details
- `POST /api/customer` - Create customer
- `PUT /api/customer/:id` - Update customer
- `DELETE /api/customer/:id` - Delete customer (soft delete)
- `GET /api/customer/:id/tickets` - Get customer's tickets

#### Tickets
- `GET /api/ticket` - List tickets (with filters)
- `GET /api/ticket/:id` - Get ticket details
- `POST /api/ticket` - Create ticket
- `PUT /api/ticket/:id` - Update ticket
- `POST /api/ticket/:id/assign` - Assign/unassign technician
- `POST /api/ticket/:id/status` - Update status
- `POST /api/ticket/:id/diagnostic-notes` - Add diagnostic notes
- `POST /api/ticket/:id/repair-notes` - Add repair notes
- `DELETE /api/ticket/:id` - Delete ticket (soft delete)

#### Invoices
- `GET /api/invoice` - List invoices (with filters)
- `GET /api/invoice/:id` - Get invoice details
- `POST /api/invoice` - Create invoice
- `PUT /api/invoice/:id` - Update invoice
- `POST /api/invoice/:id/items` - Add invoice item
- `PUT /api/invoice/:id/items/:itemId` - Update invoice item
- `DELETE /api/invoice/:id/items/:itemId` - Remove invoice item
- `POST /api/invoice/:id/paid` - Mark invoice as paid
- `DELETE /api/invoice/:id` - Delete invoice (soft delete)

#### Inventory
- `GET /api/inventory` - List inventory items
- `GET /api/inventory/:id` - Get inventory item
- `POST /api/inventory` - Create inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item

#### Purchase Orders
- `GET /api/purchase-order` - List purchase orders
- `GET /api/purchase-order/:id` - Get purchase order
- `POST /api/purchase-order` - Create purchase order
- `PUT /api/purchase-order/:id` - Update purchase order
- `POST /api/purchase-order/:id/receive` - Receive purchase order
- `POST /api/purchase-order/:id/cancel` - Cancel purchase order
- `DELETE /api/purchase-order/:id` - Delete purchase order

### Health Check

- `GET /health` - Service health check (no authentication required)

## Common Tasks

### Adding a New Feature

1. **Database**: Create migration in `database/migrations/`
2. **Backend**: 
   - Add types in `backend/src/config/types.ts`
   - Create service in `backend/src/services/`
   - Create routes in `backend/src/routes/`
   - Add validators in `backend/src/validators/`
   - Add permissions in `backend/src/config/permissions.ts`
3. **Frontend**:
   - Create API client in `frontend/src/lib/api/`
   - Create pages in `frontend/src/app/`
   - Add components in `frontend/src/components/`
4. **Tests**: Add tests in respective `__tests__/` directories

### Debugging

```bash
# View logs
npm run logs

# View specific service logs
npm run logs -- -s backend --follow

# Check service health
npm run health

# Open shell in container
npm run shell -- -s backend
```

### Environment Variables

Backend (`.env`):
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `PORT` (default: 4000)
- `NODE_ENV`

Frontend (`.env`):
- `NEXT_PUBLIC_API_URL` (default: http://localhost:4000/api)

## Troubleshooting

### Containers Won't Start

```bash
# Check Docker is running
docker ps

# View container logs
npm run logs

# Check container status
npm run status

# Restart containers
npm run restart
```

### Database Connection Issues

```bash
# Verify database is running
docker ps | grep circuit-sage-db

# Check database logs
npm run logs -- -s db

# Test database connection
npm run shell -- -s db
```

### Port Already in Use

If ports 3000, 4000, or 5432 are in use:

1. Stop conflicting services, or
2. Modify `docker-compose.yml` to use different ports

### Frontend Build Errors

```bash
# Clear Next.js cache
cd frontend
rm -rf .next

# Rebuild
npm run build
```

### Backend Type Errors

```bash
# Run type checking
cd backend
npx tsc --noEmit
```

### Permission Denied Errors

Ensure Docker has proper permissions and the user is in the `docker` group (Linux).

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write or update tests
5. Ensure all tests pass (`npm run ci:all`)
6. Commit your changes (`git commit -m 'Add some amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Quality Checks

Before submitting a PR, run:

```bash
# Backend checks
npm run ci:backend

# Frontend checks
npm run ci:frontend

# All checks
npm run ci:all
```

## Project Status

**Current Progress: ~80% Complete**

### Completed Features
- ✅ Multi-tenant architecture with company/location support
- ✅ Customer management (CRUD)
- ✅ Ticketing system with status tracking and notes
- ✅ Invoicing with line items and payment tracking
- ✅ Inventory management
- ✅ Purchase orders
- ✅ Inventory transfers (location-to-location transfers with two-step workflow)
- ✅ Asset management (customer device tracking)
- ✅ Role-based access control (RBAC)
- ✅ User authentication and authorization
- ✅ Comprehensive backend test suite (118+ tests)
- ✅ E2E testing framework (Playwright)

### In Progress
- 🟡 Frontend unit testing
- 🟡 Reporting and analytics (basic placeholders exist)

### Planned Features
- ⏳ Diagnostic checklist system
- ⏳ Communication tools (email/SMS)
- ⏳ Payment processing integration
- ⏳ Advanced reporting and analytics

See `planning/progress/` for detailed progress reports.

## License

This project is proprietary software. All rights reserved.

## Additional Resources

- [QUICK_START.md](./QUICK_START.md) - User-focused quick start guide
- [TESTING_METHODOLOGY.md](./TESTING_METHODOLOGY.md) - Testing guidelines and practices
- `planning/MVP.md` - MVP specification
- `planning/PLAN.md` - Development roadmap

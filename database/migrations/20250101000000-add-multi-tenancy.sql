-- Migration: Add Multi-Tenancy Support
-- Description: Adds companies table and company_id columns to all tenant-scoped tables
-- Date: 2025-01-01

-- Step 1: Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE,
  plan VARCHAR(50) NOT NULL DEFAULT 'free',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Step 2: Add company_id to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
-- Drop old unique constraint on email
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
-- Add new unique constraint: email + company_id (allows same email in different companies)
ALTER TABLE users ADD CONSTRAINT users_email_company_unique UNIQUE(email, company_id);

-- Step 3: Add company_id to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
-- Make company_id NOT NULL after we migrate existing data
-- We'll do this in a separate step after data migration

-- Step 4: Add company_id to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- Step 5: Add company_id to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- Step 6: Add company_id to inventory_items table
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
-- Drop old unique constraint on sku
ALTER TABLE inventory_items DROP CONSTRAINT IF EXISTS inventory_items_sku_key;
-- Add new unique constraint: sku + company_id (allows same SKU in different companies)
ALTER TABLE inventory_items ADD CONSTRAINT inventory_items_sku_company_unique UNIQUE(sku, company_id);

-- Step 7: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_tickets_company_id ON tickets(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_company_id ON inventory_items(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_subdomain ON companies(subdomain);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);

-- Step 8: Create default company for existing data migration
-- This will be used to migrate existing data
INSERT INTO companies (id, name, subdomain, plan, status)
VALUES (
  uuid_generate_v4(),
  'Default Company',
  'default',
  'free',
  'active'
)
ON CONFLICT (subdomain) DO NOTHING
RETURNING id;

-- Step 9: Migrate existing users to default company
-- Get the default company ID and update all existing users
UPDATE users
SET company_id = (SELECT id FROM companies WHERE subdomain = 'default' LIMIT 1)
WHERE company_id IS NULL;

-- Step 10: Migrate existing customers to default company
UPDATE customers
SET company_id = (SELECT id FROM companies WHERE subdomain = 'default' LIMIT 1)
WHERE company_id IS NULL;

-- Step 11: Migrate existing tickets to default company
UPDATE tickets
SET company_id = (SELECT id FROM companies WHERE subdomain = 'default' LIMIT 1)
WHERE company_id IS NULL;

-- Step 12: Migrate existing invoices to default company
UPDATE invoices
SET company_id = (SELECT id FROM companies WHERE subdomain = 'default' LIMIT 1)
WHERE company_id IS NULL;

-- Step 13: Migrate existing inventory_items to default company
UPDATE inventory_items
SET company_id = (SELECT id FROM companies WHERE subdomain = 'default' LIMIT 1)
WHERE company_id IS NULL;

-- Step 14: Now make company_id NOT NULL on all tables (after data migration)
ALTER TABLE users ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE customers ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE tickets ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE invoices ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE inventory_items ALTER COLUMN company_id SET NOT NULL;


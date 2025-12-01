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

-- Step 2: Create indexes on companies table
CREATE INDEX IF NOT EXISTS idx_companies_subdomain ON companies(subdomain);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);

-- Step 3: Add company_id columns WITHOUT foreign key constraints first
-- This allows us to add the columns even if we need to populate data before adding constraints
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS company_id UUID;

-- Step 4: Create default company for existing data migration
INSERT INTO companies (id, name, subdomain, plan, status)
VALUES (
  uuid_generate_v4(),
  'Default Company',
  'default',
  'free',
  'active'
)
ON CONFLICT (subdomain) DO NOTHING;

-- Step 5: Migrate existing data to default company
UPDATE users
SET company_id = (SELECT id FROM companies WHERE subdomain = 'default' LIMIT 1)
WHERE company_id IS NULL;

UPDATE customers
SET company_id = (SELECT id FROM companies WHERE subdomain = 'default' LIMIT 1)
WHERE company_id IS NULL;

UPDATE tickets
SET company_id = (SELECT id FROM companies WHERE subdomain = 'default' LIMIT 1)
WHERE company_id IS NULL;

UPDATE invoices
SET company_id = (SELECT id FROM companies WHERE subdomain = 'default' LIMIT 1)
WHERE company_id IS NULL;

UPDATE inventory_items
SET company_id = (SELECT id FROM companies WHERE subdomain = 'default' LIMIT 1)
WHERE company_id IS NULL;

-- Step 6: Add foreign key constraints now that data is populated
DO $$
BEGIN
  -- Add foreign key constraint to users if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_company_id_fkey'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id);
  END IF;
  
  -- Add foreign key constraint to customers if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'customers_company_id_fkey'
  ) THEN
    ALTER TABLE customers ADD CONSTRAINT customers_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id);
  END IF;
  
  -- Add foreign key constraint to tickets if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tickets_company_id_fkey'
  ) THEN
    ALTER TABLE tickets ADD CONSTRAINT tickets_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id);
  END IF;
  
  -- Add foreign key constraint to invoices if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invoices_company_id_fkey'
  ) THEN
    ALTER TABLE invoices ADD CONSTRAINT invoices_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id);
  END IF;
  
  -- Add foreign key constraint to inventory_items if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'inventory_items_company_id_fkey'
  ) THEN
    ALTER TABLE inventory_items ADD CONSTRAINT inventory_items_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id);
  END IF;
END $$;

-- Step 7: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_tickets_company_id ON tickets(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_company_id ON inventory_items(company_id);

-- Step 8: Update unique constraints
-- Drop old unique constraint on email if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

-- Add new unique constraint: email + company_id (allows same email in different companies)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_email_company_unique'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_company_unique UNIQUE(email, company_id);
  END IF;
END $$;

-- Drop old unique constraint on sku if it exists
ALTER TABLE inventory_items DROP CONSTRAINT IF EXISTS inventory_items_sku_key;

-- Add new unique constraint: sku + company_id (allows same SKU in different companies)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'inventory_items_sku_company_unique'
  ) THEN
    ALTER TABLE inventory_items ADD CONSTRAINT inventory_items_sku_company_unique UNIQUE(sku, company_id);
  END IF;
END $$;

-- Step 9: Make company_id NOT NULL on all tables (after data migration and constraints)
ALTER TABLE users ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE customers ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE tickets ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE invoices ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE inventory_items ALTER COLUMN company_id SET NOT NULL;


-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'technician',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  technician_id UUID REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  device_type VARCHAR(100) NOT NULL,
  device_brand VARCHAR(100),
  device_model VARCHAR(100),
  serial_number VARCHAR(100),
  issue_description TEXT NOT NULL,
  diagnostic_notes TEXT,
  repair_notes TEXT,
  estimated_completion_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  brand VARCHAR(100),
  model VARCHAR(100),
  compatible_with VARCHAR(255)[],
  cost_price DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 5,
  location VARCHAR(100),
  supplier VARCHAR(100),
  supplier_part_number VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  ticket_id UUID REFERENCES tickets(id),
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  issue_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  paid_date TIMESTAMP WITH TIME ZONE,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  inventory_item_id UUID REFERENCES inventory_items(id),
  description VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  discount_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_tickets_customer_id ON tickets(customer_id);
CREATE INDEX idx_tickets_technician_id ON tickets(technician_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_ticket_id ON invoices(ticket_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_inventory_item_id ON invoice_items(inventory_item_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_name ON customers(last_name, first_name);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_brand_model ON inventory_items(brand, model);
CREATE INDEX idx_inventory_items_active ON inventory_items(is_active);

-- Create admin user (password: admin123)
-- WARNING: This is for development only! Remove or update this user before production deployment.
-- Run: yarn ts-node backend/scripts/remove-default-admin.ts
-- See: docs/SECURITY.md for more information
INSERT INTO users (first_name, last_name, email, password, role)
VALUES (
  'Admin',
  'User',
  'admin@repairmanager.com',
  '$2a$10$X5S5/CrxZu0UIfK6ORHCGugAp7bOvwB5lnuU.6zKjZHZD3GDk3nV.', -- hashed 'admin123'
  'admin'
);

-- Create sample device categories and subcategories
CREATE TABLE IF NOT EXISTS device_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS device_subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES device_categories(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(category_id, name)
);

-- Insert sample device categories
INSERT INTO device_categories (name, description) VALUES
('Smartphones', 'Mobile phones with advanced features'),
('Tablets', 'Portable touchscreen computers'),
('Laptops', 'Portable personal computers'),
('Desktops', 'Stationary personal computers'),
('TVs', 'Television sets and monitors'),
('Audio', 'Sound systems and audio devices'),
('Gaming', 'Video game consoles and accessories'),
('Other', 'Miscellaneous electronic devices');

-- Insert sample device subcategories
INSERT INTO device_subcategories (category_id, name) VALUES
((SELECT id FROM device_categories WHERE name = 'Smartphones'), 'iPhone'),
((SELECT id FROM device_categories WHERE name = 'Smartphones'), 'Samsung'),
((SELECT id FROM device_categories WHERE name = 'Smartphones'), 'Google'),
((SELECT id FROM device_categories WHERE name = 'Smartphones'), 'Other'),
((SELECT id FROM device_categories WHERE name = 'Tablets'), 'iPad'),
((SELECT id FROM device_categories WHERE name = 'Tablets'), 'Samsung'),
((SELECT id FROM device_categories WHERE name = 'Tablets'), 'Other'),
((SELECT id FROM device_categories WHERE name = 'Laptops'), 'Apple'),
((SELECT id FROM device_categories WHERE name = 'Laptops'), 'HP'),
((SELECT id FROM device_categories WHERE name = 'Laptops'), 'Dell'),
((SELECT id FROM device_categories WHERE name = 'Laptops'), 'Lenovo'),
((SELECT id FROM device_categories WHERE name = 'Laptops'), 'Other'),
((SELECT id FROM device_categories WHERE name = 'Desktops'), 'Apple'),
((SELECT id FROM device_categories WHERE name = 'Desktops'), 'HP'),
((SELECT id FROM device_categories WHERE name = 'Desktops'), 'Dell'),
((SELECT id FROM device_categories WHERE name = 'Desktops'), 'Custom'),
((SELECT id FROM device_categories WHERE name = 'Desktops'), 'Other'),
((SELECT id FROM device_categories WHERE name = 'TVs'), 'Samsung'),
((SELECT id FROM device_categories WHERE name = 'TVs'), 'LG'),
((SELECT id FROM device_categories WHERE name = 'TVs'), 'Sony'),
((SELECT id FROM device_categories WHERE name = 'TVs'), 'Other'),
((SELECT id FROM device_categories WHERE name = 'Audio'), 'Headphones'),
((SELECT id FROM device_categories WHERE name = 'Audio'), 'Speakers'),
((SELECT id FROM device_categories WHERE name = 'Audio'), 'Receivers'),
((SELECT id FROM device_categories WHERE name = 'Audio'), 'Other'),
((SELECT id FROM device_categories WHERE name = 'Gaming'), 'PlayStation'),
((SELECT id FROM device_categories WHERE name = 'Gaming'), 'Xbox'),
((SELECT id FROM device_categories WHERE name = 'Gaming'), 'Nintendo'),
((SELECT id FROM device_categories WHERE name = 'Gaming'), 'Other');
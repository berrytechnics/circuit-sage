-- Migration: Add Inventory Transfer Permissions
-- Description: Adds inventory transfer permissions to existing role_permissions for all companies
-- Date: 2025-02-03

-- Update initialize_company_permissions function to include inventory transfer permissions
CREATE OR REPLACE FUNCTION initialize_company_permissions(p_company_id UUID)
RETURNS void AS $$
BEGIN
  -- Admin permissions
  INSERT INTO role_permissions (company_id, role, permission) VALUES
  (p_company_id, 'admin', 'customers.read'),
  (p_company_id, 'admin', 'customers.create'),
  (p_company_id, 'admin', 'customers.update'),
  (p_company_id, 'admin', 'customers.delete'),
  (p_company_id, 'admin', 'tickets.read'),
  (p_company_id, 'admin', 'tickets.create'),
  (p_company_id, 'admin', 'tickets.update'),
  (p_company_id, 'admin', 'tickets.assign'),
  (p_company_id, 'admin', 'tickets.updateStatus'),
  (p_company_id, 'admin', 'tickets.addNotes'),
  (p_company_id, 'admin', 'tickets.delete'),
  (p_company_id, 'admin', 'invoices.read'),
  (p_company_id, 'admin', 'invoices.create'),
  (p_company_id, 'admin', 'invoices.update'),
  (p_company_id, 'admin', 'invoices.delete'),
  (p_company_id, 'admin', 'invoices.manageItems'),
  (p_company_id, 'admin', 'invoices.markPaid'),
  (p_company_id, 'admin', 'inventory.read'),
  (p_company_id, 'admin', 'inventory.create'),
  (p_company_id, 'admin', 'inventory.update'),
  (p_company_id, 'admin', 'inventory.delete'),
  (p_company_id, 'admin', 'purchaseOrders.read'),
  (p_company_id, 'admin', 'purchaseOrders.create'),
  (p_company_id, 'admin', 'purchaseOrders.update'),
  (p_company_id, 'admin', 'purchaseOrders.receive'),
  (p_company_id, 'admin', 'purchaseOrders.cancel'),
  (p_company_id, 'admin', 'purchaseOrders.delete'),
  (p_company_id, 'admin', 'inventoryTransfers.read'),
  (p_company_id, 'admin', 'inventoryTransfers.create'),
  (p_company_id, 'admin', 'inventoryTransfers.complete'),
  (p_company_id, 'admin', 'inventoryTransfers.cancel'),
  (p_company_id, 'admin', 'invitations.read'),
  (p_company_id, 'admin', 'invitations.create'),
  (p_company_id, 'admin', 'invitations.delete'),
  (p_company_id, 'admin', 'settings.access'),
  (p_company_id, 'admin', 'permissions.view'),
  (p_company_id, 'admin', 'permissions.manage')
ON CONFLICT (company_id, role, permission) DO NOTHING;

  -- Manager permissions
  INSERT INTO role_permissions (company_id, role, permission) VALUES
  (p_company_id, 'manager', 'customers.read'),
  (p_company_id, 'manager', 'customers.create'),
  (p_company_id, 'manager', 'customers.update'),
  (p_company_id, 'manager', 'tickets.read'),
  (p_company_id, 'manager', 'tickets.assign'),
  (p_company_id, 'manager', 'tickets.updateStatus'),
  (p_company_id, 'manager', 'invoices.read'),
  (p_company_id, 'manager', 'invoices.create'),
  (p_company_id, 'manager', 'invoices.update'),
  (p_company_id, 'manager', 'invoices.manageItems'),
  (p_company_id, 'manager', 'invoices.markPaid'),
  (p_company_id, 'manager', 'inventory.read'),
  (p_company_id, 'manager', 'inventory.create'),
  (p_company_id, 'manager', 'inventory.update'),
  (p_company_id, 'manager', 'inventory.delete'),
  (p_company_id, 'manager', 'purchaseOrders.read'),
  (p_company_id, 'manager', 'purchaseOrders.create'),
  (p_company_id, 'manager', 'purchaseOrders.update'),
  (p_company_id, 'manager', 'purchaseOrders.receive'),
  (p_company_id, 'manager', 'purchaseOrders.cancel'),
  (p_company_id, 'manager', 'inventoryTransfers.read'),
  (p_company_id, 'manager', 'inventoryTransfers.create'),
  (p_company_id, 'manager', 'inventoryTransfers.complete'),
  (p_company_id, 'manager', 'inventoryTransfers.cancel'),
  (p_company_id, 'manager', 'settings.access')
ON CONFLICT (company_id, role, permission) DO NOTHING;

  -- Technician permissions
  INSERT INTO role_permissions (company_id, role, permission) VALUES
  (p_company_id, 'technician', 'customers.read'),
  (p_company_id, 'technician', 'tickets.read'),
  (p_company_id, 'technician', 'tickets.create'),
  (p_company_id, 'technician', 'tickets.update'),
  (p_company_id, 'technician', 'tickets.updateStatus'),
  (p_company_id, 'technician', 'tickets.addNotes'),
  (p_company_id, 'technician', 'invoices.read'),
  (p_company_id, 'technician', 'inventory.read'),
  (p_company_id, 'technician', 'purchaseOrders.read'),
  (p_company_id, 'technician', 'inventoryTransfers.read'),
  (p_company_id, 'technician', 'settings.access')
ON CONFLICT (company_id, role, permission) DO NOTHING;

  -- Frontdesk permissions
  INSERT INTO role_permissions (company_id, role, permission) VALUES
  (p_company_id, 'frontdesk', 'customers.read'),
  (p_company_id, 'frontdesk', 'customers.create'),
  (p_company_id, 'frontdesk', 'customers.update'),
  (p_company_id, 'frontdesk', 'tickets.read'),
  (p_company_id, 'frontdesk', 'tickets.create'),
  (p_company_id, 'frontdesk', 'inventory.read'),
  (p_company_id, 'frontdesk', 'purchaseOrders.read'),
  (p_company_id, 'frontdesk', 'settings.access')
ON CONFLICT (company_id, role, permission) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Add inventory transfer permissions to all existing companies
DO $$
DECLARE
  company_record RECORD;
BEGIN
  FOR company_record IN SELECT id FROM companies LOOP
    -- Add admin permissions
    INSERT INTO role_permissions (company_id, role, permission) VALUES
    (company_record.id, 'admin', 'inventoryTransfers.read'),
    (company_record.id, 'admin', 'inventoryTransfers.create'),
    (company_record.id, 'admin', 'inventoryTransfers.complete'),
    (company_record.id, 'admin', 'inventoryTransfers.cancel')
    ON CONFLICT (company_id, role, permission) DO NOTHING;
    
    -- Add manager permissions
    INSERT INTO role_permissions (company_id, role, permission) VALUES
    (company_record.id, 'manager', 'inventoryTransfers.read'),
    (company_record.id, 'manager', 'inventoryTransfers.create'),
    (company_record.id, 'manager', 'inventoryTransfers.complete'),
    (company_record.id, 'manager', 'inventoryTransfers.cancel')
    ON CONFLICT (company_id, role, permission) DO NOTHING;
    
    -- Add technician permissions (read only)
    INSERT INTO role_permissions (company_id, role, permission) VALUES
    (company_record.id, 'technician', 'inventoryTransfers.read')
    ON CONFLICT (company_id, role, permission) DO NOTHING;
  END LOOP;
END $$;


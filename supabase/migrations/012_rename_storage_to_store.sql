-- Migration: Rename Storage Room to Store and add Sales Channel
-- Date: 2026-03-01
-- Description: Update storage_rooms table to stores, add sales_channel column to items

-- Step 1: Rename storage_rooms table to stores
ALTER TABLE storage_rooms RENAME TO stores;

-- Step 2: Rename column in stores table for clarity
ALTER TABLE stores RENAME COLUMN name TO store_name;

-- Step 3: Add sales_channel column to stores table
ALTER TABLE stores 
  ADD COLUMN IF NOT EXISTS sales_channel TEXT DEFAULT 'Physical Store';

-- Step 4: Update existing stores with default sales channel
UPDATE stores 
SET sales_channel = 'Physical Store' 
WHERE sales_channel IS NULL OR sales_channel = '';

-- Step 5: Make sales_channel NOT NULL after setting defaults
ALTER TABLE stores 
  ALTER COLUMN sales_channel SET NOT NULL;

-- Step 6: Rename storage_room column to store in inventory table
ALTER TABLE inventory 
  RENAME COLUMN storage_room TO store;

-- Step 7: Add sales_channel column to inventory table
ALTER TABLE inventory 
  ADD COLUMN IF NOT EXISTS sales_channel TEXT;

-- Step 8: Update inventory.sales_channel based on their store
-- This will populate sales_channel from the stores table
UPDATE inventory 
SET sales_channel = stores.sales_channel
FROM stores
WHERE inventory.store = stores.store_name;

-- Step 9: Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stores_sales_channel ON stores(sales_channel);
CREATE INDEX IF NOT EXISTS idx_inventory_store ON inventory(store);
CREATE INDEX IF NOT EXISTS idx_inventory_sales_channel ON inventory(sales_channel);

-- Step 10: Add some sample stores (skip if they cause errors)
-- You can add stores manually later through the UI
DO $$
BEGIN
  INSERT INTO stores (store_name, sales_channel)
  VALUES
    ('Shopee Mall Store', 'Shopee'),
    ('Shopee Official Store', 'Shopee'),
    ('Lazada Flagship', 'Lazada'),
    ('Lazada Partner Store', 'Lazada'),
    ('Facebook Main Page', 'Facebook'),
    ('Facebook Marketplace', 'Facebook'),
    ('TikTok Shop', 'TikTok'),
    ('Manila Branch', 'Physical Store'),
    ('Quezon City Branch', 'Physical Store'),
    ('Makati Branch', 'Physical Store');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Sample stores not inserted - you can add them manually';
END $$;

-- Step 11: Add comment to tables for documentation
COMMENT ON TABLE stores IS 'Stores organized by sales channel (Shopee, Lazada, Facebook, TikTok, Physical Store)';
COMMENT ON COLUMN stores.sales_channel IS 'Sales channel this store belongs to';
COMMENT ON COLUMN inventory.store IS 'Store name where item is located';
COMMENT ON COLUMN inventory.sales_channel IS 'Sales channel for this item';

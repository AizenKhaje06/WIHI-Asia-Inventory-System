-- Migration: Drop unique constraint to allow product variants
-- Date: 2026-06-09
-- Description: Remove unique constraint on (name, store, sales_channel) 
--              to allow creating product variants with different COGS/prices

-- Drop the unique constraint
ALTER TABLE inventory 
DROP CONSTRAINT IF EXISTS inventory_name_store_channel_unique;

-- Add comment for documentation
COMMENT ON TABLE inventory IS 'Inventory items. Products can have duplicate names with different COGS/prices to support variants.';

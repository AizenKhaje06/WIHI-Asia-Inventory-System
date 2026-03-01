-- ROLLBACK Migration: Revert Store changes back to Storage Room
-- Date: 2026-03-01
-- Description: Rollback script to undo storage_rooms to stores migration
-- WARNING: Only run this if you need to revert the changes!

-- Step 1: Remove sales_channel column from inventory
ALTER TABLE inventory 
  DROP COLUMN IF EXISTS sales_channel;

-- Step 2: Rename store column back to storage_room in inventory
ALTER TABLE inventory 
  RENAME COLUMN store TO storage_room;

-- Step 3: Remove sales_channel column from stores
ALTER TABLE stores 
  DROP COLUMN IF EXISTS sales_channel;

-- Step 4: Rename store_name back to name in stores
ALTER TABLE stores 
  RENAME COLUMN store_name TO name;

-- Step 5: Rename stores table back to storage_rooms
ALTER TABLE stores RENAME TO storage_rooms;

-- Step 6: Drop indexes
DROP INDEX IF EXISTS idx_stores_sales_channel;
DROP INDEX IF EXISTS idx_stores_active;
DROP INDEX IF EXISTS idx_inventory_store;
DROP INDEX IF EXISTS idx_inventory_sales_channel;

-- Step 7: Recreate old indexes
CREATE INDEX IF NOT EXISTS idx_inventory_storage_room ON inventory(storage_room);

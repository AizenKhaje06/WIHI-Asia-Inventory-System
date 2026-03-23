-- Migration: Add unique constraint to prevent duplicate products
-- Prevents creating products with same name, store, and sales_channel

-- Add unique constraint on (name, store, sales_channel)
-- This ensures no duplicate products in the same store and sales channel
ALTER TABLE inventory 
ADD CONSTRAINT inventory_name_store_channel_unique 
UNIQUE (name, store, sales_channel);

-- Note: This will fail if there are existing duplicates
-- If migration fails, you need to manually merge/delete duplicates first

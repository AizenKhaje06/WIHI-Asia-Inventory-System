-- Migration: Remove foreign key constraint from transactions table
-- Date: 2026-03-08
-- Description: Allow transactions to reference both inventory items and bundles

-- Drop the foreign key constraint
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_item_id_fkey;

-- Add comment
COMMENT ON COLUMN transactions.item_id IS 'Item ID - can reference either inventory.id or bundles.id';

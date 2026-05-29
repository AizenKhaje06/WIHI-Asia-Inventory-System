-- ============================================
-- ADD restoration tracking columns
-- Migration 047
-- ============================================

-- Add restored_by column to track who restored the order
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS restored_by TEXT;

-- Add restored_at column to track when order was restored
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS restored_at TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN orders.restored_by IS 'Username of person who restored/uncancelled the order';
COMMENT ON COLUMN orders.restored_at IS 'Timestamp when order was restored/uncancelled';

-- Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('restored_by', 'restored_at');

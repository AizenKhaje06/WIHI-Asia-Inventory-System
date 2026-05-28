-- ============================================
-- ADD is_cancelled COLUMN TO orders TABLE
-- Migration 045
-- ============================================

-- Add is_cancelled column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN DEFAULT FALSE;

-- Add index for faster queries on cancelled orders
CREATE INDEX IF NOT EXISTS idx_orders_is_cancelled ON orders(is_cancelled);

-- Update existing orders to have is_cancelled = false
UPDATE orders 
SET is_cancelled = FALSE 
WHERE is_cancelled IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN orders.is_cancelled IS 'Indicates if order was cancelled by department before packing';

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'is_cancelled';

-- ============================================
-- ADD cancellation_reason AND cancelled_by COLUMNS
-- Migration 046
-- ============================================

-- Add cancellation_reason column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Add cancelled_by column to track who cancelled the order
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS cancelled_by TEXT;

-- Add cancelled_at column to track when order was cancelled
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN orders.cancellation_reason IS 'Reason provided when order was cancelled';
COMMENT ON COLUMN orders.cancelled_by IS 'Username of person who cancelled the order';
COMMENT ON COLUMN orders.cancelled_at IS 'Timestamp when order was cancelled';

-- Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('cancellation_reason', 'cancelled_by', 'cancelled_at');

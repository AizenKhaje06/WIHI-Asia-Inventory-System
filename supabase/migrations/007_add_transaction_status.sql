-- Migration: Add transaction status tracking
-- Purpose: Track cancelled, completed, and returned transactions
-- Date: 2026-02-22

-- Add status column to logs table
ALTER TABLE logs 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed' 
CHECK (status IN ('completed', 'cancelled', 'returned', 'pending'));

-- Add cancellation tracking columns
ALTER TABLE logs 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(100),
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster status queries
CREATE INDEX IF NOT EXISTS idx_logs_status ON logs(status);
CREATE INDEX IF NOT EXISTS idx_logs_cancelled_at ON logs(cancelled_at) WHERE cancelled_at IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN logs.status IS 'Transaction status: completed, cancelled, returned, or pending';
COMMENT ON COLUMN logs.cancellation_reason IS 'Reason for cancellation: customer_request, out_of_stock, payment_failed, etc.';
COMMENT ON COLUMN logs.cancelled_by IS 'Staff member who cancelled the transaction';
COMMENT ON COLUMN logs.cancelled_at IS 'Timestamp when transaction was cancelled';

-- Update existing records to have 'completed' status (safe default)
UPDATE logs 
SET status = 'completed' 
WHERE status IS NULL;

-- Add status tracking columns to transactions table
-- This allows tracking of cancelled, returned, and pending transactions

-- Add status column with default 'completed' for backward compatibility
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed';

-- Add cancellation tracking columns
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(100),
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster status filtering
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Create index for cancelled transactions analytics
CREATE INDEX IF NOT EXISTS idx_transactions_cancelled_at ON transactions(cancelled_at) 
WHERE cancelled_at IS NOT NULL;

-- Update existing transactions to have 'completed' status
UPDATE transactions 
SET status = 'completed' 
WHERE status IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN transactions.status IS 'Transaction status: completed, cancelled, returned, pending';
COMMENT ON COLUMN transactions.cancellation_reason IS 'Reason for cancellation: customer_request, out_of_stock, payment_failed, etc.';
COMMENT ON COLUMN transactions.cancelled_by IS 'Staff member who cancelled the transaction';
COMMENT ON COLUMN transactions.cancelled_at IS 'Timestamp when transaction was cancelled';

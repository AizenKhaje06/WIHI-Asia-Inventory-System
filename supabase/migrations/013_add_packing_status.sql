-- Migration: Add Packing Status to Transactions
-- Date: 2026-03-01
-- Description: Add columns for tracking packing status and who packed the order

-- Step 1: Add packing status column
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS packing_status TEXT DEFAULT 'Pending';

-- Step 2: Add packed by column (who packed the order)
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS packed_by TEXT;

-- Step 3: Add packed at timestamp
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS packed_at TIMESTAMP;

-- Step 4: Update existing transactions to have 'Pending' status
UPDATE transactions 
SET packing_status = 'Pending' 
WHERE packing_status IS NULL;

-- Step 5: Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_packing_status 
ON transactions(packing_status);

-- Step 6: Add comments for documentation
COMMENT ON COLUMN transactions.packing_status IS 'Packing status: Pending or Packed';
COMMENT ON COLUMN transactions.packed_by IS 'Name of person who packed the order';
COMMENT ON COLUMN transactions.packed_at IS 'Timestamp when order was packed';

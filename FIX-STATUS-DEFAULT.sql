-- Fix the status column default value issue
-- Run this in Supabase SQL Editor

-- Step 1: Check current status values
SELECT status, COUNT(*) as count
FROM transactions
GROUP BY status;

-- Step 2: Remove the default value from status column
ALTER TABLE transactions 
ALTER COLUMN status DROP DEFAULT;

-- Step 3: Verify the change
SELECT column_name, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'transactions' AND column_name = 'status';

-- Step 4: Check if cancelled transactions are visible
SELECT id, item_name, status, cancellation_reason
FROM transactions
WHERE status = 'cancelled'
ORDER BY cancelled_at DESC;

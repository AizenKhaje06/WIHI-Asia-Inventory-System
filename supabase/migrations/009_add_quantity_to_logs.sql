-- Migration: Add quantity column to logs for accurate inventory restoration
-- Purpose: Store quantity separately for easy cancellation and inventory restoration
-- Date: 2026-02-22

-- Add quantity column to logs table
ALTER TABLE logs 
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN logs.quantity IS 'Quantity of items in this transaction (for inventory restoration on cancellation)';

-- Backfill existing data from details field
-- This extracts "Qty: 5" from details and converts to integer
UPDATE logs 
SET quantity = CAST(
  SUBSTRING(details FROM 'Qty: ([0-9]+)') AS INTEGER
)
WHERE details LIKE '%Qty:%' AND quantity = 0;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_logs_quantity ON logs(quantity) WHERE quantity > 0;

-- Verify the migration
SELECT 
  COUNT(*) as total_logs,
  COUNT(CASE WHEN quantity > 0 THEN 1 END) as logs_with_quantity,
  SUM(quantity) as total_quantity
FROM logs;

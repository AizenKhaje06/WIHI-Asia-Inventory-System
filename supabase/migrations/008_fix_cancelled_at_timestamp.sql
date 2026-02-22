-- Migration: Fix cancelled_at timestamp type
-- Purpose: Change cancelled_at from TIMESTAMP to TIMESTAMP WITH TIME ZONE for consistency
-- Date: 2026-02-22

-- Fix the cancelled_at column type to include timezone
ALTER TABLE logs 
ALTER COLUMN cancelled_at TYPE TIMESTAMP WITH TIME ZONE;

-- Add CHECK constraint if not exists (user's manual migration may have skipped this)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'logs_status_check'
  ) THEN
    ALTER TABLE logs 
    ADD CONSTRAINT logs_status_check 
    CHECK (status IN ('completed', 'cancelled', 'returned', 'pending'));
  END IF;
END $$;

-- Verify the fix
COMMENT ON COLUMN logs.cancelled_at IS 'Timestamp when transaction was cancelled (with timezone for consistency)';

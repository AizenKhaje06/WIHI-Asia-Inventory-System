-- Migration: Add notes column to orders table
-- Date: 2026-03-05
-- Description: Add notes field for user input and make total amount editable

-- Add notes column
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS dispatch_notes TEXT;

-- Add comment
COMMENT ON COLUMN orders.dispatch_notes IS 'User notes or special instructions for the order dispatch';

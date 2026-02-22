-- Add customer contact details to transactions table for cancelled orders tracking
-- Migration: 011_add_customer_details_to_transactions.sql

-- Add customer contact fields to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_address TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_customer_phone ON transactions(customer_phone);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_email ON transactions(customer_email);

-- Add comment for documentation
COMMENT ON COLUMN transactions.customer_phone IS 'Customer contact number for order tracking and cancellation records';
COMMENT ON COLUMN transactions.customer_email IS 'Customer email for communication and records';
COMMENT ON COLUMN transactions.customer_address IS 'Customer address for delivery and verification purposes';

-- Update RLS policies to include new fields (if RLS is enabled)
-- No changes needed as existing policies cover all columns

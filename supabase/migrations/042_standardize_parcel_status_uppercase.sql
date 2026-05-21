-- Migration: Standardize Parcel Status to Uppercase
-- Date: 2026-05-21
-- Description: Change parcel_status values from mixed case to uppercase for consistency

-- Step 1: Update existing records to uppercase
UPDATE orders 
SET parcel_status = UPPER(parcel_status)
WHERE parcel_status IS NOT NULL;

-- Step 2: Change default value to uppercase
ALTER TABLE orders 
ALTER COLUMN parcel_status SET DEFAULT 'PENDING';

-- Step 3: Add comment for documentation
COMMENT ON COLUMN orders.parcel_status IS 'Parcel delivery status (PENDING, IN TRANSIT, ON DELIVERY, PICKUP, DELIVERED, CANCELLED, DETAINED, PROBLEMATIC, RETURNED) - Always uppercase';

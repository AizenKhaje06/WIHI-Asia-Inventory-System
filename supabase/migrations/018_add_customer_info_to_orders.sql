-- Migration: Add Customer Information to Orders Table
-- Date: 2026-03-04
-- Description: Add customer name, address, and contact number fields to orders table

-- Step 1: Add customer information columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_address TEXT,
ADD COLUMN IF NOT EXISTS customer_contact TEXT;

-- Step 2: Add indexes for customer search
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_customer_contact ON orders(customer_contact);

-- Step 3: Add comments for documentation
COMMENT ON COLUMN orders.customer_name IS 'Full name of the customer receiving the order';
COMMENT ON COLUMN orders.customer_address IS 'Complete delivery address for the customer';
COMMENT ON COLUMN orders.customer_contact IS 'Customer contact number for delivery coordination';

-- Step 4: Update views to include customer information

-- Update Transaction History view
CREATE OR REPLACE VIEW transaction_history AS
SELECT 
  id,
  date,
  sales_channel,
  store,
  courier,
  waybill,
  status,
  qty,
  cogs,
  total,
  parcel_status,
  product,
  customer_name,
  customer_address,
  customer_contact,
  dispatched_by,
  packed_by,
  packed_at,
  created_at
FROM orders
WHERE status = 'Pending' -- Only show unpacked orders
  AND deleted_at IS NULL
ORDER BY created_at DESC;

-- Update Track Orders view
CREATE OR REPLACE VIEW track_orders AS
SELECT 
  id,
  date,
  sales_channel,
  store,
  courier,
  waybill,
  status,
  qty,
  cogs,
  total,
  parcel_status,
  product,
  customer_name,
  customer_address,
  customer_contact,
  dispatched_by,
  packed_by,
  packed_at,
  created_at,
  updated_at
FROM orders
WHERE status IN ('Packed', 'Shipped', 'Delivered') -- Only show packed/shipped orders
  AND deleted_at IS NULL
ORDER BY created_at DESC;

-- Step 5: Backfill existing orders with placeholder data (optional)
-- UPDATE orders 
-- SET 
--   customer_name = 'N/A',
--   customer_address = 'N/A',
--   customer_contact = 'N/A'
-- WHERE customer_name IS NULL;


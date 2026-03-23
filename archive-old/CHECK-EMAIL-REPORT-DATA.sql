-- Run this in Supabase SQL Editor to check actual data
-- This will show you what fields have data

SELECT 
  id,
  product,
  sales_channel,
  parcel_status,
  status,
  waybill,
  courier
FROM orders
WHERE status = 'Packed'
LIMIT 5;

-- Check if product field has data:
SELECT 
  id,
  product,
  qty,
  total,
  parcel_status
FROM orders
WHERE status = 'Packed'
LIMIT 5;

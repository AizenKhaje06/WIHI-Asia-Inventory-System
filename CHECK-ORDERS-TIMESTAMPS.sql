-- Check Orders Table Timestamps
-- Run this in Supabase SQL Editor to verify timestamps

-- 1. Check recent orders with all timestamp fields
SELECT 
  id,
  date,
  created_at,
  updated_at,
  packed_at,
  status,
  parcel_status,
  product,
  store,
  sales_channel
FROM orders
WHERE date >= '2026-03-23'
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check if created_at has proper timestamps (not just dates)
SELECT 
  id,
  date,
  created_at,
  CASE 
    WHEN created_at::text LIKE '%00:00:00%' THEN 'NO TIME (midnight)'
    ELSE 'HAS TIME'
  END as has_time_component
FROM orders
WHERE date >= '2026-03-23'
ORDER BY created_at DESC;

-- 3. Compare date vs created_at
SELECT 
  id,
  date as dispatch_date,
  created_at as actual_timestamp,
  (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila') as manila_time
FROM orders
WHERE date >= '2026-03-23'
ORDER BY created_at DESC;

-- 4. Check for any NULL created_at values
SELECT COUNT(*) as null_created_at_count
FROM orders
WHERE created_at IS NULL;

-- Expected Results:
-- - created_at should have full timestamp (not 00:00:00)
-- - created_at should be in UTC format
-- - Manila time should match when you actually dispatched the order

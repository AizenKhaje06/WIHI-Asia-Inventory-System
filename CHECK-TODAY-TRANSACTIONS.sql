-- Check Today's Transaction Count
-- This should match the "11" shown in the dashboard

-- 1. Today's ALL orders (what dashboard counts as transactions)
SELECT 
  'Today Total Transactions' as metric,
  COUNT(*) as count,
  STRING_AGG(id, ', ') as order_ids
FROM orders
WHERE status = 'Packed'
  AND DATE(date) = CURRENT_DATE;

-- 2. Breakdown by parcel_status (today only)
SELECT 
  parcel_status,
  COUNT(*) as count
FROM orders
WHERE status = 'Packed'
  AND DATE(date) = CURRENT_DATE
GROUP BY parcel_status
ORDER BY count DESC;

-- 3. Today's active orders (for revenue calculation)
SELECT 
  'Today Active Orders (Revenue)' as metric,
  COUNT(*) as count,
  SUM(total) as revenue_today,
  SUM(qty) as items_sold_today
FROM orders
WHERE status = 'Packed'
  AND DATE(date) = CURRENT_DATE
  AND parcel_status NOT IN ('CANCELLED', 'RETURNED');

-- 4. Today's excluded orders
SELECT 
  'Today Excluded Orders' as metric,
  COUNT(*) as count,
  SUM(total) as excluded_revenue
FROM orders
WHERE status = 'Packed'
  AND DATE(date) = CURRENT_DATE
  AND parcel_status IN ('CANCELLED', 'RETURNED');

-- 5. Verify the exact count
SELECT 
  id,
  product,
  qty,
  total,
  parcel_status,
  date,
  CASE 
    WHEN parcel_status IN ('CANCELLED', 'RETURNED') THEN 'Excluded from Revenue'
    ELSE 'Included in Revenue'
  END as revenue_status
FROM orders
WHERE status = 'Packed'
  AND DATE(date) = CURRENT_DATE
ORDER BY date DESC;

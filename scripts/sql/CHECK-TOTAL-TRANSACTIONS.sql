-- Check Total Transactions Accuracy
-- Compares what the dashboard shows vs actual database count

-- 1. Total orders with status = 'Packed' (what dashboard counts)
SELECT 
  'Total Packed Orders' as metric,
  COUNT(*) as count,
  SUM(total) as total_revenue,
  SUM(cogs) as total_cost,
  SUM(total - cogs) as total_profit
FROM orders
WHERE status = 'Packed';

-- 2. Breakdown by parcel_status (to see active vs excluded)
SELECT 
  parcel_status,
  COUNT(*) as order_count,
  SUM(total) as revenue,
  SUM(cogs) as cost,
  SUM(total - cogs) as profit
FROM orders
WHERE status = 'Packed'
GROUP BY parcel_status
ORDER BY order_count DESC;

-- 3. Active orders only (excludes CANCELLED and RETURNED)
SELECT 
  'Active Orders (Revenue Recognition)' as metric,
  COUNT(*) as count,
  SUM(total) as total_revenue,
  SUM(cogs) as total_cost,
  SUM(total - cogs) as total_profit,
  ROUND(AVG(total), 2) as avg_order_value
FROM orders
WHERE status = 'Packed'
  AND parcel_status NOT IN ('CANCELLED', 'RETURNED');

-- 4. Excluded orders (CANCELLED + RETURNED)
SELECT 
  'Excluded Orders (Not in Revenue)' as metric,
  COUNT(*) as count,
  SUM(total) as excluded_revenue,
  SUM(cogs) as excluded_cost
FROM orders
WHERE status = 'Packed'
  AND parcel_status IN ('CANCELLED', 'RETURNED');

-- 5. Today's transactions
SELECT 
  'Today Active Orders' as metric,
  COUNT(*) as count,
  SUM(qty) as items_sold,
  SUM(total) as revenue_today
FROM orders
WHERE status = 'Packed'
  AND parcel_status NOT IN ('CANCELLED', 'RETURNED')
  AND DATE(date) = CURRENT_DATE;

-- 6. All parcel statuses with counts
SELECT 
  parcel_status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM orders
WHERE status = 'Packed'
GROUP BY parcel_status
ORDER BY count DESC;

-- 7. Verify the "11" total transactions shown in screenshot
-- This should match the active orders count
SELECT 
  'Dashboard Total Transactions' as metric,
  COUNT(*) as should_be_11,
  STRING_AGG(id, ', ') as order_ids
FROM orders
WHERE status = 'Packed'
  AND parcel_status NOT IN ('CANCELLED', 'RETURNED');

-- 8. Check if there are any orders with NULL parcel_status
SELECT 
  'Orders with NULL parcel_status' as metric,
  COUNT(*) as count
FROM orders
WHERE status = 'Packed'
  AND parcel_status IS NULL;

-- 9. Financial accuracy check
SELECT 
  'Financial Metrics Check' as metric,
  COUNT(*) as total_transactions,
  SUM(total) as total_revenue,
  SUM(cogs) as total_cost,
  SUM(total - cogs) as net_profit,
  ROUND((SUM(total - cogs) / NULLIF(SUM(total), 0)) * 100, 1) as profit_margin_percent
FROM orders
WHERE status = 'Packed'
  AND parcel_status NOT IN ('CANCELLED', 'RETURNED');


-- Check Sales Channels Data
-- Run this to verify orders exist in the database

-- 1. Check total orders
SELECT COUNT(*) as total_orders FROM orders;

-- 2. Check orders by sales channel
SELECT 
  sales_channel,
  COUNT(*) as order_count,
  SUM(total) as total_revenue,
  SUM(qty) as total_quantity
FROM orders
GROUP BY sales_channel
ORDER BY total_revenue DESC;

-- 3. Check recent orders (last 30 days)
SELECT 
  sales_channel,
  COUNT(*) as order_count,
  SUM(total) as total_revenue,
  MIN(date) as earliest_date,
  MAX(date) as latest_date
FROM orders
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY sales_channel
ORDER BY total_revenue DESC;

-- 4. Check orders with date range (last 30 days)
SELECT 
  id,
  sales_channel,
  total,
  qty,
  date,
  parcel_status,
  payment_status
FROM orders
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC
LIMIT 10;

-- 5. Check if there are any orders at all
SELECT 
  COUNT(*) as total_orders,
  MIN(date) as earliest_order,
  MAX(date) as latest_order
FROM orders;

-- 6. Check orders by status
SELECT 
  parcel_status,
  COUNT(*) as count,
  SUM(total) as revenue
FROM orders
GROUP BY parcel_status
ORDER BY count DESC;

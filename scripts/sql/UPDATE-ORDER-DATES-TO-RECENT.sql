-- Update Order Dates to Recent Dates
-- This will update all orders to have dates within the last 30 days
-- Run this in Supabase SQL Editor

-- Option 1: Update all orders to today's date
UPDATE orders
SET date = CURRENT_DATE
WHERE date < CURRENT_DATE - INTERVAL '30 days';

-- Option 2: Spread orders across last 30 days (more realistic)
-- This updates orders to random dates in the last 30 days
UPDATE orders
SET date = CURRENT_DATE - (random() * 30)::int
WHERE date < CURRENT_DATE - INTERVAL '30 days';

-- Option 3: Update specific date range (March 1-23) to recent dates
-- This keeps the relative spacing between orders
UPDATE orders
SET date = date + (CURRENT_DATE - '2026-03-23'::date)
WHERE date BETWEEN '2026-03-01' AND '2026-03-23';

-- Check updated dates
SELECT 
  MIN(date) as earliest_date,
  MAX(date) as latest_date,
  COUNT(*) as total_orders
FROM orders;

-- Verify orders by sales channel
SELECT 
  sales_channel,
  COUNT(*) as order_count,
  MIN(date) as earliest,
  MAX(date) as latest,
  SUM(total) as total_revenue
FROM orders
GROUP BY sales_channel
ORDER BY total_revenue DESC;

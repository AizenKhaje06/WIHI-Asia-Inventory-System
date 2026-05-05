-- Check orders without COGS
SELECT 
  COUNT(*) as orders_without_cogs,
  SUM(total) as total_revenue_affected
FROM orders
WHERE cogs IS NULL OR cogs = 0;

-- Show sample orders without COGS
SELECT 
  id,
  product,
  qty,
  total,
  cogs,
  sales_channel,
  date
FROM orders
WHERE cogs IS NULL OR cogs = 0
LIMIT 10;

-- Update orders with missing COGS (assuming 60% COGS ratio)
-- UNCOMMENT THE LINES BELOW TO RUN THE UPDATE:

-- UPDATE orders
-- SET cogs = total * 0.6
-- WHERE cogs IS NULL OR cogs = 0;

-- Verify the update
-- SELECT 
--   COUNT(*) as total_orders,
--   COUNT(CASE WHEN cogs IS NOT NULL AND cogs > 0 THEN 1 END) as orders_with_cogs,
--   SUM(total) as total_revenue,
--   SUM(cogs) as total_cogs,
--   SUM(total - cogs) as total_profit
-- FROM orders;

-- Check what sales channels exist in the orders table
SELECT 
  sales_channel,
  COUNT(*) as order_count,
  SUM(total) as total_revenue,
  SUM(qty) as total_quantity
FROM orders
GROUP BY sales_channel
ORDER BY order_count DESC;

-- Check if there are any NULL or empty sales channels
SELECT 
  COUNT(*) as orders_without_channel
FROM orders
WHERE sales_channel IS NULL OR sales_channel = '';

-- Show sample orders with their sales channels
SELECT 
  id,
  sales_channel,
  product,
  qty,
  total,
  date
FROM orders
ORDER BY created_at DESC
LIMIT 20;

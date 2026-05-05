-- Check if there are orders in the orders table
SELECT 
  COUNT(*) as total_orders,
  COUNT(CASE WHEN parcel_status = 'DELIVERED' THEN 1 END) as delivered,
  COUNT(CASE WHEN parcel_status = 'PENDING' THEN 1 END) as pending,
  COUNT(CASE WHEN parcel_status = 'CANCELLED' THEN 1 END) as cancelled,
  SUM(total) as total_revenue,
  SUM(qty) as total_quantity
FROM orders;

-- Show sample orders
SELECT 
  id,
  product,
  qty,
  total,
  cogs,
  sales_channel,
  parcel_status,
  date,
  created_at
FROM orders
LIMIT 10;

-- Check column names in orders table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

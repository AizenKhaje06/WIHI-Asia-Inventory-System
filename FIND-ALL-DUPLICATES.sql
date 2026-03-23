-- Find ALL duplicate products in inventory
-- Groups by name, store, and sales_channel to find duplicates

SELECT 
  name,
  store,
  sales_channel,
  COUNT(*) as duplicate_count,
  STRING_AGG(id, ', ' ORDER BY quantity DESC) as product_ids,
  STRING_AGG(quantity::text, ', ' ORDER BY quantity DESC) as quantities,
  STRING_AGG(last_updated::text, ', ' ORDER BY quantity DESC) as last_updated_dates
FROM inventory
GROUP BY name, store, sales_channel
HAVING COUNT(*) > 1
ORDER BY name, store, sales_channel;

-- This will show you:
-- - Which products are duplicated
-- - How many duplicates exist
-- - The IDs of all duplicates (ordered by quantity, highest first)
-- - The quantities (so you can decide which to keep)
-- - Last updated dates

-- Example output:
-- name: BERRY SOAP
-- store: GLOWMANCE
-- sales_channel: Lazada
-- duplicate_count: 2
-- product_ids: ITEM-123, ITEM-456
-- quantities: 985, 0
-- 
-- Action: Keep ITEM-123 (985 units), delete ITEM-456 (0 units)

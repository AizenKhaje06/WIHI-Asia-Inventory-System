-- Step 1: Find the duplicate BERRY SOAP products
SELECT 
  id,
  name,
  store,
  sales_channel,
  quantity,
  cost_price,
  selling_price,
  last_updated
FROM inventory
WHERE name = 'BERRY SOAP'
  AND store = 'GLOWMANCE'
  AND sales_channel = 'Lazada'
ORDER BY quantity DESC, last_updated DESC;

-- Step 2: Delete the one with 0 stock (keep the one with 985 units)
-- IMPORTANT: Check the results from Step 1 first!
-- Replace 'ITEM-xxx' with the actual ID of the 0-stock product

-- DELETE FROM inventory
-- WHERE name = 'BERRY SOAP'
--   AND store = 'GLOWMANCE'
--   AND sales_channel = 'Lazada'
--   AND quantity = 0;

-- Step 3: Verify only one remains
-- SELECT * FROM inventory
-- WHERE name = 'BERRY SOAP'
--   AND store = 'GLOWMANCE'
--   AND sales_channel = 'Lazada';

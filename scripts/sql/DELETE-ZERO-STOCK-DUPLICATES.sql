-- SAFE: Delete duplicate products that have 0 stock
-- This keeps the products with actual inventory

-- Step 1: Preview what will be deleted
SELECT 
  d.id,
  d.name,
  d.store,
  d.sales_channel,
  d.quantity,
  'WILL BE DELETED' as action
FROM inventory d
WHERE d.quantity = 0
  AND EXISTS (
    SELECT 1 
    FROM inventory k
    WHERE k.name = d.name
      AND k.store = d.store
      AND k.sales_channel = d.sales_channel
      AND k.quantity > 0
      AND k.id != d.id
  );

-- Step 2: If preview looks good, uncomment and run this:
/*
DELETE FROM inventory
WHERE quantity = 0
  AND EXISTS (
    SELECT 1 
    FROM inventory k
    WHERE k.name = inventory.name
      AND k.store = inventory.store
      AND k.sales_channel = inventory.sales_channel
      AND k.quantity > 0
      AND k.id != inventory.id
  );
*/

-- Step 3: Verify duplicates are gone
-- Run FIND-ALL-DUPLICATES.sql again to confirm

-- Fix existing bundles with 0 quantity
-- Run this in Supabase SQL Editor

-- 1. Update virtual stock for all bundles
UPDATE bundles b
SET quantity = (
    SELECT MIN(FLOOR(i.quantity::numeric / bi.quantity::numeric))
    FROM bundle_items bi
    JOIN inventory i ON i.id = bi.item_id
    WHERE bi.bundle_id = b.id
)
WHERE b.quantity = 0 OR b.quantity IS NULL;

-- 2. Check results
SELECT 
    id,
    name,
    quantity as virtual_stock,
    bundle_price,
    sales_channel,
    store
FROM bundles
ORDER BY created_at DESC
LIMIT 10;

-- 3. If you want to see the calculation breakdown for a specific bundle:
-- Replace 'BUNDLE-ID-HERE' with actual bundle ID
/*
SELECT 
    b.id as bundle_id,
    b.name as bundle_name,
    bi.item_id,
    i.name as item_name,
    i.quantity as available_stock,
    bi.quantity as needed_per_bundle,
    FLOOR(i.quantity::numeric / bi.quantity::numeric) as can_make
FROM bundles b
JOIN bundle_items bi ON bi.bundle_id = b.id
JOIN inventory i ON i.id = bi.item_id
WHERE b.id = 'BUNDLE-ID-HERE';
*/

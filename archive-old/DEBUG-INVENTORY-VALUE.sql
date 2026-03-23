-- Debug: Check Inventory Value Calculation
-- Run this in Supabase SQL Editor to see the actual values

-- 1. Check total from inventory table (what Dashboard should show)
SELECT 
    COUNT(*) as total_items,
    SUM(quantity) as total_quantity,
    SUM(quantity * selling_price) as total_value_selling_price,
    SUM(quantity * cost_price) as total_value_cost_price,
    SUM(total_cogs) as total_cogs
FROM inventory;

-- 2. Check by sales channel
SELECT 
    sales_channel,
    COUNT(*) as items,
    SUM(quantity) as qty,
    SUM(quantity * selling_price) as value
FROM inventory
GROUP BY sales_channel
ORDER BY value DESC;

-- 3. Check by store
SELECT 
    store,
    COUNT(*) as items,
    SUM(quantity) as qty,
    SUM(quantity * selling_price) as value
FROM inventory
GROUP BY store
ORDER BY value DESC;

-- 4. Check for any NULL values that might affect calculation
SELECT 
    COUNT(*) as items_with_null_price
FROM inventory
WHERE selling_price IS NULL OR quantity IS NULL;

-- 5. Top 10 most valuable items
SELECT 
    name,
    category,
    quantity,
    selling_price,
    (quantity * selling_price) as total_value
FROM inventory
ORDER BY total_value DESC
LIMIT 10;

-- 6. Check bundles (should NOT be included in inventory value)
SELECT 
    COUNT(*) as bundle_count,
    SUM(quantity) as bundle_qty,
    SUM(quantity * bundle_price) as bundle_value
FROM bundles
WHERE is_active = true;

-- EXPECTED RESULT:
-- Dashboard "Inventory Value" should equal query #1 total_value_selling_price
-- Inventory page "Total Value" should also equal query #1 total_value_selling_price
-- Bundles (query #6) should NOT be added to this value

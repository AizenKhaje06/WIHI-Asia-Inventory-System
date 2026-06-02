-- IMMEDIATE FIX: Update products_unified view to use camelCase imageUrl
-- Run this in Supabase SQL Editor NOW

-- Drop existing view
DROP VIEW IF EXISTS products_unified;

-- Recreate view with proper imageUrl alias
CREATE VIEW products_unified AS
-- Regular products from inventory
SELECT 
    id,
    name,
    'regular' as "productType",
    category,
    store,
    sales_channel as "salesChannel",
    quantity,
    cost_price as "costPrice",
    selling_price as "sellingPrice",
    reorder_level as "reorderLevel",
    last_updated as "lastUpdated",
    sku,
    image_url as "imageUrl",  -- FIXED: Now uses camelCase alias
    NULL::decimal as "bundleCost",
    NULL::decimal as "regularPrice",
    NULL::decimal as savings,
    NULL::text as badge
FROM inventory

UNION ALL

-- Bundles with image support
SELECT 
    id,
    name,
    'bundle' as "productType",
    'Bundles' as category,
    store,
    sales_channel as "salesChannel",
    quantity,
    bundle_cost as "costPrice",
    bundle_price as "sellingPrice",
    reorder_level as "reorderLevel",
    updated_at as "lastUpdated",
    NULL::text as sku,
    image_url as "imageUrl",  -- FIXED: Bundles now support images with camelCase
    bundle_cost as "bundleCost",
    regular_price as "regularPrice",
    savings,
    badge
FROM bundles
WHERE is_active = true;

-- Grant permissions
GRANT SELECT ON products_unified TO authenticated, anon;

-- Verify the fix
SELECT 
    id,
    name,
    "imageUrl",  -- Should now work with camelCase
    "salesChannel"
FROM products_unified
WHERE "imageUrl" IS NOT NULL
LIMIT 5;

-- Check column names
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'products_unified'
ORDER BY ordinal_position;

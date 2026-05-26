-- ============================================================
-- FIX: Add image_url to products_unified view
-- Run this in Supabase SQL Editor
-- ============================================================

-- Drop the old view
DROP VIEW IF EXISTS products_unified;

-- Recreate view WITH image_url column
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
    image_url,  -- ✅ ADDED: Image URL support
    NULL::decimal as "bundleCost",
    NULL::decimal as "regularPrice",
    NULL::decimal as savings,
    NULL::text as badge
FROM inventory

UNION ALL

-- Bundles (no category, sku, or image)
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
    NULL::text as image_url,  -- ✅ ADDED: Bundles don't have images
    bundle_cost as "bundleCost",
    regular_price as "regularPrice",
    savings,
    badge
FROM bundles
WHERE is_active = true;

-- Grant permissions
GRANT SELECT ON products_unified TO authenticated, anon;

-- Add comment
COMMENT ON VIEW products_unified IS 'Unified view of regular products and bundles (with image support)';

-- ============================================================
-- VERIFY: Check if image_url is now included
-- ============================================================
SELECT id, name, image_url 
FROM products_unified 
WHERE image_url IS NOT NULL 
LIMIT 5;

-- Expected: Should show LIPOCOLLA with image URL

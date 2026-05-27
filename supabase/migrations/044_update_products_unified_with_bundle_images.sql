-- Migration: Update products_unified view to include bundle images
-- Date: 2026-05-28
-- Description: Update products_unified view to show image_url from bundles table

-- Drop existing view
DROP VIEW IF EXISTS products_unified;

-- Recreate view with bundle image_url support
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
    image_url,  -- Include image URL from inventory
    NULL::decimal as "bundleCost",
    NULL::decimal as "regularPrice",
    NULL::decimal as savings,
    NULL::text as badge
FROM inventory

UNION ALL

-- Bundles (now with image_url support)
SELECT 
    id,
    name,
    'bundle' as "productType",
    'Bundles' as category,  -- Default category for all bundles
    store,
    sales_channel as "salesChannel",
    quantity,
    bundle_cost as "costPrice",
    bundle_price as "sellingPrice",
    reorder_level as "reorderLevel",
    updated_at as "lastUpdated",
    NULL::text as sku,  -- Bundles don't have SKU
    image_url,  -- NOW INCLUDES: Bundle images from bundles.image_url
    bundle_cost as "bundleCost",
    regular_price as "regularPrice",
    savings,
    badge
FROM bundles
WHERE is_active = true;

-- Grant permissions
GRANT SELECT ON products_unified TO authenticated, anon;

-- Add comment
COMMENT ON VIEW products_unified IS 'Unified view of regular products and bundles for inventory display (with full image support for both)';

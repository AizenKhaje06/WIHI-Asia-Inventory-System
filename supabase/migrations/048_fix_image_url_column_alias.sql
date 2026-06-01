-- Migration: Fix image_url column alias in products_unified view
-- Date: 2026-06-02
-- Description: Add camelCase alias to image_url column for consistency with other columns

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
    image_url as "imageUrl",  -- FIXED: Add camelCase alias for consistency
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
    image_url as "imageUrl",  -- FIXED: Add camelCase alias (bundles now support images)
    bundle_cost as "bundleCost",
    regular_price as "regularPrice",
    savings,
    badge
FROM bundles
WHERE is_active = true;

-- Grant permissions
GRANT SELECT ON products_unified TO authenticated, anon;

-- Add comment
COMMENT ON VIEW products_unified IS 'Unified view of regular products and bundles with consistent camelCase column naming';

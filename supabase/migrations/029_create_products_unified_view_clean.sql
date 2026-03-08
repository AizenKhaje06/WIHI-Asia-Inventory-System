-- Migration: Create Unified Products View (Clean Version)
-- Date: 2026-03-08
-- Description: Combine inventory and bundles into one view for display

-- Drop existing view if any
DROP VIEW IF EXISTS products_unified;

-- Create unified view that shows both regular products and bundles
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
    NULL::decimal as "bundleCost",
    NULL::decimal as "regularPrice",
    NULL::decimal as savings,
    NULL::text as badge
FROM inventory

UNION ALL

-- Bundles (no category or sku columns)
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
    bundle_cost as "bundleCost",
    regular_price as "regularPrice",
    savings,
    badge
FROM bundles
WHERE is_active = true;

-- Grant permissions
GRANT SELECT ON products_unified TO authenticated, anon;

-- Add comment
COMMENT ON VIEW products_unified IS 'Unified view of regular products and bundles for inventory display';




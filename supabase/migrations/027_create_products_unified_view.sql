-- Migration: Create Unified Products View
-- Date: 2026-03-08
-- Description: Combine inventory and bundles into single view for product lists

-- Drop view if exists
DROP VIEW IF EXISTS products_unified CASCADE;

-- Create unified view that combines inventory and bundles
CREATE OR REPLACE VIEW products_unified AS

-- Regular products from inventory table
SELECT 
  id,
  name,
  sku,
  category,
  store,
  sales_channel,
  cost_price,
  selling_price,
  quantity,
  reorder_level,
  total_cogs,
  last_updated as created_at,
  'regular' as product_type,
  NULL::numeric as bundle_cost,
  NULL::numeric as regular_price,
  NULL::numeric as savings,
  NULL::text as description,
  NULL::text as badge,
  NULL::boolean as is_active
FROM inventory

UNION ALL

-- Bundle products from bundles table
SELECT 
  id,
  name,
  sku,
  category,
  store,
  sales_channel,
  bundle_cost as cost_price,
  bundle_price as selling_price,
  quantity,
  reorder_level,
  bundle_cost * quantity as total_cogs,
  created_at,
  'bundle' as product_type,
  bundle_cost,
  regular_price,
  savings,
  description,
  badge,
  is_active
FROM bundles
WHERE is_active = true;

-- Add comments
COMMENT ON VIEW products_unified IS 'Unified view of all products (regular + bundles) for product lists';

-- Grant permissions
GRANT SELECT ON products_unified TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Products unified view created successfully!';
  RAISE NOTICE 'Use this view in product lists to show both regular products and bundles';
  RAISE NOTICE 'Example: SELECT * FROM products_unified WHERE store = ''SKINCARE''';
END $$;

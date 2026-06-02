# Fix Image Display Issue

## Problem
Image uploads successfully but doesn't display (broken image icon) because the `products_unified` view doesn't include the `image_url` column.

## Solution
Run this SQL in Supabase SQL Editor to update the view:

```sql
-- Update products_unified view to include image_url
DROP VIEW IF EXISTS products_unified;

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
    image_url,  -- NEW: Include image URL
    NULL::decimal as "bundleCost",
    NULL::decimal as "regularPrice",
    NULL::decimal as savings,
    NULL::text as badge
FROM inventory

UNION ALL

-- Bundles (no category, sku, or image_url)
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
    NULL::text as image_url,  -- Bundles don't have images
    bundle_cost as "bundleCost",
    regular_price as "regularPrice",
    savings,
    badge
FROM bundles
WHERE is_active = true;

GRANT SELECT ON products_unified TO authenticated, anon;
```

## After Running SQL

1. Refresh your app page
2. The uploaded image should now display correctly
3. Try uploading a new product with image to test

## Changes Made

1. ✅ Updated `products_unified` view to include `image_url` column
2. ✅ Fixed X button size (larger and more visible)
3. ✅ Updated `ADD_PRODUCT_IMAGE.sql` to include view update

## Expected Result

- ✅ Images display correctly in product cards
- ✅ X button is larger and easier to click
- ✅ Image preview shows immediately after upload
- ✅ Images persist after page refresh

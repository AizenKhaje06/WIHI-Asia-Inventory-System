-- ============================================================
-- ADD PRODUCT IMAGE SUPPORT
-- Run this in Supabase SQL Editor
-- ============================================================

-- Step 1: Add image_url column to inventory table
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL;

-- Step 1.5: Update products_unified view to include image_url
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

-- Step 2: Create Supabase Storage bucket (DO THIS IN SUPABASE DASHBOARD)
-- Go to: Storage → New Bucket
-- Bucket name: product-images
-- Public bucket: YES (IMPORTANT!)
-- File size limit: 2MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- Step 3: Set storage policies (run this AFTER creating bucket)
-- Note: Drop existing policies first to avoid conflicts

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

-- Allow public read access
CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- ============================================================
-- VERIFICATION
-- ============================================================
-- Check column was added:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'inventory' AND column_name = 'image_url';

-- Check bucket exists:
SELECT * FROM storage.buckets WHERE id = 'product-images';

-- Check policies exist:
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%product images%';

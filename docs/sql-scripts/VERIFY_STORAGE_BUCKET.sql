-- ============================================================
-- VERIFY STORAGE BUCKET CONFIGURATION
-- Run this in Supabase SQL Editor to check bucket setup
-- ============================================================

-- Step 1: Check if bucket exists
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE id = 'product-images';

-- Expected result:
-- id: product-images
-- public: true (MUST BE TRUE!)
-- file_size_limit: 2097152 (2MB) or NULL
-- allowed_mime_types: {image/jpeg,image/png,image/webp} or NULL

-- Step 2: Check storage policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%product%';

-- Expected result: 4 policies
-- 1. Public read product images (SELECT, public)
-- 2. Authenticated users can upload product images (INSERT, authenticated)
-- 3. Authenticated users can update product images (UPDATE, authenticated)
-- 4. Authenticated users can delete product images (DELETE, authenticated)

-- Step 3: List files in bucket (if any)
-- Note: This query only works if you have files uploaded
-- SELECT * FROM storage.objects WHERE bucket_id = 'product-images' LIMIT 10;

-- ============================================================
-- TROUBLESHOOTING
-- ============================================================

-- If bucket doesn't exist, you need to create it manually:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New Bucket"
-- 3. Name: product-images
-- 4. Public: YES (check the box)
-- 5. Click "Create"

-- If bucket exists but public = false, run this:
-- UPDATE storage.buckets SET public = true WHERE id = 'product-images';

-- If policies don't exist, run the policies from ADD_PRODUCT_IMAGE.sql

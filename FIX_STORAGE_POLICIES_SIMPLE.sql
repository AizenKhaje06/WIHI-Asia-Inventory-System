-- ============================================================
-- FIX: Simplify Storage Policies (Allow Public Access)
-- Run this in Supabase SQL Editor
-- ============================================================

-- Step 1: Drop ALL existing policies on storage.objects
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Access" ON storage.objects;

-- Step 2: Create SIMPLE public read policy
CREATE POLICY "Allow public read access to product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Step 3: Create SIMPLE authenticated write policy (INSERT, UPDATE, DELETE)
CREATE POLICY "Allow authenticated users to manage product images"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Step 4: Verify bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'product-images';

-- Step 5: Verify policies
SELECT 
    policyname,
    cmd,
    roles::text,
    qual::text,
    with_check::text
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%product%'
ORDER BY policyname;

-- Expected result: 2 policies
-- 1. Allow public read access to product images (SELECT, {public})
-- 2. Allow authenticated users to manage product images (ALL, {authenticated})

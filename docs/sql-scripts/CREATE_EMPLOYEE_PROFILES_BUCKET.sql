-- ============================================
-- Create Employee Profiles Storage Bucket
-- ============================================
-- Run this in Supabase SQL Editor

-- Step 1: Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'employee-profiles',
  'employee-profiles',
  true,  -- Public bucket
  1048576,  -- 1MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']  -- Allowed image types
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create policy for public read access (SELECT)
CREATE POLICY "Public read access for employee profiles"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'employee-profiles');

-- Step 3: Create policy for authenticated users to upload (INSERT)
CREATE POLICY "Authenticated users can upload employee profiles"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'employee-profiles');

-- Step 4: Create policy for authenticated users to update (UPDATE)
CREATE POLICY "Authenticated users can update employee profiles"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'employee-profiles')
WITH CHECK (bucket_id = 'employee-profiles');

-- Step 5: Create policy for authenticated users to delete (DELETE)
CREATE POLICY "Authenticated users can delete employee profiles"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'employee-profiles');

-- Verify the bucket was created
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'employee-profiles';

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects' 
AND policyname LIKE '%employee profiles%';

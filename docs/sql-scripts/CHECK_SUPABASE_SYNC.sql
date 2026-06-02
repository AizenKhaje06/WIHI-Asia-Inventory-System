-- ============================================
-- Check Supabase Sync - Profile Image Feature
-- ============================================
-- Run this in Supabase SQL Editor to verify everything is set up

-- 1. Check if profile_image column exists in users table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users' 
AND column_name = 'profile_image';

-- 2. Check if any users have profile images
SELECT 
    username,
    display_name,
    role,
    assigned_channel,
    CASE 
        WHEN profile_image IS NOT NULL THEN 'HAS IMAGE ✓'
        ELSE 'NO IMAGE'
    END as image_status,
    LEFT(profile_image, 50) as image_url_preview
FROM users
ORDER BY 
    CASE WHEN profile_image IS NOT NULL THEN 0 ELSE 1 END,
    username;

-- 3. Check employee-profiles bucket exists
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets
WHERE id = 'employee-profiles';

-- 4. Check storage policies for employee-profiles
SELECT 
    policyname,
    cmd as operation,
    roles,
    CASE 
        WHEN cmd = 'SELECT' THEN 'Read/View'
        WHEN cmd = 'INSERT' THEN 'Upload'
        WHEN cmd = 'UPDATE' THEN 'Update'
        WHEN cmd = 'DELETE' THEN 'Delete'
    END as action
FROM pg_policies
WHERE tablename = 'objects' 
AND policyname LIKE '%employee profile%'
ORDER BY cmd;

-- 5. Count files in employee-profiles bucket
SELECT 
    COUNT(*) as total_files,
    bucket_id
FROM storage.objects
WHERE bucket_id = 'employee-profiles'
GROUP BY bucket_id;

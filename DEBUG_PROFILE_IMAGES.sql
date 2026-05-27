-- Debug Profile Images
-- Run this in Supabase SQL Editor to check profile image data

-- 1. Check if profile_image column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'profile_image';

-- 2. Check all users and their profile images
SELECT 
  id,
  username,
  display_name,
  role,
  assigned_channel,
  profile_image,
  CASE 
    WHEN profile_image IS NULL THEN '❌ No image'
    WHEN profile_image = '' THEN '❌ Empty string'
    ELSE '✅ Has image'
  END as image_status,
  LENGTH(profile_image) as url_length
FROM users
ORDER BY role, username;

-- 3. Check specific accounts
SELECT 
  username,
  display_name,
  profile_image
FROM users
WHERE username IN ('Aizen06', 'Facebook-Juan', 'Shopee-Nina', 'logistics-admin');

-- 4. Check employee-profiles bucket in storage
SELECT 
  name,
  bucket_id,
  created_at,
  updated_at,
  last_accessed_at,
  metadata
FROM storage.objects
WHERE bucket_id = 'employee-profiles'
ORDER BY created_at DESC
LIMIT 20;

-- 5. Count users with and without profile images
SELECT 
  role,
  COUNT(*) as total_users,
  COUNT(profile_image) as users_with_image,
  COUNT(*) - COUNT(profile_image) as users_without_image
FROM users
GROUP BY role
ORDER BY role;

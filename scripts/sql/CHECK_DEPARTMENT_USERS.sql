-- Check if department users exist in the database
-- Run this in Supabase SQL Editor

-- 1. Check all operations users
SELECT 
  id,
  username,
  password,
  role,
  display_name,
  assigned_channel,
  created_at
FROM users 
WHERE role = 'operations'
ORDER BY username;

-- 2. Check specific Facebook user
SELECT * FROM users WHERE username = 'Facebook';

-- 3. Count operations users
SELECT COUNT(*) as operations_user_count FROM users WHERE role = 'operations';

-- 4. Check all users (to see what's in the table)
SELECT 
  id,
  username,
  role,
  display_name
FROM users
ORDER BY role, username;

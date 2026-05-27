-- Migration: Add profile_image column to users table
-- Description: Allows users to have profile pictures
-- Date: 2026-05-27

-- Add profile_image column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Add comment
COMMENT ON COLUMN users.profile_image IS 'URL to user profile image stored in Supabase Storage';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'profile_image';

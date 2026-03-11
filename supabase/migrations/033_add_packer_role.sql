-- Migration: Add Packer Role to Users Table
-- Date: 2026-03-12
-- Description: Add 'packer' as a valid role in the users table

-- Drop the existing check constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new check constraint with packer role included
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'team_leader', 'operations', 'packer'));

-- Verify the constraint was updated
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'users'::regclass 
AND conname = 'users_role_check';

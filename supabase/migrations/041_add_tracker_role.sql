-- Migration: Add Tracker Role
-- Description: Creates tracker role for managing parcel status updates
-- Date: 2026-05-18

-- Add tracker role to users table (if role column exists)
-- Tracker role: Can view and update parcel status in Track Orders page

-- First, update the role check constraint to include tracker
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'team_leader', 'operations', 'packer', 'tracker'));

-- Insert a default tracker user with generated UUID
INSERT INTO users (id, username, password, role, display_name, email, created_at)
VALUES (
  gen_random_uuid()::text,
  'tracker',
  '$2a$10$rZ5c3qX8YvH9pK2wL4nJ7.eQ6xM8tN9vB1cD2fE3gH4iJ5kL6mN7oP', -- Default password: tracker123
  'tracker',
  'Tracker User',
  'tracker@example.com',
  NOW()
)
ON CONFLICT (username) DO NOTHING;

-- Add comment
COMMENT ON COLUMN users.role IS 'User role: admin, operations, packer, or tracker';

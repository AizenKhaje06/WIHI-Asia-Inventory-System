-- Add Logistics Admin Account
-- This account will have access to the Logistics Admin Dashboard
-- Run this in your Supabase SQL Editor

-- STEP 1: Drop the old role constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- STEP 2: Add new constraint that includes 'logistics-admin'
-- Update this list based on your existing roles
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'packer', 'tracker', 'operations', 'logistics-admin'));

-- STEP 3: Insert the logistics-admin account
INSERT INTO users (id, username, password, role, display_name, email, created_at)
VALUES (
  gen_random_uuid(),
  'logistics-admin',
  '$2b$10$rQZ5vJ5qX.xN5pYqK5Zv3.uJ5YqK5Zv3uJ5YqK5Zv3uJ5YqK5Zv3u',
  'logistics-admin',
  'Logistics Admin',
  'logistics@example.com',
  NOW()
);

-- Default credentials:
-- Username: logistics-admin
-- Password: LogisticsAdmin123

-- STEP 4: Verify the account was created:
SELECT username, role, display_name, created_at FROM users WHERE role = 'logistics-admin';

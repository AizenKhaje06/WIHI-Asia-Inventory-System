-- Migration: Fix users role constraint to support team_leader and operations roles
-- Purpose: Update the role check constraint to allow new role types

-- Drop the existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new constraint with all supported roles
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'staff', 'operations', 'team_leader'));

-- Add comment for documentation
COMMENT ON CONSTRAINT users_role_check ON users IS 'Allowed roles: admin, staff, operations, team_leader';

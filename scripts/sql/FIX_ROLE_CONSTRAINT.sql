-- ============================================
-- FIX: Check existing roles and update constraint
-- ============================================

-- Step 1: Check what roles currently exist in your database
SELECT DISTINCT role, COUNT(*) as count
FROM users
GROUP BY role
ORDER BY role;

-- Step 2: Check current constraint
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'users_role_check';

-- Step 3: Drop the old constraint (if exists)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 4: Add new constraint that includes ALL existing roles + team_leader
-- Adjust this based on what you see in Step 1
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'operations', 'team_leader', 'staff', 'viewer'));

-- Step 5: Verify constraint is updated
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'users_role_check';

-- Step 6: Verify all users pass the constraint
SELECT role, COUNT(*) as count
FROM users
GROUP BY role
ORDER BY role;

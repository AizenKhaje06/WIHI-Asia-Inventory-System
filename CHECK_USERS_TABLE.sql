-- ============================================
-- CHECK USERS TABLE FOR TEAM LEADER COLUMNS
-- ============================================

-- 1. Check all columns in users table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 2. Check if assigned_channel column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users' 
AND column_name = 'assigned_channel';

-- 3. Check if role column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users' 
AND column_name = 'role';

-- 4. Check role constraint
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'users_role_check';

-- 5. Check sample data
SELECT id, username, display_name, role, assigned_channel
FROM users
LIMIT 5;

-- ============================================
-- EXPECTED RESULTS
-- ============================================
-- assigned_channel: VARCHAR(50) - Should exist
-- role: VARCHAR(50) - Should exist
-- Constraint should include: 'admin', 'staff', 'operations', 'team_leader'

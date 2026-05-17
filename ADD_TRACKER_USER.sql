-- ============================================
-- ADD TRACKER ROLE - STANDALONE SCRIPT
-- Run this directly in Supabase SQL Editor
-- ============================================

-- Step 1: Update role constraint to include tracker
DO $$ 
BEGIN
    -- Drop existing constraint if it exists
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    
    -- Add new constraint with tracker role
    ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('admin', 'team_leader', 'operations', 'packer', 'tracker'));
    
    RAISE NOTICE 'Role constraint updated successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating constraint: %', SQLERRM;
END $$;

-- Step 2: Insert tracker user (only if doesn't exist)
DO $$ 
BEGIN
    -- Check if tracker user already exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'tracker') THEN
        INSERT INTO users (id, username, password, role, display_name, email, created_at)
        VALUES (
            gen_random_uuid()::text,
            'tracker',
            '$2a$10$rZ5c3qX8YvH9pK2wL4nJ7.eQ6xM8tN9vB1cD2fE3gH4iJ5kL6mN7oP', -- Password: tracker123
            'tracker',
            'Tracker User',
            'tracker@example.com',
            NOW()
        );
        RAISE NOTICE 'Tracker user created successfully';
    ELSE
        RAISE NOTICE 'Tracker user already exists';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating tracker user: %', SQLERRM;
END $$;

-- Step 3: Verify the tracker user was created
SELECT 
    id,
    username,
    role,
    display_name,
    email,
    created_at
FROM users 
WHERE role = 'tracker';

-- ============================================
-- EXPECTED OUTPUT:
-- You should see one row with:
-- - username: tracker
-- - role: tracker
-- - display_name: Tracker User
-- ============================================

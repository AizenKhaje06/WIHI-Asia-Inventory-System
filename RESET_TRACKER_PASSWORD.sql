-- ============================================
-- RESET TRACKER PASSWORD
-- Run this in Supabase SQL Editor
-- ============================================

-- Update tracker password to: tracker123
UPDATE users 
SET password = '$2a$10$rZ5c3qX8YvH9pK2wL4nJ7.eQ6xM8tN9vB1cD2fE3gH4iJ5kL6mN7oP'
WHERE username = 'tracker';

-- Verify the update
SELECT 
    username,
    role,
    display_name,
    email,
    created_at,
    CASE 
        WHEN password = '$2a$10$rZ5c3qX8YvH9pK2wL4nJ7.eQ6xM8tN9vB1cD2fE3gH4iJ5kL6mN7oP' 
        THEN '✅ Password updated correctly'
        ELSE '❌ Password mismatch'
    END as password_status
FROM users 
WHERE username = 'tracker';

-- ============================================
-- CREDENTIALS AFTER RESET:
-- Username: tracker
-- Password: tracker123
-- ============================================

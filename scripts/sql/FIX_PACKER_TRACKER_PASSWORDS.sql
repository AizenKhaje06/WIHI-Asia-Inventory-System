-- ============================================
-- FIX PACKER AND TRACKER PASSWORDS
-- Run this in Supabase SQL Editor
-- ============================================

-- Install pgcrypto extension if not already installed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update packer1 password to 'pack789' (bcrypt hashed)
UPDATE users 
SET password = crypt('pack789', gen_salt('bf'))
WHERE username = 'packer1';

-- Update tracker password to 'tracker123' (bcrypt hashed)
UPDATE users 
SET password = crypt('tracker123', gen_salt('bf'))
WHERE username = 'tracker';

-- Verify the updates
SELECT 
    username, 
    role, 
    display_name,
    CASE 
        WHEN password LIKE '$2%' THEN 'Bcrypt hashed ✓'
        ELSE 'Plain text ✗'
    END as password_status,
    created_at
FROM users 
WHERE username IN ('packer1', 'tracker')
ORDER BY username;

-- ============================================
-- EXPECTED OUTPUT:
-- Both accounts should show "Bcrypt hashed ✓"
-- ============================================

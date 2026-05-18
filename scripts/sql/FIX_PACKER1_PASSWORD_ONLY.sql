-- ============================================
-- FIX PACKER1 PASSWORD ONLY
-- Run this in Supabase SQL Editor
-- ============================================

-- Install pgcrypto extension if not already installed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update packer1 password to 'pack789' (bcrypt hashed)
UPDATE users 
SET password = crypt('pack789', gen_salt('bf'))
WHERE username = 'packer1';

-- Verify the update
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
WHERE username = 'packer1';

-- ============================================
-- EXPECTED OUTPUT:
-- packer1 should show "Bcrypt hashed ✓"
-- ============================================

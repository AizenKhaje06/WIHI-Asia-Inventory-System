-- ============================================
-- CHECK AND FIX STAFF PASSWORDS
-- Run this in Supabase SQL Editor
-- ============================================

-- First, let's see what usernames exist
SELECT username, role, display_name 
FROM users 
WHERE role IN ('packer', 'tracker', 'logistics-admin')
ORDER BY role, username;

-- Enable pgcrypto extension for bcrypt hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Fix logistics-admin password
UPDATE users 
SET password = crypt('LogisticsAdmin123', gen_salt('bf'))
WHERE username = 'logistics-admin';

-- Fix tracker password
UPDATE users 
SET password = crypt('tracker123', gen_salt('bf'))
WHERE username = 'tracker';

-- Fix Packer password (note: username is 'Packer' with capital P)
UPDATE users 
SET password = crypt('pack789', gen_salt('bf'))
WHERE username = 'Packer';

-- Also try lowercase packer if it exists
UPDATE users 
SET password = crypt('pack789', gen_salt('bf'))
WHERE username = 'packer';

-- Also try packer1 if it exists
UPDATE users 
SET password = crypt('pack789', gen_salt('bf'))
WHERE username = 'packer1';

-- Verify all updates
SELECT 
    username,
    role,
    display_name,
    CASE 
        WHEN password LIKE '$2a$%' OR password LIKE '$2b$%' THEN 'Bcrypt hashed ✓'
        ELSE 'Plain text ✗'
    END as password_status,
    created_at
FROM users 
WHERE role IN ('packer', 'tracker', 'logistics-admin')
ORDER BY role, username;

-- ============================================
-- AFTER RUNNING THIS, TRY THESE CREDENTIALS:
-- 
-- Logistics Admin:
--   Username: logistics-admin
--   Password: LogisticsAdmin123
--
-- Tracker:
--   Username: tracker
--   Password: tracker123
--
-- Packer:
--   Username: Packer (capital P)
--   Password: pack789
-- ============================================

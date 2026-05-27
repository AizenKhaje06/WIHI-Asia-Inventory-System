-- ============================================
-- FIX ALL STAFF PASSWORDS (Packer, Tracker, Logistics Admin)
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable pgcrypto extension for bcrypt hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update packer1 password to 'pack789' (bcrypt hashed)
UPDATE users 
SET password = crypt('pack789', gen_salt('bf'))
WHERE username = 'packer1';

-- Update tracker password to 'tracker123' (bcrypt hashed)
UPDATE users 
SET password = crypt('tracker123', gen_salt('bf'))
WHERE username = 'tracker';

-- Update logistics-admin password to 'LogisticsAdmin123' (bcrypt hashed)
UPDATE users 
SET password = crypt('LogisticsAdmin123', gen_salt('bf'))
WHERE username = 'logistics-admin';

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
WHERE username IN ('packer1', 'tracker', 'logistics-admin')
ORDER BY username;

-- ============================================
-- EXPECTED CREDENTIALS AFTER RUNNING THIS:
-- 
-- Username: packer1
-- Password: pack789
-- Role: packer
--
-- Username: tracker  
-- Password: tracker123
-- Role: tracker
--
-- Username: logistics-admin
-- Password: LogisticsAdmin123
-- Role: logistics-admin
-- ============================================

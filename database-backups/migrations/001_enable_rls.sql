-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
-- This migration enables RLS on all tables to prevent unauthorized access
-- Run this in your Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE restocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (for clean migration)
DROP POLICY IF EXISTS "inventory_select_policy" ON inventory;
DROP POLICY IF EXISTS "inventory_insert_policy" ON inventory;
DROP POLICY IF EXISTS "inventory_update_policy" ON inventory;
DROP POLICY IF EXISTS "inventory_delete_policy" ON inventory;

DROP POLICY IF EXISTS "transactions_select_policy" ON transactions;
DROP POLICY IF EXISTS "transactions_insert_policy" ON transactions;

DROP POLICY IF EXISTS "logs_select_policy" ON logs;
DROP POLICY IF EXISTS "logs_insert_policy" ON logs;

DROP POLICY IF EXISTS "restocks_select_policy" ON restocks;
DROP POLICY IF EXISTS "restocks_insert_policy" ON restocks;

DROP POLICY IF EXISTS "storage_rooms_select_policy" ON storage_rooms;
DROP POLICY IF EXISTS "storage_rooms_modify_policy" ON storage_rooms;

DROP POLICY IF EXISTS "categories_select_policy" ON categories;
DROP POLICY IF EXISTS "categories_modify_policy" ON categories;

DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_modify_policy" ON users;

-- Verification query (run after migration)
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

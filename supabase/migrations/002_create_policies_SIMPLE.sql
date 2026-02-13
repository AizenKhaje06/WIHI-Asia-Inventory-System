-- ============================================
-- SIMPLIFIED ROW LEVEL SECURITY POLICIES
-- ============================================
-- Use this if the main policies file gives errors
-- This creates basic but effective security policies

-- ============================================
-- INVENTORY POLICIES
-- ============================================

CREATE POLICY "inventory_read_all"
ON inventory
FOR SELECT
USING (true);

CREATE POLICY "inventory_write_service"
ON inventory
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- TRANSACTIONS POLICIES
-- ============================================

CREATE POLICY "transactions_read_all"
ON transactions
FOR SELECT
USING (true);

CREATE POLICY "transactions_write_service"
ON transactions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- LOGS POLICIES
-- ============================================

CREATE POLICY "logs_read_all"
ON logs
FOR SELECT
USING (true);

CREATE POLICY "logs_write_service"
ON logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- RESTOCKS POLICIES
-- ============================================

CREATE POLICY "restocks_read_all"
ON restocks
FOR SELECT
USING (true);

CREATE POLICY "restocks_write_service"
ON restocks
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- STORAGE ROOMS POLICIES
-- ============================================

CREATE POLICY "storage_rooms_read_all"
ON storage_rooms
FOR SELECT
USING (true);

CREATE POLICY "storage_rooms_write_service"
ON storage_rooms
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- CATEGORIES POLICIES
-- ============================================

CREATE POLICY "categories_read_all"
ON categories
FOR SELECT
USING (true);

CREATE POLICY "categories_write_service"
ON categories
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- USERS POLICIES (Most Restrictive)
-- ============================================

CREATE POLICY "users_service_only"
ON users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to verify:
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

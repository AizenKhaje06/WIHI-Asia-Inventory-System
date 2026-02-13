-- ============================================
-- CREATE ROW LEVEL SECURITY POLICIES
-- ============================================
-- This migration creates security policies for all tables
-- Policies enforce role-based access control at the database level

-- ============================================
-- INVENTORY POLICIES
-- ============================================

-- Allow service role (backend) to do everything
CREATE POLICY "inventory_service_role_all"
ON inventory
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Public read access (for authenticated frontend)
CREATE POLICY "inventory_select_policy"
ON inventory
FOR SELECT
TO anon, authenticated
USING (true);

-- Only allow inserts/updates/deletes through service role
-- This forces all modifications to go through your API routes
CREATE POLICY "inventory_insert_policy"
ON inventory
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "inventory_update_policy"
ON inventory
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "inventory_delete_policy"
ON inventory
FOR DELETE
TO service_role
USING (true);

-- ============================================
-- TRANSACTIONS POLICIES
-- ============================================

CREATE POLICY "transactions_service_role_all"
ON transactions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "transactions_select_policy"
ON transactions
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "transactions_insert_policy"
ON transactions
FOR INSERT
TO service_role
WITH CHECK (true);

-- ============================================
-- LOGS POLICIES
-- ============================================

CREATE POLICY "logs_service_role_all"
ON logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "logs_select_policy"
ON logs
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "logs_insert_policy"
ON logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- ============================================
-- RESTOCKS POLICIES
-- ============================================

CREATE POLICY "restocks_service_role_all"
ON restocks
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "restocks_select_policy"
ON restocks
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "restocks_insert_policy"
ON restocks
FOR INSERT
TO service_role
WITH CHECK (true);

-- ============================================
-- STORAGE ROOMS POLICIES
-- ============================================

CREATE POLICY "storage_rooms_service_role_all"
ON storage_rooms
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "storage_rooms_select_policy"
ON storage_rooms
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "storage_rooms_modify_policy"
ON storage_rooms
FOR INSERT, UPDATE, DELETE
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- CATEGORIES POLICIES
-- ============================================

CREATE POLICY "categories_service_role_all"
ON categories
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "categories_select_policy"
ON categories
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "categories_modify_policy"
ON categories
FOR INSERT, UPDATE, DELETE
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- USERS POLICIES (Most Restrictive)
-- ============================================

CREATE POLICY "users_service_role_all"
ON users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users table should NEVER be directly accessible from frontend
-- All user operations must go through authenticated API routes
CREATE POLICY "users_no_public_access"
ON users
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify policies are created:
-- 
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

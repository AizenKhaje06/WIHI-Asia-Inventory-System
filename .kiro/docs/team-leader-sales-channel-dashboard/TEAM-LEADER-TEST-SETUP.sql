-- Team Leader Dashboard - Test Setup Guide
-- Run these SQL commands in Supabase SQL Editor to set up test data

-- ============================================================================
-- STEP 1: Fix the users role constraint (if you haven't already)
-- ============================================================================
-- This allows 'team_leader' and 'operations' roles in the users table

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'staff', 'operations', 'team_leader'));

-- ============================================================================
-- STEP 2: Insert test team leader staff members
-- ============================================================================
-- Password hashing: Use bcrypt to hash passwords
-- For testing, we'll use pre-hashed passwords:
-- Password "2010404422" (Jake) = $2b$10$SSf4LKItwQvoNPuPLEyhT.ij3WEonVHvEbazocopTSbke/lQe0HPm
-- Password "12345678" (Aizen) = $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm

-- Warehouse Admin Team Leader
INSERT INTO users (id, username, password, role, display_name, created_at, email, assigned_channel)
VALUES (
  'tl_warehouse_001',
  'tl_warehouse_001',
  '$2b$10$SSf4LKItwQvoNPuPLEyhT.ij3WEonVHvEbazocopTSbke/lQe0HPm',
  'team_leader',
  'Team Lead - Warehouse',
  NOW(),
  'warehouse@local.test',
  'Warehouse Admin'
)
ON CONFLICT (username) DO NOTHING;

-- TikTok Team Leader
INSERT INTO users (id, username, password, role, display_name, created_at, email, assigned_channel)
VALUES (
  'tl_tiktok_001',
  'tl_tiktok_001',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm',
  'team_leader',
  'Team Lead - TikTok',
  NOW(),
  'tiktok@local.test',
  'TikTok'
)
ON CONFLICT (username) DO NOTHING;

-- Shopee Team Leader
INSERT INTO users (id, username, password, role, display_name, created_at, email, assigned_channel)
VALUES (
  'tl_shopee_001',
  'tl_shopee_001',
  '$2b$10$SSf4LKItwQvoNPuPLEyhT.ij3WEonVHvEbazocopTSbke/lQe0HPm',
  'team_leader',
  'Team Lead - Shopee',
  NOW(),
  'shopee@local.test',
  'Shopee'
)
ON CONFLICT (username) DO NOTHING;

-- Facebook Team Leader
INSERT INTO users (id, username, password, role, display_name, created_at, email, assigned_channel)
VALUES (
  'tl_facebook_001',
  'tl_facebook_001',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm',
  'team_leader',
  'Team Lead - Facebook',
  NOW(),
  'facebook@local.test',
  'Facebook'
)
ON CONFLICT (username) DO NOTHING;

-- Lazada Team Leader
INSERT INTO users (id, username, password, role, display_name, created_at, email, assigned_channel)
VALUES (
  'tl_lazada_001',
  'tl_lazada_001',
  '$2b$10$SSf4LKItwQvoNPuPLEyhT.ij3WEonVHvEbazocopTSbke/lQe0HPm',
  'team_leader',
  'Team Lead - Lazada',
  NOW(),
  'lazada@local.test',
  'Lazada'
)
ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- STEP 3: Verify test data was inserted
-- ============================================================================
-- Run this query to verify all team leaders were created:

SELECT id, username, display_name, role, assigned_channel, email 
FROM users 
WHERE role = 'team_leader'
ORDER BY assigned_channel;

-- ============================================================================
-- TEST LOGIN CREDENTIALS
-- ============================================================================
-- Use these credentials to test the team leader login:

-- Channel: Warehouse Admin, Password: 2010404422
-- Channel: TikTok, Password: 12345678
-- Channel: Shopee, Password: 2010404422
-- Channel: Facebook, Password: 12345678
-- Channel: Lazada, Password: 2010404422

-- ============================================================================
-- STEP 4: Insert sample orders for testing (optional)
-- ============================================================================
-- These orders will appear in the team leader dashboard

-- Sample order for Warehouse Admin channel
INSERT INTO orders (id, order_number, customer_name, total_amount, status, sales_channel, created_at)
VALUES (
  'order_001',
  'ORD-001',
  'Test Customer 1',
  1500.00,
  'pending',
  'Warehouse Admin',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Sample order for TikTok channel
INSERT INTO orders (id, order_number, customer_name, total_amount, status, sales_channel, created_at)
VALUES (
  'order_002',
  'ORD-002',
  'Test Customer 2',
  2500.00,
  'pending',
  'TikTok',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Sample order for Shopee channel
INSERT INTO orders (id, order_number, customer_name, total_amount, status, sales_channel, created_at)
VALUES (
  'order_003',
  'ORD-003',
  'Test Customer 3',
  3000.00,
  'completed',
  'Shopee',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 5: Verify orders were inserted
-- ============================================================================

SELECT id, order_number, customer_name, total_amount, status, sales_channel 
FROM orders 
WHERE sales_channel IN ('Warehouse Admin', 'TikTok', 'Shopee')
ORDER BY created_at DESC;

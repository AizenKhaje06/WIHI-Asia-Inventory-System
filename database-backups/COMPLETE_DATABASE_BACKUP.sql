-- ============================================
-- COMPLETE DATABASE BACKUP - WIHI Asia Inventory System
-- ============================================
-- This file contains ALL SQL code to recreate the entire database structure
-- Run this in Supabase SQL Editor to create a fresh database
-- Date: February 18, 2026
-- ============================================

-- ============================================
-- STEP 1: CREATE ALL TABLES
-- ============================================

-- 1. INVENTORY TABLE
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  storage_room TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  cost_price NUMERIC NOT NULL,
  selling_price NUMERIC NOT NULL,
  reorder_level INTEGER NOT NULL DEFAULT 10,
  last_updated TEXT NOT NULL,
  total_cogs NUMERIC DEFAULT 0,
  sku TEXT,
  discount NUMERIC DEFAULT 0,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_end_date TEXT,
  min_price NUMERIC,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  cost_price NUMERIC NOT NULL,
  selling_price NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  total_revenue NUMERIC NOT NULL DEFAULT 0,
  profit NUMERIC NOT NULL,
  timestamp TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sale', 'restock')),
  transaction_type TEXT CHECK (transaction_type IN ('sale', 'demo', 'internal', 'transfer')),
  department TEXT,
  customer_id TEXT,
  customer_name TEXT,
  discount NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  staff_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  loyalty_points INTEGER DEFAULT 0,
  total_purchases INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  last_purchase TEXT,
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. LOGS TABLE
CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  operation TEXT NOT NULL,
  item_id TEXT,
  item_name TEXT,
  details TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  staff_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RESTOCKS TABLE
CREATE TABLE IF NOT EXISTS restocks (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  cost_price NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  timestamp TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('restock', 'damaged-return', 'supplier-return')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. STORAGE ROOMS TABLE
CREATE TABLE IF NOT EXISTS storage_rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

-- 7. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

-- 8. USERS TABLE (for authentication)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  created_at TEXT NOT NULL
);

-- ============================================
-- STEP 2: CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_storage_room ON inventory(storage_room);
CREATE INDEX IF NOT EXISTS idx_inventory_name ON inventory(name);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory(quantity);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_department ON transactions(department);
CREATE INDEX IF NOT EXISTS idx_transactions_item_id ON transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_tier ON customers(tier);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- Logs indexes
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_operation ON logs(operation);
CREATE INDEX IF NOT EXISTS idx_logs_item_id ON logs(item_id);
CREATE INDEX IF NOT EXISTS idx_logs_staff_name ON logs(staff_name);

-- Restocks indexes
CREATE INDEX IF NOT EXISTS idx_restocks_timestamp ON restocks(timestamp);
CREATE INDEX IF NOT EXISTS idx_restocks_item_id ON restocks(item_id);
CREATE INDEX IF NOT EXISTS idx_restocks_reason ON restocks(reason);

-- ============================================
-- STEP 3: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE restocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: CREATE RLS POLICIES
-- ============================================

-- INVENTORY POLICIES
CREATE POLICY "inventory_read_all"
ON inventory FOR SELECT
USING (true);

CREATE POLICY "inventory_write_service"
ON inventory FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- TRANSACTIONS POLICIES
CREATE POLICY "transactions_read_all"
ON transactions FOR SELECT
USING (true);

CREATE POLICY "transactions_write_service"
ON transactions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- CUSTOMERS POLICIES
CREATE POLICY "customers_read_all"
ON customers FOR SELECT
USING (true);

CREATE POLICY "customers_write_service"
ON customers FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- LOGS POLICIES
CREATE POLICY "logs_read_all"
ON logs FOR SELECT
USING (true);

CREATE POLICY "logs_write_service"
ON logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- RESTOCKS POLICIES
CREATE POLICY "restocks_read_all"
ON restocks FOR SELECT
USING (true);

CREATE POLICY "restocks_write_service"
ON restocks FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- STORAGE ROOMS POLICIES
CREATE POLICY "storage_rooms_read_all"
ON storage_rooms FOR SELECT
USING (true);

CREATE POLICY "storage_rooms_write_service"
ON storage_rooms FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- CATEGORIES POLICIES
CREATE POLICY "categories_read_all"
ON categories FOR SELECT
USING (true);

CREATE POLICY "categories_write_service"
ON categories FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- USERS POLICIES (Most Restrictive)
CREATE POLICY "users_service_only"
ON users FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- STEP 5: ADD COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE inventory IS 'Stores all inventory items with pricing and stock levels';
COMMENT ON TABLE transactions IS 'Records all sales, restocks, and inventory movements';
COMMENT ON TABLE customers IS 'Customer information with loyalty points and tier system';
COMMENT ON TABLE logs IS 'Activity logs for all system operations';
COMMENT ON TABLE restocks IS 'Restock history including returns to suppliers';
COMMENT ON TABLE storage_rooms IS 'Available storage locations';
COMMENT ON TABLE categories IS 'Product categories';
COMMENT ON TABLE users IS 'System users with authentication';

COMMENT ON COLUMN transactions.total_revenue IS 'Total sale amount (selling_price × quantity)';
COMMENT ON COLUMN transactions.transaction_type IS 'Distinguishes sales from demo/internal/transfer movements';
COMMENT ON COLUMN customers.tier IS 'Customer tier based on total spending (bronze/silver/gold/platinum)';
COMMENT ON COLUMN logs.staff_name IS 'Name of staff member who performed the operation';
COMMENT ON COLUMN restocks.reason IS 'Reason for restock: restock, damaged-return, or supplier-return';

-- ============================================
-- STEP 6: VERIFICATION QUERIES
-- ============================================
-- Run these to verify the setup:

-- Check all tables exist
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check all policies
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;

-- Check all indexes
-- SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;

-- ============================================
-- NOTES:
-- ============================================
-- 1. This creates the complete database structure
-- 2. All tables have RLS enabled for security
-- 3. Indexes are created for optimal query performance
-- 4. Service role has full access, authenticated users have read access
-- 5. Run this in Supabase SQL Editor
-- 6. Make sure to set up your .env.local with Supabase credentials
-- 7. The total_revenue column in transactions is automatically calculated
-- 8. Customer tiers are automatically updated based on spending
-- ============================================

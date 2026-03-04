-- Migration: Add RLS Policies for Orders Table
-- Date: 2026-03-04
-- Description: Enable RLS and add policies to allow authenticated users to manage orders

-- Step 1: Enable RLS on orders table (if not already enabled)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Step 2: Enable RLS on order_items table
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policy to allow all operations on orders table
-- This allows any authenticated request to insert, select, update, delete orders
CREATE POLICY "Allow all operations on orders" ON orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Step 4: Create policy to allow all operations on order_items table
CREATE POLICY "Allow all operations on order_items" ON order_items
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Alternative: More restrictive policies (commented out)
-- If you want to restrict based on authentication, use these instead:

-- CREATE POLICY "Allow authenticated users to insert orders" ON orders
--   FOR INSERT
--   WITH CHECK (true);

-- CREATE POLICY "Allow authenticated users to select orders" ON orders
--   FOR SELECT
--   USING (true);

-- CREATE POLICY "Allow authenticated users to update orders" ON orders
--   FOR UPDATE
--   USING (true)
--   WITH CHECK (true);

-- CREATE POLICY "Allow authenticated users to delete orders" ON orders
--   FOR DELETE
--   USING (true);

-- CREATE POLICY "Allow authenticated users to insert order_items" ON order_items
--   FOR INSERT
--   WITH CHECK (true);

-- CREATE POLICY "Allow authenticated users to select order_items" ON order_items
--   FOR SELECT
--   USING (true);

COMMENT ON POLICY "Allow all operations on orders" ON orders IS 'Allows all operations on orders table for authenticated requests';
COMMENT ON POLICY "Allow all operations on order_items" ON order_items IS 'Allows all operations on order_items table for authenticated requests';

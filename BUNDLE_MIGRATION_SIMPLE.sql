-- =====================================================
-- BUNDLE PRODUCT SYSTEM - SIMPLE MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Create product_type enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type') THEN
    CREATE TYPE product_type AS ENUM ('simple', 'bundle', 'variant');
  END IF;
END $$;

-- Step 2: Add bundle columns to inventory table
ALTER TABLE inventory 
  ADD COLUMN IF NOT EXISTS product_type product_type DEFAULT 'simple',
  ADD COLUMN IF NOT EXISTS bundle_components JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_virtual_stock BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS bundle_metadata JSONB DEFAULT NULL;

-- Step 3: Add sales_channel if not exists
ALTER TABLE inventory 
  ADD COLUMN IF NOT EXISTS sales_channel TEXT;

-- Step 4: Add store column if not exists OR rename storage_room
DO $$
BEGIN
  -- Check if store column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory' AND column_name = 'store'
  ) THEN
    -- Check if storage_room exists and rename it
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'inventory' AND column_name = 'storage_room'
    ) THEN
      ALTER TABLE inventory RENAME COLUMN storage_room TO store;
    ELSE
      -- Neither exists, add store
      ALTER TABLE inventory ADD COLUMN store TEXT;
    END IF;
  END IF;
END $$;

-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS idx_inventory_product_type ON inventory(product_type);
CREATE INDEX IF NOT EXISTS idx_inventory_virtual_stock ON inventory(is_virtual_stock) WHERE is_virtual_stock = true;
CREATE INDEX IF NOT EXISTS idx_inventory_bundle_components ON inventory USING GIN (bundle_components) WHERE bundle_components IS NOT NULL;

-- Step 6: Create bundle_transactions table
CREATE TABLE IF NOT EXISTS bundle_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id TEXT NOT NULL,
  bundle_name TEXT,
  quantity_sold INTEGER NOT NULL,
  components_deducted JSONB NOT NULL,
  total_cost NUMERIC(10,2),
  total_revenue NUMERIC(10,2),
  profit NUMERIC(10,2),
  staff_name TEXT,
  department TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: Create indexes for bundle_transactions
CREATE INDEX IF NOT EXISTS idx_bundle_transactions_bundle_id ON bundle_transactions(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_transactions_created_at ON bundle_transactions(created_at DESC);

-- Step 8: Enable RLS on bundle_transactions
ALTER TABLE bundle_transactions ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON bundle_transactions;
CREATE POLICY "Enable read access for all users" ON bundle_transactions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON bundle_transactions;
CREATE POLICY "Enable insert for all users" ON bundle_transactions
  FOR INSERT WITH CHECK (true);

-- Step 10: Create virtual stock calculation function
CREATE OR REPLACE FUNCTION calculate_bundle_virtual_stock(bundle_item_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  component JSONB;
  component_item_id TEXT;
  component_quantity INTEGER;
  component_stock INTEGER;
  max_bundles INTEGER := 999999;
  possible_bundles INTEGER;
BEGIN
  FOR component IN 
    SELECT jsonb_array_elements(bundle_components) 
    FROM inventory 
    WHERE id = bundle_item_id AND product_type = 'bundle'
  LOOP
    component_item_id := component->>'item_id';
    component_quantity := (component->>'quantity')::INTEGER;
    
    SELECT quantity INTO component_stock 
    FROM inventory 
    WHERE id = component_item_id;
    
    IF component_stock IS NULL THEN
      RETURN 0;
    END IF;
    
    possible_bundles := FLOOR(component_stock / component_quantity);
    
    IF possible_bundles < max_bundles THEN
      max_bundles := possible_bundles;
    END IF;
  END LOOP;
  
  IF max_bundles = 999999 THEN
    RETURN 0;
  END IF;
  
  RETURN GREATEST(max_bundles, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Step 11: Create component deduction function
CREATE OR REPLACE FUNCTION deduct_bundle_components(
  p_bundle_id TEXT,
  p_quantity INTEGER,
  p_staff_name TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  component JSONB;
  component_item_id TEXT;
  component_quantity INTEGER;
  total_deduction INTEGER;
  deductions JSONB := '[]'::JSONB;
  deduction_record JSONB;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM inventory 
    WHERE id = p_bundle_id AND product_type = 'bundle'
  ) THEN
    RAISE EXCEPTION 'Invalid bundle ID or not a bundle product';
  END IF;
  
  FOR component IN 
    SELECT jsonb_array_elements(bundle_components) 
    FROM inventory 
    WHERE id = p_bundle_id
  LOOP
    component_item_id := component->>'item_id';
    component_quantity := (component->>'quantity')::INTEGER;
    total_deduction := component_quantity * p_quantity;
    
    UPDATE inventory 
    SET quantity = quantity - total_deduction,
        last_updated = NOW()::TEXT
    WHERE id = component_item_id;
    
    deduction_record := jsonb_build_object(
      'item_id', component_item_id,
      'quantity_per_bundle', component_quantity,
      'bundles_sold', p_quantity,
      'total_deducted', total_deduction
    );
    
    deductions := deductions || deduction_record;
  END LOOP;
  
  RETURN deductions;
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Bundle Product System Migration Complete!';
  RAISE NOTICE '📊 Columns added: product_type, bundle_components, is_virtual_stock, bundle_metadata';
  RAISE NOTICE '📋 Table created: bundle_transactions';
  RAISE NOTICE '⚙️  Functions created: calculate_bundle_virtual_stock, deduct_bundle_components';
END $$;

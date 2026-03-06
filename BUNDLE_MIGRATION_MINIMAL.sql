-- =====================================================
-- BUNDLE PRODUCT SYSTEM - MINIMAL MIGRATION
-- This adds ONLY the bundle columns without touching existing ones
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Create product_type enum (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type') THEN
    CREATE TYPE product_type AS ENUM ('simple', 'bundle', 'variant');
    RAISE NOTICE '✅ Created product_type enum';
  ELSE
    RAISE NOTICE '⏭️  product_type enum already exists';
  END IF;
END $$;

-- Step 2: Add ONLY the bundle columns (don't touch storage_room)
ALTER TABLE inventory 
  ADD COLUMN IF NOT EXISTS product_type product_type DEFAULT 'simple',
  ADD COLUMN IF NOT EXISTS bundle_components JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_virtual_stock BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS bundle_metadata JSONB DEFAULT NULL;

-- Step 3: Add sales_channel if not exists
ALTER TABLE inventory 
  ADD COLUMN IF NOT EXISTS sales_channel TEXT;

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_inventory_product_type ON inventory(product_type);
CREATE INDEX IF NOT EXISTS idx_inventory_bundle_components ON inventory USING GIN (bundle_components) WHERE bundle_components IS NOT NULL;

-- Step 5: Create bundle_transactions table
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

-- Step 6: Enable RLS
ALTER TABLE bundle_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON bundle_transactions;
CREATE POLICY "Enable read access for all users" ON bundle_transactions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON bundle_transactions;
CREATE POLICY "Enable insert for all users" ON bundle_transactions
  FOR INSERT WITH CHECK (true);

-- Step 7: Create virtual stock function
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

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  ✅ BUNDLE MIGRATION COMPLETE!                            ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Added to inventory table:';
  RAISE NOTICE '   ✅ product_type column';
  RAISE NOTICE '   ✅ bundle_components column';
  RAISE NOTICE '   ✅ is_virtual_stock column';
  RAISE NOTICE '   ✅ bundle_metadata column';
  RAISE NOTICE '   ✅ sales_channel column';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Created bundle_transactions table';
  RAISE NOTICE '⚙️  Created calculate_bundle_virtual_stock() function';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Bundle system is ready!';
  RAISE NOTICE '   Note: Using existing storage_room field (not renamed)';
  RAISE NOTICE '';
END $$;

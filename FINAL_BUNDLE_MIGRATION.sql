-- =====================================================
-- BUNDLE PRODUCT SYSTEM - FINAL CORRECTED VERSION
-- Migration: 020_add_bundle_product_support
-- Checks existing columns before adding
-- =====================================================

-- 1. Add product type enum (skip if exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type') THEN
    CREATE TYPE product_type AS ENUM ('simple', 'bundle', 'variant');
    RAISE NOTICE '✅ Created product_type enum';
  ELSE
    RAISE NOTICE '⏭️  product_type enum already exists, skipping';
  END IF;
END $$;

-- 2. Add sku column if not exists (some databases might not have it)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory' AND column_name = 'sku'
  ) THEN
    ALTER TABLE inventory ADD COLUMN sku TEXT;
    RAISE NOTICE '✅ Added sku column to inventory';
  ELSE
    RAISE NOTICE '⏭️  sku column already exists';
  END IF;
END $$;

-- 3. Add sales_channel column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory' AND column_name = 'sales_channel'
  ) THEN
    ALTER TABLE inventory ADD COLUMN sales_channel TEXT;
    RAISE NOTICE '✅ Added sales_channel column to inventory';
  ELSE
    RAISE NOTICE '⏭️  sales_channel column already exists';
  END IF;
END $$;

-- 4. Add store column if not exists (might still be storage_room in some DBs)
DO $$
BEGIN
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
      RAISE NOTICE '✅ Renamed storage_room to store';
    ELSE
      ALTER TABLE inventory ADD COLUMN store TEXT;
      RAISE NOTICE '✅ Added store column to inventory';
    END IF;
  ELSE
    RAISE NOTICE '⏭️  store column already exists';
  END IF;
END $$;

-- 5. Extend inventory table with bundle support
ALTER TABLE inventory 
  ADD COLUMN IF NOT EXISTS product_type product_type DEFAULT 'simple',
  ADD COLUMN IF NOT EXISTS bundle_components JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_virtual_stock BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS bundle_metadata JSONB DEFAULT NULL;

RAISE NOTICE '✅ Added bundle columns to inventory table';

-- 6. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_product_type ON inventory(product_type);
CREATE INDEX IF NOT EXISTS idx_inventory_virtual_stock ON inventory(is_virtual_stock) WHERE is_virtual_stock = true;
CREATE INDEX IF NOT EXISTS idx_inventory_bundle_components ON inventory USING GIN (bundle_components) WHERE bundle_components IS NOT NULL;

RAISE NOTICE '✅ Created indexes';

-- 7. Add constraints
DO $$
BEGIN
  -- Check bundle_components format
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_bundle_components_format'
  ) THEN
    ALTER TABLE inventory 
      ADD CONSTRAINT check_bundle_components_format 
      CHECK (
        bundle_components IS NULL OR 
        (jsonb_typeof(bundle_components) = 'array')
      );
    RAISE NOTICE '✅ Added check_bundle_components_format constraint';
  END IF;

  -- Check bundle has components
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_bundle_has_components'
  ) THEN
    ALTER TABLE inventory 
      ADD CONSTRAINT check_bundle_has_components 
      CHECK (
        (product_type != 'bundle') OR 
        (product_type = 'bundle' AND bundle_components IS NOT NULL AND jsonb_array_length(bundle_components) > 0)
      );
    RAISE NOTICE '✅ Added check_bundle_has_components constraint';
  END IF;
END $$;

-- 8. Create bundle_transactions table
CREATE TABLE IF NOT EXISTS bundle_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bundle_id TEXT NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  bundle_name TEXT,
  quantity_sold INTEGER NOT NULL,
  components_deducted JSONB NOT NULL,
  total_cost NUMERIC(10,2),
  total_revenue NUMERIC(10,2),
  profit NUMERIC(10,2),
  staff_name TEXT,
  department TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT check_component_deductions_format 
  CHECK (jsonb_typeof(components_deducted) = 'array')
);

RAISE NOTICE '✅ Created bundle_transactions table';

-- 9. Add indexes for bundle_transactions
CREATE INDEX IF NOT EXISTS idx_bundle_transactions_bundle_id ON bundle_transactions(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_transactions_created_at ON bundle_transactions(created_at DESC);

-- 10. Create function to calculate virtual stock
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
    
    possible_bundles := FLOOR(component_stock / component_quantity);
    
    IF possible_bundles < max_bundles THEN
      max_bundles := possible_bundles;
    END IF;
  END LOOP;
  
  RETURN GREATEST(max_bundles, 0);
END;
$$ LANGUAGE plpgsql STABLE;

RAISE NOTICE '✅ Created calculate_bundle_virtual_stock function';

-- 11. Create function to deduct components
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

RAISE NOTICE '✅ Created deduct_bundle_components function';

-- 12. Create bundle inventory view (with NULL checks for missing columns)
CREATE OR REPLACE VIEW bundle_inventory_view AS
SELECT 
  i.id,
  i.name,
  COALESCE(i.sku, '') as sku,
  i.product_type,
  i.bundle_components,
  i.cost_price,
  i.selling_price,
  COALESCE(i.sales_channel, '') as sales_channel,
  COALESCE(i.store, i.storage_room, '') as store,
  CASE 
    WHEN i.is_virtual_stock THEN calculate_bundle_virtual_stock(i.id)
    ELSE i.quantity
  END AS available_stock,
  i.is_virtual_stock,
  i.bundle_metadata,
  i.last_updated
FROM inventory i
WHERE i.product_type = 'bundle';

RAISE NOTICE '✅ Created bundle_inventory_view';

-- 13. Enable RLS
ALTER TABLE bundle_transactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bundle_transactions' AND policyname = 'Enable read access for all users'
  ) THEN
    CREATE POLICY "Enable read access for all users" ON bundle_transactions
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bundle_transactions' AND policyname = 'Enable insert for all users'
  ) THEN
    CREATE POLICY "Enable insert for all users" ON bundle_transactions
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

RAISE NOTICE '✅ Enabled RLS policies';

-- 14. Add comments
COMMENT ON COLUMN inventory.product_type IS 'Type of product: simple (regular), bundle (multiple items), variant (size/color variations)';
COMMENT ON COLUMN inventory.bundle_components IS 'JSON array of component items: [{"item_id": "uuid", "quantity": 3}]';
COMMENT ON COLUMN inventory.is_virtual_stock IS 'If true, stock is calculated from components, not stored directly';
COMMENT ON COLUMN inventory.bundle_metadata IS 'Additional bundle info: discount_percentage, original_price, etc.';
COMMENT ON TABLE bundle_transactions IS 'Audit trail for bundle sales and component deductions';

-- 15. Grant permissions
GRANT SELECT ON bundle_inventory_view TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_bundle_virtual_stock TO anon, authenticated;
GRANT EXECUTE ON FUNCTION deduct_bundle_components TO anon, authenticated;

-- Final success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  ✅ BUNDLE PRODUCT SYSTEM MIGRATION COMPLETE!             ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '📊 New columns added to inventory table:';
  RAISE NOTICE '   - product_type (enum)';
  RAISE NOTICE '   - bundle_components (JSONB)';
  RAISE NOTICE '   - is_virtual_stock (BOOLEAN)';
  RAISE NOTICE '   - bundle_metadata (JSONB)';
  RAISE NOTICE '';
  RAISE NOTICE '📋 New table created: bundle_transactions';
  RAISE NOTICE '⚙️  Functions created:';
  RAISE NOTICE '   - calculate_bundle_virtual_stock()';
  RAISE NOTICE '   - deduct_bundle_components()';
  RAISE NOTICE '👁️  View created: bundle_inventory_view';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 You can now create bundle products!';
  RAISE NOTICE '';
END $$;

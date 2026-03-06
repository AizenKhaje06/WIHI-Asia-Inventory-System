-- =====================================================
-- BUNDLE PRODUCT SYSTEM - ENTERPRISE ARCHITECTURE
-- Migration: 020_add_bundle_product_support
-- Author: Software Architect
-- Date: 2026-03-06
-- CORRECTED: Using 'inventory' table (not 'items')
-- =====================================================

-- 1. Add product type enum for type safety
CREATE TYPE product_type AS ENUM ('simple', 'bundle', 'variant');

-- 2. Extend inventory table with bundle support
ALTER TABLE inventory 
  ADD COLUMN IF NOT EXISTS product_type product_type DEFAULT 'simple',
  ADD COLUMN IF NOT EXISTS bundle_components JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_virtual_stock BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS bundle_metadata JSONB DEFAULT NULL;

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_product_type ON inventory(product_type);
CREATE INDEX IF NOT EXISTS idx_inventory_virtual_stock ON inventory(is_virtual_stock) WHERE is_virtual_stock = true;
CREATE INDEX IF NOT EXISTS idx_inventory_bundle_components ON inventory USING GIN (bundle_components) WHERE bundle_components IS NOT NULL;

-- 4. Add constraint to ensure bundle_components is valid JSON array
ALTER TABLE inventory 
  ADD CONSTRAINT check_bundle_components_format 
  CHECK (
    bundle_components IS NULL OR 
    (jsonb_typeof(bundle_components) = 'array')
  );

-- 5. Add constraint: bundles must have components
ALTER TABLE inventory 
  ADD CONSTRAINT check_bundle_has_components 
  CHECK (
    (product_type != 'bundle') OR 
    (product_type = 'bundle' AND bundle_components IS NOT NULL AND jsonb_array_length(bundle_components) > 0)
  );

-- 6. Create bundle_transactions table for audit trail
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

-- 7. Add indexes for bundle_transactions
CREATE INDEX IF NOT EXISTS idx_bundle_transactions_bundle_id ON bundle_transactions(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_transactions_created_at ON bundle_transactions(created_at DESC);

-- 8. Create function to calculate virtual stock for bundles
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
  -- Get bundle components
  FOR component IN 
    SELECT jsonb_array_elements(bundle_components) 
    FROM inventory 
    WHERE id = bundle_item_id AND product_type = 'bundle'
  LOOP
    component_item_id := component->>'item_id';
    component_quantity := (component->>'quantity')::INTEGER;
    
    -- Get component stock
    SELECT quantity INTO component_stock 
    FROM inventory 
    WHERE id = component_item_id;
    
    -- Calculate how many bundles can be made with this component
    possible_bundles := FLOOR(component_stock / component_quantity);
    
    -- Track the minimum (bottleneck component)
    IF possible_bundles < max_bundles THEN
      max_bundles := possible_bundles;
    END IF;
  END LOOP;
  
  RETURN GREATEST(max_bundles, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- 9. Create function to deduct bundle components on sale
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
  -- Validate bundle exists and is a bundle type
  IF NOT EXISTS (
    SELECT 1 FROM inventory 
    WHERE id = p_bundle_id AND product_type = 'bundle'
  ) THEN
    RAISE EXCEPTION 'Invalid bundle ID or not a bundle product';
  END IF;
  
  -- Process each component
  FOR component IN 
    SELECT jsonb_array_elements(bundle_components) 
    FROM inventory 
    WHERE id = p_bundle_id
  LOOP
    component_item_id := component->>'item_id';
    component_quantity := (component->>'quantity')::INTEGER;
    total_deduction := component_quantity * p_quantity;
    
    -- Deduct from component stock
    UPDATE inventory 
    SET quantity = quantity - total_deduction,
        last_updated = NOW()::TEXT
    WHERE id = component_item_id;
    
    -- Record deduction
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

-- 10. Create view for bundle inventory with virtual stock
CREATE OR REPLACE VIEW bundle_inventory_view AS
SELECT 
  i.id,
  i.name,
  i.sku,
  i.product_type,
  i.bundle_components,
  i.cost_price,
  i.selling_price,
  i.sales_channel,
  i.store,
  CASE 
    WHEN i.is_virtual_stock THEN calculate_bundle_virtual_stock(i.id)
    ELSE i.quantity
  END AS available_stock,
  i.is_virtual_stock,
  i.bundle_metadata,
  i.last_updated
FROM inventory i
WHERE i.product_type = 'bundle';

-- 11. Add RLS policies for bundle_transactions
ALTER TABLE bundle_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON bundle_transactions
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON bundle_transactions
  FOR INSERT WITH CHECK (true);

-- 12. Add comments for documentation
COMMENT ON COLUMN inventory.product_type IS 'Type of product: simple (regular), bundle (multiple items), variant (size/color variations)';
COMMENT ON COLUMN inventory.bundle_components IS 'JSON array of component items: [{"item_id": "uuid", "quantity": 3}]';
COMMENT ON COLUMN inventory.is_virtual_stock IS 'If true, stock is calculated from components, not stored directly';
COMMENT ON COLUMN inventory.bundle_metadata IS 'Additional bundle info: discount_percentage, original_price, etc.';
COMMENT ON TABLE bundle_transactions IS 'Audit trail for bundle sales and component deductions';
COMMENT ON FUNCTION calculate_bundle_virtual_stock IS 'Calculates available bundle stock based on component availability';
COMMENT ON FUNCTION deduct_bundle_components IS 'Deducts component items when a bundle is sold';

-- 13. Grant necessary permissions
GRANT SELECT ON bundle_inventory_view TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_bundle_virtual_stock TO anon, authenticated;
GRANT EXECUTE ON FUNCTION deduct_bundle_components TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Bundle Product System migration completed successfully!';
  RAISE NOTICE 'New columns added to inventory table: product_type, bundle_components, is_virtual_stock, bundle_metadata';
  RAISE NOTICE 'New table created: bundle_transactions';
  RAISE NOTICE 'Functions created: calculate_bundle_virtual_stock(), deduct_bundle_components()';
  RAISE NOTICE 'View created: bundle_inventory_view';
END $$;

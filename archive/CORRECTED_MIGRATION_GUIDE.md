# ✅ CORRECTED Bundle Product System Migration

## 🔧 Important Correction

**Table Name**: `inventory` (NOT `items`)

Salamat sa pag-catch ng error! Ang correct table name sa database mo ay **`inventory`**, hindi `items`.

---

## 📋 Updated Files

### 1. Migration File ✅
**File**: `supabase/migrations/020_add_bundle_product_support.sql`
- Changed all `items` references to `inventory`
- Updated foreign key references
- Updated function references

### 2. API Files ✅
All bundle API files updated:
- `app/api/bundles/route.ts`
- `app/api/bundles/[id]/route.ts`
- `app/api/bundles/sell/route.ts`

Changed: `.from('items')` → `.from('inventory')`

### 3. Utility Functions ✅
**File**: `lib/bundle-utils.ts`
- Updated all Supabase queries to use `inventory` table

---

## 🚀 Corrected SQL Migration

Copy and run this in Supabase SQL Editor:

```sql
-- =====================================================
-- BUNDLE PRODUCT SYSTEM - CORRECTED MIGRATION
-- Using 'inventory' table (not 'items')
-- =====================================================

-- 1. Add product type enum
CREATE TYPE product_type AS ENUM ('simple', 'bundle', 'variant');

-- 2. Extend inventory table
ALTER TABLE inventory 
  ADD COLUMN IF NOT EXISTS product_type product_type DEFAULT 'simple',
  ADD COLUMN IF NOT EXISTS bundle_components JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_virtual_stock BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS bundle_metadata JSONB DEFAULT NULL;

-- 3. Add indexes
CREATE INDEX IF NOT EXISTS idx_inventory_product_type ON inventory(product_type);
CREATE INDEX IF NOT EXISTS idx_inventory_virtual_stock ON inventory(is_virtual_stock) WHERE is_virtual_stock = true;
CREATE INDEX IF NOT EXISTS idx_inventory_bundle_components ON inventory USING GIN (bundle_components) WHERE bundle_components IS NOT NULL;

-- 4. Add constraints
ALTER TABLE inventory 
  ADD CONSTRAINT check_bundle_components_format 
  CHECK (
    bundle_components IS NULL OR 
    (jsonb_typeof(bundle_components) = 'array')
  );

ALTER TABLE inventory 
  ADD CONSTRAINT check_bundle_has_components 
  CHECK (
    (product_type != 'bundle') OR 
    (product_type = 'bundle' AND bundle_components IS NOT NULL AND jsonb_array_length(bundle_components) > 0)
  );

-- 5. Create bundle_transactions table
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

-- 6. Add indexes for bundle_transactions
CREATE INDEX IF NOT EXISTS idx_bundle_transactions_bundle_id ON bundle_transactions(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_transactions_created_at ON bundle_transactions(created_at DESC);

-- 7. Create virtual stock calculation function
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

-- 8. Create component deduction function
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

-- 9. Create bundle inventory view
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

-- 10. Enable RLS
ALTER TABLE bundle_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON bundle_transactions
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON bundle_transactions
  FOR INSERT WITH CHECK (true);

-- 11. Grant permissions
GRANT SELECT ON bundle_inventory_view TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_bundle_virtual_stock TO anon, authenticated;
GRANT EXECUTE ON FUNCTION deduct_bundle_components TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Bundle Product System migration completed successfully!';
  RAISE NOTICE '📊 New columns added to inventory table';
  RAISE NOTICE '📋 New table created: bundle_transactions';
  RAISE NOTICE '⚙️  Functions created: calculate_bundle_virtual_stock(), deduct_bundle_components()';
  RAISE NOTICE '👁️  View created: bundle_inventory_view';
END $$;
```

---

## ✅ What Was Changed

### Database Schema
- ✅ `items` → `inventory` (all references)
- ✅ Foreign keys updated
- ✅ Function queries updated
- ✅ View queries updated

### API Endpoints
- ✅ All `.from('items')` → `.from('inventory')`
- ✅ GET /api/bundles
- ✅ POST /api/bundles
- ✅ GET /api/bundles/[id]
- ✅ PUT /api/bundles/[id]
- ✅ DELETE /api/bundles/[id]
- ✅ POST /api/bundles/sell

### Utility Functions
- ✅ `lib/bundle-utils.ts` updated
- ✅ All Supabase queries use `inventory`

---

## 🎯 Next Steps

1. **Run the corrected SQL** in Supabase SQL Editor
2. **Verify success** - Check for success message
3. **Check tables** - Verify new columns in `inventory` table
4. **Test bundle creation** - Use the UI
5. **Test API endpoints** - Use Postman

---

## 📊 Verification

After running migration, check:

```sql
-- Check inventory table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'inventory' 
AND column_name IN ('product_type', 'bundle_components', 'is_virtual_stock', 'bundle_metadata');

-- Check bundle_transactions table
SELECT * FROM bundle_transactions LIMIT 1;

-- Check functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE '%bundle%';

-- Check view
SELECT * FROM bundle_inventory_view LIMIT 1;
```

---

## 🎉 Summary

**Status**: ✅ CORRECTED AND READY

All files updated to use the correct `inventory` table name. Migration SQL is now correct and ready to run!

**Thank you for catching this error!** 🙏

---

*Corrected: March 6, 2026*
*Issue: Table name mismatch (items vs inventory)*
*Resolution: All references updated to 'inventory'*

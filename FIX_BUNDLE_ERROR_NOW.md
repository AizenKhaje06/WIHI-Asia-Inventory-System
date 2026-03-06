# 🚨 FIX BUNDLE ERROR NOW - Step by Step

## ❌ CURRENT ERROR
```
Error creating bundle: Error: Failed to create bundle
POST /api/bundles 500 (Internal Server Error)
```

## 🎯 ROOT CAUSE
**The database migration has NOT been run yet!**

Your `inventory` table is missing these required columns:
- `product_type`
- `bundle_components`
- `is_virtual_stock`
- `bundle_metadata`
- `sales_channel`

---

## ✅ SOLUTION (5 MINUTES)

### Step 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar

### Step 2: Run Diagnostic Test (Optional)

Copy and paste `TEST_BUNDLE_COLUMNS.sql` to see what's missing.

**OR** run this quick test:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'inventory' 
  AND column_name IN ('product_type', 'bundle_components', 'is_virtual_stock')
ORDER BY column_name;
```

**Expected:** Should return 0 rows (meaning columns don't exist)

### Step 3: Run the Migration

**Copy the ENTIRE contents of `BUNDLE_MIGRATION_SIMPLE.sql`** and paste into SQL Editor.

**OR** copy this complete migration:

```sql
-- =====================================================
-- BUNDLE PRODUCT SYSTEM - MIGRATION
-- =====================================================

-- 1. Create product_type enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type') THEN
    CREATE TYPE product_type AS ENUM ('simple', 'bundle', 'variant');
  END IF;
END $$;

-- 2. Add bundle columns to inventory
ALTER TABLE inventory 
  ADD COLUMN IF NOT EXISTS product_type product_type DEFAULT 'simple',
  ADD COLUMN IF NOT EXISTS bundle_components JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_virtual_stock BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS bundle_metadata JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sales_channel TEXT;

-- 3. Handle store/storage_room field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory' AND column_name = 'store'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'inventory' AND column_name = 'storage_room'
    ) THEN
      ALTER TABLE inventory RENAME COLUMN storage_room TO store;
    ELSE
      ALTER TABLE inventory ADD COLUMN store TEXT;
    END IF;
  END IF;
END $$;

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_inventory_product_type ON inventory(product_type);
CREATE INDEX IF NOT EXISTS idx_inventory_bundle_components ON inventory USING GIN (bundle_components) WHERE bundle_components IS NOT NULL;

-- 5. Create bundle_transactions table
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

-- 6. Enable RLS
ALTER TABLE bundle_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON bundle_transactions;
CREATE POLICY "Enable read access for all users" ON bundle_transactions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON bundle_transactions;
CREATE POLICY "Enable insert for all users" ON bundle_transactions
  FOR INSERT WITH CHECK (true);

-- 7. Create virtual stock function
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

-- Success!
SELECT '✅ BUNDLE MIGRATION COMPLETE!' as status;
```

### Step 4: Click "Run" Button

Wait for the query to complete. You should see:
```
✅ BUNDLE MIGRATION COMPLETE!
```

### Step 5: Verify Success

Run this verification query:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'inventory'
  AND column_name IN ('product_type', 'bundle_components', 'is_virtual_stock', 'bundle_metadata', 'sales_channel', 'store')
ORDER BY column_name;
```

**Expected Result:** Should show 6 rows (all columns exist)

### Step 6: Restart Your Dev Server

```bash
# Stop current server (Ctrl+C in terminal)
npm run dev
```

### Step 7: Test Bundle Creation

1. Go to: `http://localhost:3000/dashboard/inventory`
2. Click **"Create Bundle"** button (purple)
3. Fill in the form:
   - Bundle Name: `Test Bundle`
   - Category: Select any
   - Sales Channel: `Physical Store`
   - Store: Select any
   - Add 2 components
   - Set selling price
4. Click **"Create Bundle"**
5. ✅ **Should work now!**

---

## 🔍 TROUBLESHOOTING

### If Migration Shows Errors:

**Error: "type product_type already exists"**
- ✅ This is OK! It means the enum was already created
- Continue with the rest of the migration

**Error: "column already exists"**
- ✅ This is OK! The migration uses `IF NOT EXISTS`
- It will skip columns that already exist

**Error: "permission denied"**
- ❌ You need admin access to run migrations
- Contact your Supabase project admin

### If Bundle Creation Still Fails:

1. **Check browser console** for detailed error
2. **Check Network tab** for API response
3. **Run verification query** to confirm columns exist
4. **Clear browser cache** and reload page
5. **Restart dev server** completely

---

## 📋 QUICK CHECKLIST

- [ ] Opened Supabase Dashboard
- [ ] Went to SQL Editor
- [ ] Pasted migration SQL
- [ ] Clicked "Run"
- [ ] Saw success message
- [ ] Ran verification query
- [ ] All 6 columns exist
- [ ] Restarted dev server
- [ ] Tested bundle creation
- [ ] ✅ Bundle created successfully!

---

## 🎯 WHAT THE MIGRATION DOES

1. **Creates `product_type` enum** - Allows 'simple', 'bundle', 'variant'
2. **Adds 5 new columns** to inventory table:
   - `product_type` - Type of product
   - `bundle_components` - JSONB array of components
   - `is_virtual_stock` - Boolean for virtual stock
   - `bundle_metadata` - Additional bundle info
   - `sales_channel` - Multi-channel support
3. **Renames `storage_room` to `store`** (if needed)
4. **Creates indexes** for performance
5. **Creates `bundle_transactions` table** for audit trail
6. **Creates helper function** for virtual stock calculation
7. **Sets up RLS policies** for security

---

## ⏱️ TIME ESTIMATE

- **Migration:** 30 seconds
- **Verification:** 10 seconds
- **Restart server:** 10 seconds
- **Test:** 1 minute

**Total: ~2 minutes**

---

## 🎉 AFTER SUCCESS

Once bundle creation works:

1. ✅ Create a few test bundles
2. ✅ Verify they appear in inventory
3. ✅ Check virtual stock calculation
4. ✅ Test with different components
5. ✅ Verify database records

---

## 📞 STILL STUCK?

If you're still getting errors after running the migration:

1. **Screenshot the error** from Supabase SQL Editor
2. **Screenshot the browser console** error
3. **Run the diagnostic test** (`TEST_BUNDLE_COLUMNS.sql`)
4. **Check if columns exist** using verification query

**Most likely issue:** Migration didn't run completely. Try running it again!

---

**STATUS:** 🚨 ACTION REQUIRED  
**PRIORITY:** HIGH  
**DIFFICULTY:** Easy (just copy-paste)  
**TIME:** 2 minutes

**RUN THE MIGRATION NOW TO FIX THE ERROR!** 🚀

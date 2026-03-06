# 🔧 Bundle Creation Error - Fix Guide

## ❌ ERROR ENCOUNTERED

```
Error: Failed to create bundle
POST http://localhost:3000/api/bundles 500 (Internal Server Error)
```

## 🔍 ROOT CAUSE

The error is caused by **missing database columns** in the `inventory` table. The bundle system requires additional columns that may not exist in your current database schema.

---

## ✅ SOLUTION - Run Migration

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Simple Migration

Copy and paste the contents of `BUNDLE_MIGRATION_SIMPLE.sql` into the SQL Editor and click **Run**.

**OR** manually run this:

```sql
-- Create product_type enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type') THEN
    CREATE TYPE product_type AS ENUM ('simple', 'bundle', 'variant');
  END IF;
END $$;

-- Add bundle columns
ALTER TABLE inventory 
  ADD COLUMN IF NOT EXISTS product_type product_type DEFAULT 'simple',
  ADD COLUMN IF NOT EXISTS bundle_components JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_virtual_stock BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS bundle_metadata JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sales_channel TEXT;

-- Handle store/storage_room field
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_inventory_product_type ON inventory(product_type);
CREATE INDEX IF NOT EXISTS idx_inventory_bundle_components ON inventory USING GIN (bundle_components) WHERE bundle_components IS NOT NULL;

-- Create bundle_transactions table
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

-- Enable RLS
ALTER TABLE bundle_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON bundle_transactions;
CREATE POLICY "Enable read access for all users" ON bundle_transactions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON bundle_transactions;
CREATE POLICY "Enable insert for all users" ON bundle_transactions
  FOR INSERT WITH CHECK (true);

-- Create functions
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
```

### Step 3: Verify Migration Success

Run the verification script from `VERIFY_BUNDLE_MIGRATION.sql`:

```sql
-- Check if columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'inventory'
  AND column_name IN ('product_type', 'bundle_components', 'is_virtual_stock', 'bundle_metadata', 'sales_channel', 'store')
ORDER BY column_name;
```

**Expected Result:** You should see all 6 columns listed.

### Step 4: Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### Step 5: Test Bundle Creation Again

1. Go to `http://localhost:3000/dashboard/inventory`
2. Click **"Create Bundle"** button
3. Fill in the form
4. Click **"Create Bundle"**
5. ✅ Should work now!

---

## 🔍 TROUBLESHOOTING

### Issue 1: "column does not exist" error

**Solution:** The migration didn't run successfully. Check Supabase logs for errors.

### Issue 2: "type product_type does not exist"

**Solution:** Run the enum creation part of the migration again:

```sql
CREATE TYPE product_type AS ENUM ('simple', 'bundle', 'variant');
```

### Issue 3: Still getting 500 error

**Solution:** Check the browser console and Network tab for the actual error message. Look for:
- Missing columns
- Invalid data types
- Constraint violations

### Issue 4: "storage_room" vs "store" confusion

**Solution:** The migration handles this automatically. If you still have `storage_room`, it will be renamed to `store`.

---

## 📋 WHAT WAS FIXED IN THE CODE

### 1. API Route (`app/api/bundles/route.ts`)
- ✅ Added fallback for both `store` and `storage_room` fields
- ✅ Made `category` optional with default value
- ✅ Added proper error handling for missing columns

### 2. Modal (`components/create-bundle-modal.tsx`)
- ✅ Already sends correct snake_case fields
- ✅ Includes category in request

### 3. Migration Files
- ✅ Created `BUNDLE_MIGRATION_SIMPLE.sql` - Easy to run version
- ✅ Created `VERIFY_BUNDLE_MIGRATION.sql` - Verification script
- ✅ Handles both old and new schema

---

## ✅ VERIFICATION CHECKLIST

After running the migration, verify:

- [ ] `product_type` enum exists
- [ ] `inventory` table has new columns:
  - [ ] `product_type`
  - [ ] `bundle_components`
  - [ ] `is_virtual_stock`
  - [ ] `bundle_metadata`
  - [ ] `sales_channel`
  - [ ] `store` (or `storage_room` renamed)
- [ ] `bundle_transactions` table exists
- [ ] Functions created:
  - [ ] `calculate_bundle_virtual_stock()`
  - [ ] `deduct_bundle_components()`
- [ ] RLS policies enabled
- [ ] Indexes created

---

## 🎯 NEXT STEPS AFTER FIX

1. **Test bundle creation via UI**
2. **Verify bundle appears in inventory**
3. **Check database for bundle record**
4. **Test bundle with different components**
5. **Test virtual stock calculation**

---

## 📞 STILL HAVING ISSUES?

If the error persists after running the migration:

1. **Check Supabase Logs:**
   - Go to Supabase Dashboard → Logs
   - Look for SQL errors or constraint violations

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for detailed error messages
   - Check Network tab for API response

3. **Verify Column Names:**
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'inventory' 
   ORDER BY column_name;
   ```

4. **Test with Simple Bundle:**
   - Use only 2 components
   - Use simple product names
   - Use low quantities

---

## 📝 FILES TO USE

1. **`BUNDLE_MIGRATION_SIMPLE.sql`** - Run this in Supabase SQL Editor
2. **`VERIFY_BUNDLE_MIGRATION.sql`** - Run this to verify success
3. **`BUNDLE_ERROR_FIX_GUIDE.md`** - This file (reference guide)

---

**Status:** 🔧 READY TO FIX  
**Estimated Time:** 5 minutes  
**Difficulty:** Easy (just copy-paste SQL)

**After running the migration, bundle creation should work perfectly!** ✅

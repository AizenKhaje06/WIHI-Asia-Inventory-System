# Supabase Setup for Bundles Feature

## ⚠️ IMPORTANT: Run This First!

Before you can create bundles, you need to create the database tables in Supabase.

---

## What Needs to Be Created

### 1. `bundles` Table
Stores bundle information:
- Bundle name, description, category, store
- Pricing (bundle price, cost, regular price, savings)
- Inventory (quantity, reorder level)
- Metadata (SKU, active status, timestamps)
- Display (image URL, badge)

### 2. `bundle_items` Table
Stores which items are in each bundle:
- Bundle ID (references bundles table)
- Item ID (references inventory table)
- Quantity of each item in the bundle

---

## How to Apply Migration

### Option 1: Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **Select Your Project**
   - Click on your project

3. **Open SQL Editor**
   - Left sidebar → SQL Editor
   - Or go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

4. **Create New Query**
   - Click "New query" button

5. **Copy Migration SQL**
   - Open file: `supabase/migrations/020_create_bundles_table.sql`
   - Copy ALL the content

6. **Paste and Run**
   - Paste into SQL Editor
   - Click "Run" button (or press Ctrl+Enter)

7. **Verify Success**
   - Should see: "Success. No rows returned"
   - Check Table Editor to see new tables

### Option 2: Supabase CLI (If Installed)

```bash
# Make sure you're in project directory
cd /path/to/your/project

# Run migration
supabase db push

# Or apply specific migration
supabase migration up
```

---

## Verification Steps

### 1. Check Tables Exist

Go to Supabase Dashboard → Table Editor

You should see:
- ✅ `bundles` table
- ✅ `bundle_items` table

### 2. Check `bundles` Table Structure

Columns should include:
```
- id (text, primary key)
- name (text, not null)
- description (text)
- category (text, not null)
- store (text, not null)
- sales_channel (text)
- bundle_price (numeric)
- bundle_cost (numeric)
- regular_price (numeric)
- savings (numeric)
- quantity (integer)
- reorder_level (integer)
- sku (text, unique)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
- image_url (text)
- badge (text)
```

### 3. Check `bundle_items` Table Structure

Columns should include:
```
- id (text, primary key)
- bundle_id (text, foreign key → bundles.id)
- item_id (text, foreign key → inventory.id)
- quantity (integer)
- created_at (timestamp)
```

### 4. Check Indexes

Should have these indexes:
```
- idx_bundles_store
- idx_bundles_category
- idx_bundles_active
- idx_bundles_sales_channel
- idx_bundle_items_bundle
- idx_bundle_items_item
```

### 5. Check RLS Policies

Both tables should have:
- ✅ RLS enabled
- ✅ Policy: "Allow all operations on bundles"
- ✅ Policy: "Allow all operations on bundle_items"

---

## What This Migration Does

### Creates Tables
```sql
CREATE TABLE bundles (...)
CREATE TABLE bundle_items (...)
```

### Creates Indexes
```sql
CREATE INDEX idx_bundles_store ON bundles(store);
CREATE INDEX idx_bundles_category ON bundles(category);
-- ... more indexes
```

### Enables Security
```sql
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_items ENABLE ROW LEVEL SECURITY;
```

### Creates Policies
```sql
CREATE POLICY "Allow all operations on bundles" ON bundles FOR ALL USING (true);
CREATE POLICY "Allow all operations on bundle_items" ON bundle_items FOR ALL USING (true);
```

---

## After Migration - Test

### 1. Check API Endpoint

Open browser console and run:
```javascript
fetch('/api/bundles')
  .then(r => r.json())
  .then(console.log)
```

Should return: `[]` (empty array, no bundles yet)

### 2. Try Creating Bundle

1. Go to Warehouse Dispatch (POS) page
2. Click "Quick Create Bundle"
3. Fill in all fields
4. Click "Create Bundle"
5. Should succeed!

---

## Troubleshooting

### Error: "relation 'bundles' does not exist"
**Solution**: Migration not applied yet. Run the SQL in Supabase Dashboard.

### Error: "permission denied for table bundles"
**Solution**: RLS policies not created. Re-run the migration SQL.

### Error: "foreign key constraint violation"
**Solution**: Make sure `inventory` table exists and has the items you're trying to add.

### Error: "duplicate key value violates unique constraint"
**Solution**: Bundle with that ID or SKU already exists. This shouldn't happen with auto-generated IDs.

---

## Migration SQL Location

```
File: supabase/migrations/020_create_bundles_table.sql
```

---

## Quick Steps Summary

```
1. Open Supabase Dashboard
   ↓
2. Go to SQL Editor
   ↓
3. Copy content from: supabase/migrations/020_create_bundles_table.sql
   ↓
4. Paste into SQL Editor
   ↓
5. Click "Run"
   ↓
6. Verify: Check Table Editor for new tables
   ↓
7. Done! ✅
```

---

## After Migration Complete

Then you can:
1. Restart dev server (`RESTART-DEV.cmd`)
2. Refresh browser
3. Create bundles!

---

## Need Help?

### Check Migration Status
```sql
-- Run this in SQL Editor to see if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('bundles', 'bundle_items');
```

Should return:
```
bundles
bundle_items
```

### Check RLS Status
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('bundles', 'bundle_items');
```

Should show `rowsecurity = true` for both tables.

---

**Status**: ⚠️ Migration Required
**Action**: Run migration SQL in Supabase Dashboard
**Time**: ~1 minute
**Difficulty**: Easy (copy & paste)

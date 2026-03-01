# Storage Room to Store Migration Guide

## Overview
This migration renames "Storage Room" to "Store" and adds Sales Channel functionality.

## Changes Summary

### Database Changes:
1. ✅ Rename `storage_rooms` table → `stores`
2. ✅ Rename `storage_rooms.name` column → `stores.store_name`
3. ✅ Add `stores.sales_channel` column
4. ✅ Rename `items.storage_room` column → `items.store`
5. ✅ Add `items.sales_channel` column
6. ✅ Add indexes for performance
7. ✅ Insert sample stores for each sales channel

### Sample Data Added:
- **Shopee**: Shopee Mall Store, Shopee Official Store
- **Lazada**: Lazada Flagship, Lazada Partner Store
- **Facebook**: Facebook Main Page, Facebook Marketplace
- **TikTok**: TikTok Shop
- **Physical Store**: Manila Branch, Quezon City Branch, Makati Branch

## How to Run Migration

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the contents of `012_rename_storage_to_store.sql`
5. Paste into the SQL editor
6. Click "Run" button
7. Verify success message

### Option 2: Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push
```

### Option 3: Manual Copy-Paste
1. Open `012_rename_storage_to_store.sql`
2. Copy all SQL commands
3. Run in your Supabase SQL editor

## Verification Steps

After running the migration, verify:

```sql
-- 1. Check stores table exists
SELECT * FROM stores LIMIT 5;

-- 2. Check stores has sales_channel column
SELECT store_name, sales_channel FROM stores;

-- 3. Check items table has new columns
SELECT name, store, sales_channel FROM items LIMIT 5;

-- 4. Count stores per sales channel
SELECT sales_channel, COUNT(*) as store_count 
FROM stores 
GROUP BY sales_channel;
```

Expected results:
- `stores` table exists with `store_name` and `sales_channel` columns
- `items` table has `store` and `sales_channel` columns
- Sample stores are inserted (10 stores across 5 channels)

## Rollback Instructions

If you need to undo this migration:

1. Open `012_rename_storage_to_store_ROLLBACK.sql`
2. Copy all SQL commands
3. Run in Supabase SQL editor
4. This will revert all changes back to "Storage Room"

⚠️ **WARNING**: Rollback will remove the `sales_channel` column and any data in it!

## Next Steps

After successful migration:
1. ✅ Update API endpoints (`/api/storage-rooms` → `/api/stores`)
2. ✅ Update frontend components (Add Product modal, Inventory table)
3. ✅ Update all pages that reference "Storage Room"
4. ✅ Test thoroughly before deploying to production

## Troubleshooting

### Error: "column already exists"
- The migration is idempotent (safe to run multiple times)
- It checks for existing columns before adding

### Error: "table does not exist"
- Make sure you're running this on the correct database
- Check if `storage_rooms` table exists first

### Data Loss Concerns
- This migration preserves all existing data
- It only renames columns and adds new ones
- Existing store names remain unchanged

## Support

If you encounter issues:
1. Check the error message in Supabase SQL editor
2. Verify your current table structure
3. Run verification queries above
4. Use rollback script if needed

---

**Migration Created**: March 1, 2026
**Version**: 012
**Status**: Ready to deploy

# Image Column Name Mismatch - FIXED ✅

## Problem Identified

You were absolutely right! The column name mismatch was causing the issue.

### **The Issue:**

**In `products_unified` view (OLD):**
```sql
image_url,  -- No alias, returns as snake_case "image_url"
```

**In code (`lib/supabase-db.ts`):**
```typescript
imageUrl: item.image_url || null,  // Trying to access snake_case
```

**But other columns had aliases:**
```sql
sales_channel as "salesChannel",  -- Has camelCase alias
cost_price as "costPrice",        -- Has camelCase alias
```

So the view was returning `image_url` (snake_case) but the code expected it to match the pattern of other columns.

## Solution Applied ✅

### 1. **Updated View Definition**

Changed `products_unified` view to use camelCase alias:

```sql
-- BEFORE (WRONG)
image_url,  -- No alias

-- AFTER (CORRECT)
image_url as "imageUrl",  -- Now has camelCase alias like other columns
```

### 2. **Updated Code**

Changed `lib/supabase-db.ts` to use camelCase:

```typescript
// BEFORE (WRONG)
imageUrl: item.image_url || null,

// AFTER (CORRECT)
imageUrl: item.imageUrl || null,  // Now matches view alias
```

### 3. **Also Fixed Bundles**

Bundles now support images too:

```sql
-- BEFORE
NULL::text as image_url,  -- Bundles had no images

// AFTER
image_url as "imageUrl",  -- Bundles can now have images
```

## Files Modified

1. ✅ `supabase/migrations/030_add_image_url_to_products_unified.sql` - Updated view definition
2. ✅ `supabase/migrations/048_fix_image_url_column_alias.sql` - New migration file
3. ✅ `lib/supabase-db.ts` - Updated code to use camelCase
4. ✅ `FIX_IMAGE_COLUMN_NOW.sql` - Immediate fix script

## How to Apply the Fix

### **Step 1: Run SQL in Supabase**

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `FIX_IMAGE_COLUMN_NOW.sql`
3. Click "Run"
4. Verify the output shows the updated view

### **Step 2: Restart Dev Server**

```bash
# Stop the dev server (Ctrl+C)
# Then restart
npm run dev
```

### **Step 3: Clear Browser Cache**

1. Visit: `http://localhost:3000/clear-cache.html`
2. Click "Clear Cache & Reload"
3. Or press `Ctrl + Shift + R`

### **Step 4: Test**

1. Go to Inventory/Products page
2. Images should now display for products that have `image_url` in database
3. Check browser console - should see `[Inventory] Image loaded:` messages

## Why This Happened

The `products_unified` view was created with inconsistent column naming:
- Most columns: `snake_case as "camelCase"` ✅
- Image column: `image_url` (no alias) ❌

This caused the JavaScript code to receive `image_url` (snake_case) from the database, but the mapping expected `imageUrl` (camelCase) to match the pattern.

## Verification

After applying the fix, run this query in Supabase:

```sql
-- Check column names (should show camelCase)
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'products_unified'
ORDER BY ordinal_position;

-- Should show: imageUrl (not image_url)
```

## Expected Results

After the fix:
- ✅ View returns `imageUrl` (camelCase)
- ✅ Code expects `imageUrl` (camelCase)
- ✅ Consistent with other columns (`salesChannel`, `costPrice`, etc.)
- ✅ Images will display for products with image URLs in database

## Note

You still need to upload images to Supabase Storage and update the database with URLs. But now the column name mapping is correct, so images will display once you add them.

## Summary

**Root Cause:** Column name mismatch between view (`image_url`) and code expectation (`imageUrl`)

**Solution:** Added camelCase alias to view definition to match other columns

**Status:** ✅ FIXED - Ready to test after running SQL migration

**Next Steps:**
1. Run `FIX_IMAGE_COLUMN_NOW.sql` in Supabase
2. Restart dev server
3. Clear browser cache
4. Upload product images to Supabase Storage
5. Update database with image URLs
6. Verify images display correctly

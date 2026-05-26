# Debug Image Display Issue

## Current Status
- ✅ Image uploads successfully (shows "Image uploaded successfully" toast)
- ❌ Image doesn't display (shows broken image or alt text "LIPOCOLLA")
- ✅ SQL migration completed
- ✅ Storage bucket created
- ✅ Storage policies active

## Debugging Steps

### Step 1: Check Browser Console
1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Look for these messages:
   - `[Upload] Generated public URL:` - Shows the image URL
   - `[Inventory] Items with images:` - Shows items with image URLs
   - `[Image Error] Failed to load:` - Shows failed image loads
   - `[Image Success] Loaded:` - Shows successful image loads

### Step 2: Check Network Tab
1. Press **F12** → **Network** tab
2. Filter by **Img**
3. Try to load the page with the product
4. Look for failed image requests (red status)
5. Click on the failed request to see:
   - Request URL
   - Status code (404, 403, etc.)
   - Response

### Step 3: Verify Bucket Configuration
Go to Supabase Dashboard → Storage → product-images:

**Check these settings:**
- ✅ Bucket name: `product-images` (exact match)
- ✅ Public bucket: **YES** (must be enabled)
- ✅ Files exist in `products/` folder

**Run this SQL to verify:**
```sql
-- Check bucket configuration
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'product-images';
```

Expected result: `public = true`

### Step 4: Check Image URL Format
The correct URL format should be:
```
https://[your-project-id].supabase.co/storage/v1/object/public/product-images/products/[filename].webp
```

**Example:**
```
https://abcdefghijk.supabase.co/storage/v1/object/public/product-images/products/1234567890-1234567890.webp
```

### Step 5: Test Direct Image Access
1. Copy the image URL from console
2. Paste it in a new browser tab
3. Try to access it directly

**If you get:**
- ✅ **Image displays** → URL is correct, issue is in the app
- ❌ **404 Not Found** → File doesn't exist in storage
- ❌ **403 Forbidden** → Bucket is not public or policies are wrong
- ❌ **CORS error** → CORS configuration issue

### Step 6: Verify Database Column
Run this SQL to check if image_url is saved:
```sql
SELECT id, name, image_url 
FROM inventory 
WHERE image_url IS NOT NULL 
LIMIT 5;
```

Expected result: Should show products with image URLs

### Step 7: Check products_unified View
Run this SQL to verify the view includes image_url:
```sql
SELECT id, name, image_url, "productType"
FROM products_unified 
WHERE image_url IS NOT NULL 
LIMIT 5;
```

Expected result: Should show products with image URLs

## Common Issues & Solutions

### Issue 1: Bucket Not Public
**Symptom:** 403 Forbidden error
**Solution:**
```sql
UPDATE storage.buckets 
SET public = true 
WHERE id = 'product-images';
```

### Issue 2: Wrong Bucket Name
**Symptom:** 404 Not Found error
**Solution:** Verify bucket name is exactly `product-images` (with hyphen, not underscore)

### Issue 3: CORS Issue
**Symptom:** CORS error in console
**Solution:** 
1. Go to Supabase Dashboard → Storage → product-images → Configuration
2. Add your domain to allowed origins
3. Or enable "Allow all origins" for testing

### Issue 4: View Not Updated
**Symptom:** imageUrl is null in API response
**Solution:** Run the view update SQL again:
```sql
DROP VIEW IF EXISTS products_unified;

CREATE VIEW products_unified AS
SELECT 
    id, name, 'regular' as "productType", category, store,
    sales_channel as "salesChannel", quantity,
    cost_price as "costPrice", selling_price as "sellingPrice",
    reorder_level as "reorderLevel", last_updated as "lastUpdated",
    sku, image_url,  -- IMPORTANT: Include this
    NULL::decimal as "bundleCost", NULL::decimal as "regularPrice",
    NULL::decimal as savings, NULL::text as badge
FROM inventory
UNION ALL
SELECT 
    id, name, 'bundle' as "productType", 'Bundles' as category, store,
    sales_channel as "salesChannel", quantity,
    bundle_cost as "costPrice", bundle_price as "sellingPrice",
    reorder_level as "reorderLevel", updated_at as "lastUpdated",
    NULL::text as sku, NULL::text as image_url,
    bundle_cost as "bundleCost", regular_price as "regularPrice",
    savings, badge
FROM bundles WHERE is_active = true;

GRANT SELECT ON products_unified TO authenticated, anon;
```

### Issue 5: File Not Uploaded
**Symptom:** URL exists but 404 error
**Solution:** 
1. Check Supabase Storage → product-images → products folder
2. Verify file exists
3. Try uploading again

## Next Steps

1. **Open browser console (F12)**
2. **Refresh the inventory page**
3. **Look for the debug messages**
4. **Share the console output** (screenshot or copy text)
5. **Check Network tab** for failed image requests
6. **Try accessing image URL directly** in browser

## Expected Console Output

When everything works correctly, you should see:
```
[Upload] Generated public URL: https://xxx.supabase.co/storage/v1/object/public/product-images/products/xxx.webp
[Upload] File path: products/xxx.webp
[Inventory] Items with images: [{name: "LIPOCOLLA", imageUrl: "https://..."}]
[Image Success] Loaded: https://xxx.supabase.co/storage/v1/object/public/product-images/products/xxx.webp
```

If you see errors, share them so I can help fix the issue!

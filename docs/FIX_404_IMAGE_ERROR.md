# Fix 404 Image Error

## Problem
Image upload returns success but image fails to load with **404 Not Found** error:
```
https://rsvzbmhuckwndvqfhzml.supabase.co/storage/v1/object/public/product-images/products/1779805822090-1779805822090.webp
```

## Root Cause
The file is **NOT actually being uploaded** to Supabase Storage, even though the API returns success. This happens when:
1. ❌ Storage bucket doesn't exist
2. ❌ Storage bucket is private (not public)
3. ❌ Service role key doesn't have permission
4. ❌ Bucket name mismatch

## Solution

### Step 1: Verify Bucket Exists
1. Go to **Supabase Dashboard** → **Storage**
2. Look for bucket named **`product-images`** (exact name, with hyphen)
3. If it doesn't exist, create it:
   - Click **"New Bucket"**
   - Name: `product-images`
   - Public: **YES** ✅ (CRITICAL!)
   - Click **"Create"**

### Step 2: Verify Bucket is Public
Run this SQL in Supabase SQL Editor:
```sql
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'product-images';
```

**Expected result:**
- `id`: product-images
- `public`: **true** ✅

**If public = false, run this:**
```sql
UPDATE storage.buckets 
SET public = true 
WHERE id = 'product-images';
```

### Step 3: Verify Storage Policies
Run this SQL:
```sql
SELECT policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%product%';
```

**Expected result:** 4 policies
1. Public read product images (SELECT, {public})
2. Authenticated users can upload (INSERT, {authenticated})
3. Authenticated users can update (UPDATE, {authenticated})
4. Authenticated users can delete (DELETE, {authenticated})

**If policies are missing, run the policies from `ADD_PRODUCT_IMAGE.sql`**

### Step 4: Test Upload Again
1. **Restart your dev server** (Ctrl+C, then `npm run dev`)
2. Go to **Dashboard** → **Products/Inventory**
3. Click **"Add Product"**
4. Upload a test image
5. **Check server console** (terminal where `npm run dev` is running)
6. Look for these messages:
   ```
   [Upload] Attempting upload to bucket: product-images
   [Upload] File path: products/xxx.webp
   [Upload] Upload successful: {...}
   [Upload] ✅ File verified in storage: xxx.webp
   ```

### Step 5: Verify File in Storage
1. Go to **Supabase Dashboard** → **Storage** → **product-images**
2. Open **products** folder
3. You should see the uploaded file (e.g., `1779805822090-1779805822090.webp`)
4. Click on the file to see its public URL
5. Copy the URL and paste it in a new browser tab
6. **The image should display** ✅

## Common Issues

### Issue 1: Bucket Doesn't Exist
**Error:** `Bucket not found`
**Solution:** Create the bucket manually in Supabase Dashboard

### Issue 2: Bucket is Private
**Error:** 404 or 403 when accessing image URL
**Solution:** 
```sql
UPDATE storage.buckets SET public = true WHERE id = 'product-images';
```

### Issue 3: Wrong Bucket Name
**Error:** `Bucket not found`
**Solution:** Verify bucket name is exactly `product-images` (not `product_images` or `productimages`)

### Issue 4: Service Role Key Missing
**Error:** `Insufficient permissions`
**Solution:** Verify `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`

### Issue 5: Policies Not Set
**Error:** 403 Forbidden
**Solution:** Run the policy SQL from `ADD_PRODUCT_IMAGE.sql`

## Debugging Checklist

- [ ] Bucket `product-images` exists in Supabase Storage
- [ ] Bucket is **public** (not private)
- [ ] 4 storage policies are active
- [ ] `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Dev server restarted after changes
- [ ] Browser console shows `[Upload] ✅ File verified in storage`
- [ ] File exists in Storage → product-images → products folder
- [ ] Image URL works when accessed directly in browser

## Next Steps

1. **Run `VERIFY_STORAGE_BUCKET.sql`** to check bucket configuration
2. **Restart dev server** after any changes
3. **Try uploading again** and check server console
4. **Share server console output** if still failing

## Expected Server Console Output (Success)

```
[Upload] Attempting upload to bucket: product-images
[Upload] File path: products/1779805822090-1779805822090.webp
[Upload] File size: 245678 bytes
[Upload] Content type: image/webp
[Upload] Upload successful: { path: 'products/1779805822090-1779805822090.webp' }
[Upload] Generated public URL: https://xxx.supabase.co/storage/v1/object/public/product-images/products/1779805822090-1779805822090.webp
[Upload] Files in products folder: 1
[Upload] ✅ File verified in storage: 1779805822090-1779805822090.webp
```

If you see `❌ File NOT found in storage after upload!`, the upload is failing silently.

# How to Add Product Images

## Current Status
- Most products have `NULL` image_url in database
- Only 2-3 products have Supabase Storage URLs
- Code is working correctly, just missing image data

## Steps to Add Images

### Method 1: Upload via Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Storage**
   - Click "Storage" in left sidebar
   - Click "product-images" bucket

3. **Upload Images**
   - Click "Upload file" button
   - Select your product images
   - Images will be uploaded to: `product-images/products/`

4. **Get Image URLs**
   - After upload, click on each image
   - Copy the public URL
   - Format: `https://rsvzbmhuckwndvqfhzml.supabase.co/storage/v1/object/public/product-images/products/[filename]`

5. **Update Database**
   ```sql
   -- Update specific product
   UPDATE inventory
   SET image_url = 'https://rsvzbmhuckwndvqfhzml.supabase.co/storage/v1/object/public/product-images/products/lipocolla.webp'
   WHERE name = 'LIPOCOLLA';
   
   -- Verify
   SELECT name, image_url FROM inventory WHERE name = 'LIPOCOLLA';
   ```

### Method 2: Upload via Admin Panel (If Available)

1. Go to Admin → Product Edit page
2. Select a product
3. Click "Upload Image" button
4. Select image file
5. Save

### Method 3: Bulk Upload via SQL

If you already have images in Supabase Storage:

```sql
-- Update multiple products at once
UPDATE inventory SET image_url = 'https://rsvzbmhuckwndvqfhzml.supabase.co/storage/v1/object/public/product-images/products/lipocolla.webp' WHERE name = 'LIPOCOLLA';
UPDATE inventory SET image_url = 'https://rsvzbmhuckwndvqfhzml.supabase.co/storage/v1/object/public/product-images/products/pep-massage.webp' WHERE name = 'PEP MASSAGE NADI';
UPDATE inventory SET image_url = 'https://rsvzbmhuckwndvqfhzml.supabase.co/storage/v1/object/public/product-images/products/freshies.webp' WHERE name = 'FRESHIES';

-- Verify all products with images
SELECT name, image_url FROM inventory WHERE image_url IS NOT NULL;
```

## Image Requirements

- **Format:** .webp, .jpg, .png (webp recommended for smaller file size)
- **Size:** Max 2MB per image
- **Dimensions:** 500x500px recommended (square)
- **Naming:** Use product ID or clean product name (e.g., `lipocolla.webp`)

## Testing After Upload

1. **Clear browser cache** (important!)
   - Visit: http://localhost:3000/clear-cache.html
   - Click "Clear Cache & Reload"

2. **Check Inventory Page**
   - Go to Inventory/Products page
   - Images should now display

3. **Check Internal Usage Modal**
   - Click "Dispatch Items"
   - Images should display in product table

## Troubleshooting

### Images still not showing?

1. **Check database:**
   ```sql
   SELECT name, image_url FROM inventory WHERE name = 'LIPOCOLLA';
   ```
   Should return full Supabase URL, not NULL

2. **Check Supabase Storage:**
   - Go to Storage → product-images
   - Verify file exists
   - Check if file is public (not private)

3. **Check browser console:**
   - Press F12 → Console tab
   - Look for image load errors
   - Should see: `[Inventory] Image loaded: LIPOCOLLA, https://...`

4. **Test image URL directly:**
   - Copy the image_url from database
   - Paste in browser address bar
   - Should display the image
   - If 404 error, file doesn't exist in Storage

## Quick Test

To test if everything works, update ONE product first:

```sql
-- Use one of the existing Supabase URLs from your database
UPDATE inventory 
SET image_url = 'https://rsvzbmhuckwndvqfhzml.supabase.co/storage/v1/object/public/product-images/products/I779908145858-I779908145858.webp'
WHERE name = 'LIPOCOLLA';
```

Then:
1. Clear cache: http://localhost:3000/clear-cache.html
2. Go to Inventory page
3. Find LIPOCOLLA product
4. Image should display

If this works, repeat for all other products!

## Summary

**The issue is NOT with the code** - it's simply that most products don't have image_url values in the database. Once you upload images to Supabase Storage and update the database with the URLs, everything will work perfectly.

**Current Status:**
- ✅ Code works correctly
- ✅ Service worker fixed
- ✅ API returns correct data
- ❌ **Need to upload images and update database**

**Next Steps:**
1. Upload product images to Supabase Storage
2. Update database with image URLs
3. Clear browser cache
4. Verify images display correctly

# Product Image Upload - Complete Setup Guide

## ❌ CURRENT ISSUE
You're seeing a broken image icon because the database column and storage bucket haven't been set up yet.

## ✅ SOLUTION - Follow These Steps

### **STEP 1: Run SQL Migration**

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy the entire content from `ADD_PRODUCT_IMAGE.sql`
3. Click **"Run"** to execute
4. Expected result: ✅ Success message

**What this does:**
- Adds `image_url` column to `inventory` table
- Creates storage policies for public access

---

### **STEP 2: Create Storage Bucket**

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New Bucket"**
3. Fill in these details:
   - **Bucket name**: `product-images`
   - **Public bucket**: ✅ **YES** (CRITICAL!)
   - **File size limit**: 2MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
4. Click **"Create bucket"**

**Why public?**
- Product images need to be accessible without authentication
- This allows images to display on the inventory page

---

### **STEP 3: Verify Setup**

Run this SQL query in Supabase SQL Editor to verify:

```sql
-- Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'inventory' AND column_name = 'image_url';

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'product-images';

-- Check if policies exist
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%product images%';
```

Expected results:
- ✅ `image_url` column found (type: text)
- ✅ `product-images` bucket found (public: true)
- ✅ 4 policies found (SELECT, INSERT, UPDATE, DELETE)

---

### **STEP 4: Test Image Upload**

1. Go to **Dashboard** → **Products/Inventory**
2. Click **"Add Product"**
3. Upload a test image (JPG, PNG, or WebP)
4. Fill in product details
5. Click **"Add Product"**
6. **Expected result**: Image should display in the product card

---

## 🔧 TROUBLESHOOTING

### Issue: Image still not displaying after setup

**Check 1: Verify bucket is public**
```sql
SELECT id, public FROM storage.buckets WHERE id = 'product-images';
```
- Should return: `public = true`
- If false, run: `UPDATE storage.buckets SET public = true WHERE id = 'product-images';`

**Check 2: Verify image URL format**
- Open browser DevTools (F12) → Console
- Look for image URL errors
- Correct format: `https://[your-project].supabase.co/storage/v1/object/public/product-images/products/[filename].webp`

**Check 3: Verify CORS settings**
- Go to Supabase Dashboard → Storage → product-images → Configuration
- Ensure CORS is enabled for your domain

**Check 4: Check browser console for errors**
- Press F12 → Console tab
- Look for 404 errors or CORS errors
- Share the error message if you see any

---

## 📊 STORAGE LIMITS (Free Tier)

- **Storage**: 1GB total
- **Bandwidth**: 2GB/month
- **With compression**: ~500-1000 products (avg 300KB per image)

**Auto-compression settings:**
- Max file size: 300KB
- Max dimensions: 800px
- Format: WebP (best compression)

---

## 🎯 NEXT STEPS AFTER SETUP

1. ✅ Run SQL migration
2. ✅ Create storage bucket
3. ✅ Verify setup with SQL queries
4. ✅ Test upload with a sample product
5. ✅ Check if image displays correctly

---

## 💡 TIPS

- **Image upload is optional** - products without images work fine
- **Compression is automatic** - no need to resize images manually
- **WebP format** - automatically converted for best compression
- **Drag & drop** - you can drag images directly into the upload area
- **Change image** - hover over existing image and click "Change"
- **Remove image** - click the red X button on the image

---

## ❓ COMMON QUESTIONS

**Q: Do I need to upload images for all products?**
A: No, it's optional. Products without images will just show the product name and details.

**Q: What happens if I exceed the 1GB limit?**
A: You'll need to upgrade to Supabase Pro ($25/month) or delete old images.

**Q: Can I upload images in bulk?**
A: Currently, images are uploaded one at a time when adding/editing products.

**Q: What image formats are supported?**
A: JPG, PNG, and WebP. All images are auto-converted to WebP for best compression.

**Q: Can I change the image later?**
A: Yes! Edit the product and upload a new image. The old image will be replaced.

---

## 📞 NEED HELP?

If you encounter any issues:
1. Check browser console (F12) for error messages
2. Verify all setup steps were completed
3. Share the error message for specific troubleshooting

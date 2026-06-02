# Profile Image Feature - Final Fix Instructions

## Issues Fixed

### ✅ Issue 1: Images Going to Wrong Folder
**Problem:** Profile images were being saved to `products/` folder instead of `profiles/` folder

**Solution:**
- Created new API endpoint: `/api/upload-profile/route.ts`
- Updated `ImageUpload` component to support `uploadType` prop
- Updated all profile image uploads in settings page to use `uploadType="profile"`

**Result:** Profile images now save to `product-images/profiles/` folder

---

### ⚠️ Issue 2: Profile Images Not Saving to Database
**Problem:** Users table doesn't have `profile_image` column yet

**Solution:** Run the database migration

---

## STEP 1: Run Database Migration ⚠️ REQUIRED

Open **Supabase SQL Editor** and run this SQL:

```sql
-- Add profile_image column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Add comment
COMMENT ON COLUMN users.profile_image IS 'URL to user profile image stored in Supabase Storage';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'profile_image';
```

**Expected Result:**
```
column_name    | data_type | is_nullable
---------------|-----------|------------
profile_image  | text      | YES
```

---

## STEP 2: Test Profile Image Upload

### Test Create New User
1. Login as **Admin** (Azan06, Azarjhake06, or Azar03)
2. Go to **Settings** → **Users** tab
3. Click **"Add User"**
4. Fill in:
   - Username: `test-user`
   - Display Name: `Test User`
   - Password: `test123`
   - Role: `Operations Staff`
   - Channel: `Lazada`
5. **Upload Profile Image:**
   - Click "Upload Image"
   - Select any image file
   - Wait for compression and upload
6. Click **"Create User"**

**Expected Results:**
- ✅ User created successfully
- ✅ Profile image appears in user list (circular avatar)
- ✅ Image saved to Supabase Storage: `product-images/profiles/profile-test-user-[timestamp].webp`
- ✅ Image URL saved to database: `users.profile_image` column

### Test Edit Existing User
1. In **Settings** → **Users** tab
2. Click **Edit** button on any user (e.g., Lazada-Carlo)
3. **Upload or change profile image**
4. Click **"Save"**

**Expected Results:**
- ✅ Profile image updates in user list
- ✅ New image saved to `product-images/profiles/` folder
- ✅ Database updated with new image URL

### Test Header Display
1. **Logout** from Admin account
2. **Login** with the account that has a profile image (e.g., test-user or Lazada-Carlo)
3. Check **top-right corner** of header

**Expected Results:**
- ✅ Profile picture appears in circular avatar (32x32px)
- ✅ Clicking it opens dropdown with name, role, logout
- ✅ If no image: gradient fallback with user icon

---

## STEP 3: Verify Supabase Storage

### Check Storage Structure
1. Open **Supabase Dashboard**
2. Go to **Storage** → **product-images** bucket
3. Look for **`profiles/`** folder

**Expected Structure:**
```
product-images/
├── products/
│   ├── [product images...]
└── profiles/
    ├── profile-test-user-1234567890-abc123.webp
    ├── profile-Lazada-Carlo-1234567891-def456.webp
    └── [other profile images...]
```

### Check Database
1. Open **Supabase Dashboard**
2. Go to **Table Editor** → **users** table
3. Check `profile_image` column

**Expected Data:**
```
username       | profile_image
---------------|----------------------------------------------------------
test-user      | https://[your-supabase].supabase.co/storage/v1/object/public/product-images/profiles/profile-test-user-...webp
Lazada-Carlo   | https://[your-supabase].supabase.co/storage/v1/object/public/product-images/profiles/profile-Lazada-Carlo-...webp
```

---

## Files Modified

### New Files
- ✅ `app/api/upload-profile/route.ts` - New upload endpoint for profile images

### Updated Files
- ✅ `components/ui/image-upload.tsx` - Added `uploadType` prop support
- ✅ `app/dashboard/settings/page.tsx` - All ImageUpload instances now use `uploadType="profile"`
- ✅ `app/api/accounts/route.ts` - Returns and saves `profileImage`
- ✅ `app/api/admin/staff/route.ts` - Accepts `profileImage` when creating users
- ✅ `components/premium-navbar.tsx` - Displays profile picture in header
- ✅ `app/page.tsx` - Stores `profileImage` in localStorage on login

### Migration File
- ✅ `supabase/migrations/042_add_profile_image_to_users.sql` - Ready to run

---

## Troubleshooting

### Problem: Images still going to products folder
**Solution:** Make sure you've refreshed the page after the code changes. The `uploadType="profile"` prop should now be on all ImageUpload components.

### Problem: Profile image not saving to database
**Solution:** Run the migration SQL in Step 1. The `profile_image` column must exist.

### Problem: Profile image not showing in header
**Solution:** 
1. Logout and login again to refresh localStorage
2. Check if `profileImage` is in localStorage: Open DevTools → Application → Local Storage → check for `profileImage` key

### Problem: Upload fails with 500 error
**Solution:** Check Supabase Storage permissions. The `product-images` bucket should allow public access for uploads.

---

## Summary

✅ **Code changes complete**
✅ **Upload endpoint created** (`/api/upload-profile`)
✅ **ImageUpload component updated** (supports `uploadType`)
✅ **Settings page updated** (all uploads use `uploadType="profile"`)
⚠️ **Database migration pending** (Run Step 1)

**Next Action:** Run the database migration in Step 1, then test!

# Product Images vs Profile Images - Complete Comparison

## ✅ PRODUCT IMAGES (WORKING)

### Database
- **Table**: `inventory` / `products_unified` view
- **Column**: `image_url` (snake_case)
- **Type**: TEXT
- **Nullable**: YES

### Supabase Storage
- **Bucket**: `product-images`
- **Folder**: `products/`
- **Files**: `product-{timestamp}-{random}.webp`

### Code Mapping (`lib/supabase-db.ts`)
```typescript
// getInventoryItems() - Line 58
imageUrl: item.image_url || null,
```

### API Response (`/api/items`)
```json
{
  "id": "ITEM-123",
  "name": "Product Name",
  "imageUrl": "https://...supabase.co/.../products/product-123.webp"
}
```

### Frontend Display
```typescript
{item.imageUrl ? (
  <img src={`/api/image-proxy?url=${encodeURIComponent(item.imageUrl)}`} />
) : (
  <ImageIcon /> // Fallback
)}
```

---

## ✅ PROFILE IMAGES (NOW FIXED)

### Database
- **Table**: `users`
- **Column**: `profile_image` (snake_case) ✅
- **Type**: TEXT
- **Nullable**: YES

### Supabase Storage
- **Bucket**: `employee-profiles` ✅
- **Folder**: Root (no subfolder)
- **Files**: `profile-{username}-{timestamp}-{random}.webp`

### Code Mapping (`lib/supabase-db.ts`)
```typescript
// getAccounts() - Line 591 ✅ FIXED
profileImage: row.profile_image || null,

// getAccountByUsername() - Line 632 ✅ FIXED
profileImage: data.profile_image || null,
```

### API Response (`/api/accounts`)
```json
{
  "id": "uuid",
  "username": "Lazada-Carlo",
  "profileImage": "https://...supabase.co/.../employee-profiles/profile-Lazada-Carlo-123.webp"
}
```

### Frontend Display
```typescript
{account.profileImage ? (
  <img src={account.profileImage} className="h-8 w-8 rounded-full" />
) : (
  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
    <User className="h-4 w-4 text-white" />
  </div>
)}
```

---

## FIXES APPLIED

### 1. ✅ Database Column
```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_image TEXT;
```

### 2. ✅ Storage Bucket
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-profiles', 'employee-profiles', true);
```

### 3. ✅ Code Mapping - getAccounts()
```typescript
// BEFORE (MISSING)
return (data || []).map(row => ({
  ...
  assignedChannel: row.assigned_channel,
  createdAt: row.created_at,
}))

// AFTER (FIXED)
return (data || []).map(row => ({
  ...
  assignedChannel: row.assigned_channel,
  profileImage: row.profile_image || null,  // ✅ ADDED
  createdAt: row.created_at,
}))
```

### 4. ✅ Code Mapping - getAccountByUsername()
```typescript
// BEFORE (MISSING)
return {
  ...
  assignedChannel: data.assigned_channel,
  createdAt: data.created_at,
}

// AFTER (FIXED)
return {
  ...
  assignedChannel: data.assigned_channel,
  profileImage: data.profile_image || null,  // ✅ ADDED
  createdAt: data.created_at,
}
```

### 5. ✅ Upload API
- Created `/api/upload-profile/route.ts`
- Uploads to `employee-profiles` bucket
- Generates unique filenames: `profile-{username}-{timestamp}-{random}.webp`

### 6. ✅ ImageUpload Component
- Added `uploadType` prop
- `uploadType="product"` → `/api/upload` → `product-images/products/`
- `uploadType="profile"` → `/api/upload-profile` → `employee-profiles/`

---

## TESTING CHECKLIST

### ✅ Database
- [ ] Run migration: `ALTER TABLE users ADD COLUMN profile_image TEXT`
- [ ] Verify column exists: Check users table in Supabase

### ✅ Storage
- [ ] Run bucket creation SQL
- [ ] Verify `employee-profiles` bucket exists
- [ ] Check bucket is public
- [ ] Verify storage policies are set

### ✅ Code
- [x] `getAccounts()` maps `profileImage` ✅
- [x] `getAccountByUsername()` maps `profileImage` ✅
- [x] `/api/accounts` returns `profileImage` ✅
- [x] `/api/upload-profile` saves to correct bucket ✅
- [x] ImageUpload component uses `uploadType="profile"` ✅

### ✅ Frontend
- [ ] Refresh browser (Ctrl+Shift+R)
- [ ] Upload profile image for test user
- [ ] Verify image appears in user list
- [ ] Verify image appears in header dropdown
- [ ] Check Supabase Storage for uploaded file

---

## NEXT STEPS

1. **Refresh browser** - Clear cache and reload
2. **Re-upload profile images** - Previous uploads won't work (column didn't exist)
3. **Test with new user** - Create new user with profile image
4. **Verify in Supabase** - Check `users.profile_image` column has URL
5. **Check Storage** - Verify file in `employee-profiles` bucket

---

## SUMMARY

✅ **Database column added** - `users.profile_image`
✅ **Storage bucket created** - `employee-profiles`
✅ **Code mapping fixed** - Both `getAccounts()` and `getAccountByUsername()`
✅ **Upload API created** - `/api/upload-profile`
✅ **Component updated** - ImageUpload supports `uploadType`

**Status**: Ready to test! 🎯

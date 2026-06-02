# Create Employee Profiles Bucket - Instructions

## Step 1: Create New Bucket in Supabase

1. Open **Supabase Dashboard**
2. Go to **Storage** (left sidebar)
3. Click **"New bucket"** button (top right)
4. Fill in the form:
   - **Name**: `employee-profiles`
   - **Public bucket**: ✅ **CHECK THIS** (important!)
   - **File size limit**: Leave default or set to 1 MB
   - **Allowed MIME types**: Leave empty (allows all image types)
5. Click **"Create bucket"**

## Step 2: Set Bucket Policies (Important!)

After creating the bucket, you need to set up policies so users can upload:

1. In **Storage**, click on the `employee-profiles` bucket
2. Click **"Policies"** tab
3. Click **"New Policy"**
4. Choose **"For full customization"**
5. Add these 3 policies:

### Policy 1: Allow Public Read (SELECT)
```sql
-- Policy name: Public read access
-- Operation: SELECT
-- Policy definition:
true
```

### Policy 2: Allow Authenticated Upload (INSERT)
```sql
-- Policy name: Authenticated users can upload
-- Operation: INSERT
-- Policy definition:
auth.role() = 'authenticated'
```

### Policy 3: Allow Authenticated Update (UPDATE)
```sql
-- Policy name: Authenticated users can update
-- Operation: UPDATE
-- Policy definition:
auth.role() = 'authenticated'
```

## Step 3: Test the Upload

1. **Refresh your browser** (Ctrl+Shift+R)
2. Go to **Settings** → **Users** tab
3. **Edit any user** and upload a profile image
4. Check **Supabase Storage** → **employee-profiles** bucket
5. You should see the uploaded image there!

## Expected Result

### Before (Old Structure):
```
product-images/
├── products/
│   └── [product images]
└── profiles/
    └── [employee images] ← OLD LOCATION
```

### After (New Structure):
```
product-images/
└── products/
    └── [product images only]

employee-profiles/  ← NEW BUCKET
└── profile-Aizen03-1234567890-abc123.webp
└── profile-Lazada-Carlo-1234567891-def456.webp
└── [other employee profile images]
```

## Troubleshooting

### Error: "Bucket not found"
**Solution:** Make sure you created the bucket with exact name: `employee-profiles`

### Error: "Permission denied" or "403 Forbidden"
**Solution:** Set up the bucket policies (Step 2 above)

### Images not showing after upload
**Solution:** 
1. Make sure bucket is **Public** (check bucket settings)
2. Verify policies are set correctly
3. Hard refresh browser (Ctrl+Shift+R)

## File Naming Convention

Employee profile images will be named:
```
profile-{username}-{timestamp}-{random}.webp
```

Examples:
- `profile-Aizen03-1717123456789-abc123.webp`
- `profile-Lazada-Carlo-1717123456790-def456.webp`
- `profile-logistics-admin-1717123456791-ghi789.webp`

## Summary

✅ **Code updated** - Upload API now uses `employee-profiles` bucket
⚠️ **Action required** - Create the bucket in Supabase (Steps 1-2)
✅ **Ready to test** - After creating bucket, upload will work automatically

---

**Note:** Old images in `product-images/profiles/` folder will still work, but new uploads will go to the new `employee-profiles` bucket.

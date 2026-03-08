# BUNDLE CACHE FIX - FINAL SOLUTION

## What We Fixed
✅ Deleted `app/api/bundles/[id]/route.ts` (was importing old bundle-utils)
✅ All old bundle-utils imports removed
✅ No more lib/bundle-utils.ts
✅ No more lib/types/bundle.ts
✅ Clean create-bundle-dialog.tsx with new fields

## The Problem
Next.js/Turbopack is caching the OLD code even though files are deleted. The error shows it's still trying to import from `@/lib/bundle-utils` which doesn't exist anymore.

## SOLUTION - Follow These Steps EXACTLY:

### Step 1: Stop Dev Server
```cmd
Ctrl + C
```
Press it multiple times to make sure it's fully stopped.

### Step 2: Run Nuclear Cache Clear
```cmd
NUCLEAR-CACHE-CLEAR.cmd
```

### Step 3: Manual Verification (IMPORTANT!)
Open File Explorer and verify these files DO NOT EXIST:
- ❌ `lib/bundle-utils.ts` - should be GONE
- ❌ `lib/types/bundle.ts` - should be GONE  
- ❌ `app/api/bundles/[id]/route.ts` - should be GONE
- ❌ `components/create-bundle-modal.tsx` - should be GONE

If any of these files still exist, DELETE THEM MANUALLY in File Explorer!

### Step 4: Restart Dev Server
```cmd
npm run dev
```

### Step 5: Hard Refresh Browser
- Press `Ctrl + Shift + R` (Windows)
- Or `Ctrl + F5`
- Or open DevTools (F12) → Right-click refresh button → "Empty Cache and Hard Reload"

### Step 6: Test Bundle Creation
1. Go to Inventory page
2. Click "Create Bundle"
3. Fill in:
   - Bundle Name
   - Sales Channel (select one)
   - Store (should filter based on channel)
   - Bundle Price
   - Add at least 1 item
4. Click "Create Bundle"

## If Still Not Working

### Option A: Force Vercel Redeploy
Since your GitHub is connected to Vercel:

1. Make a small change to trigger redeploy:
```cmd
echo. >> README.md
git add .
git commit -m "Force redeploy - clear cache"
git push
```

2. Go to Vercel Dashboard
3. Find your deployment
4. Click "..." menu → "Redeploy"
5. Check "Clear Build Cache"
6. Click "Redeploy"

### Option B: Complete Fresh Start
```cmd
# Stop server
Ctrl + C

# Delete everything
rmdir /s /q .next
rmdir /s /q node_modules
del package-lock.json

# Reinstall
npm install

# Start fresh
npm run dev
```

## What Changed in Bundle System

### Removed Fields:
- ❌ Category
- ❌ SKU

### New Fields:
- ✅ Sales Channel (dropdown)
- ✅ Store (filtered by selected channel)

### Database Changes:
Migration `028_remove_category_sku_from_bundles.sql` removes:
- `category` column
- `sku` column

## Current File Status

### ✅ GOOD FILES (Keep These):
- `components/create-bundle-dialog.tsx` - NEW clean version
- `app/api/bundles/route.ts` - Clean, no old imports
- `supabase/migrations/028_remove_category_sku_from_bundles.sql` - Migration

### ❌ DELETED FILES (Should Not Exist):
- `lib/bundle-utils.ts`
- `lib/types/bundle.ts`
- `app/api/bundles/[id]/route.ts`
- `components/create-bundle-modal.tsx`

## Expected Behavior After Fix

1. Create Bundle modal opens
2. Shows fields: Name, Description, Sales Channel, Store, Price, Badge, Items
3. When you select Sales Channel → Store dropdown filters to show only stores for that channel
4. Bundle creates successfully without category/SKU
5. No import errors in console

## Troubleshooting

### Error: "Module not found: Can't resolve '@/lib/bundle-utils'"
- This means cache is still active
- Run NUCLEAR-CACHE-CLEAR.cmd again
- Manually delete .next folder
- Restart dev server

### Error: "Cannot read property 'category' of undefined"
- Run migration 028 in Supabase
- Clear browser cache
- Hard refresh

### Store dropdown not filtering
- Check create-bundle-dialog.tsx has the filtering logic
- Check browser console for errors
- Verify stores API returns sales_channel field

---

**LAST UPDATED**: After deleting app/api/bundles/[id]/route.ts
**STATUS**: All old code removed, waiting for cache clear

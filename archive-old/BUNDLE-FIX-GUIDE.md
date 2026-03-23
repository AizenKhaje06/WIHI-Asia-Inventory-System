# Bundle Creation Fix Guide

## Problem
Bundle creation is failing with error: "Missing required fields: name, components, selling_price, store"

## Root Cause
Next.js/Turbopack is running **OLD CACHED CODE** from `.next` folder. The actual source code is correct, but the server is executing an old compiled version.

## Evidence
- **Terminal shows**: `.from('inventory').eq('product_type', 'bundle')` (OLD CODE)
- **Actual file has**: `.from('bundles')` (CORRECT CODE)
- This proves the server is running cached code

## Solution Steps

### Step 1: Complete Server Shutdown
```cmd
taskkill /F /IM node.exe
```
Wait 5 seconds to ensure all processes are killed.

### Step 2: Delete ALL Cache Folders
```cmd
rmdir /s /q .next
rmdir /s /q node_modules\.cache
rmdir /s /q node_modules\.turbo
```

### Step 3: Clear NPM Cache
```cmd
npm cache clean --force
```

### Step 4: Clear Windows Temp Files
```cmd
del /q /s %TEMP%\next-*
```

### Step 5: Restart Server
```cmd
npm run dev
```

## Quick Method
Run the provided script:
```cmd
NUCLEAR-CACHE-CLEAR.cmd
```

## Verification After Restart

### 1. Check Terminal Output
After creating a bundle, you should see:
```
[Bundles API] Received request body: {
  "name": "...",
  "bundlePrice": ...,
  "items": [...]
}
```

### 2. Check for Correct Query
Terminal should NOT show:
- ❌ `.from('inventory').eq('product_type', 'bundle')`

Terminal SHOULD show:
- ✅ `[Bundles API] Received request body:`
- ✅ `[Bundles API] Success: BUNDLE-...`

### 3. Test Bundle Creation
1. Go to Inventory page
2. Click "Create Bundle"
3. Fill in:
   - Name: "TEST BUNDLE"
   - Category: Any category
   - Store: Any store
   - Add 2 items
   - Set bundle price
4. Click "Create Bundle"
5. Should see success message

## If Still Failing

### Option 1: Check Supabase Tables
Verify these tables exist in Supabase:
- `bundles` table (with columns: id, name, category, store, bundle_price, etc.)
- `bundle_items` table (with columns: id, bundle_id, item_id, quantity)

### Option 2: Run Migration
If tables don't exist, run this in Supabase SQL Editor:
```sql
-- File: supabase/migrations/020_create_bundles_table.sql
```

### Option 3: Check API Route File
Verify `app/api/bundles/route.ts` contains:
```typescript
let query = supabase.from('bundles').select('*')
```
NOT:
```typescript
let query = supabase.from('inventory').eq('product_type', 'bundle')
```

## Expected Behavior After Fix

1. Bundle creation form accepts all fields
2. Bundle saves to `bundles` table
3. Bundle items save to `bundle_items` table
4. Success message appears
5. Bundle appears in inventory list

## Code Verification

### Correct API Route (app/api/bundles/route.ts)
```typescript
export async function GET(request: NextRequest) {
  let query = supabase.from('bundles').select('*')  // ✅ CORRECT
  // ...
}

export async function POST(request: NextRequest) {
  const { name, category, store, bundlePrice, items } = body  // ✅ CORRECT
  // ...
}
```

### Correct Dialog (components/create-bundle-dialog.tsx)
```typescript
const response = await apiPost('/api/bundles', {
  name: formData.name.trim(),
  category: formData.category,
  store: formData.store,
  bundlePrice: formData.bundlePrice,  // ✅ CORRECT
  items: bundleItems.map(bi => ({
    itemId: bi.itemId,
    quantity: bi.quantity
  }))
})
```

## Next Steps After Bundle Creation Works

1. Run migration 027 to create unified view:
   ```sql
   -- File: supabase/migrations/027_create_products_unified_view.sql
   ```

2. This will make bundles appear in product lists alongside regular products

## Notes

- The source code is **100% CORRECT**
- The problem is **ONLY** cached compiled code
- After cache clear, everything should work
- If it doesn't work after cache clear, check Supabase tables

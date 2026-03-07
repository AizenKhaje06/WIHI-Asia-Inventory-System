# Bundle Products - Final Implementation Guide 🎯

## Current Status
✅ Database tables created
✅ API endpoints working  
✅ Create Bundle Dialog built
✅ TypeScript types defined

## What You Need to Do Now

### Step 1: Add "Create Bundle" Button to Your App

Pick any page where you want to create bundles. I recommend adding it to your **POS/Warehouse Dispatch** page or creating a dedicated **Bundles Management** page.

#### Option A: Add to POS Page (Recommended)

**File**: `app/dashboard/pos/page.tsx`

Add this import at the top:
```typescript
import { CreateBundleDialog } from '@/components/create-bundle-dialog'
```

Add state for the dialog:
```typescript
const [createBundleOpen, setCreateBundleOpen] = useState(false)
```

Add button in the header section (around line 300):
```typescript
<Button 
  onClick={() => setCreateBundleOpen(true)}
  variant="outline"
  className="gap-2"
>
  <Package className="h-4 w-4" />
  Create Bundle
</Button>
```

Add dialog before closing `</div>`:
```typescript
<CreateBundleDialog
  open={createBundleOpen}
  onOpenChange={setCreateBundleOpen}
  onSuccess={() => {
    toast.success('Bundle created! Refresh to see it.')
  }}
/>
```

#### Option B: Create Dedicated Bundles Page

**File**: `app/dashboard/bundles/page.tsx` (create new file)

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateBundleDialog } from '@/components/create-bundle-dialog'
import { Package, Plus } from 'lucide-react'
import { apiGet } from '@/lib/api-client'
import type { Bundle } from '@/lib/types'

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBundles()
  }, [])

  const fetchBundles = async () => {
    try {
      const data = await apiGet<Bundle[]>('/api/bundles')
      setBundles(data)
    } catch (error) {
      console.error('Error fetching bundles:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Product Bundles</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your product bundles
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Bundle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bundles.map(bundle => (
          <Card key={bundle.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {bundle.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Bundle Price:</span>
                  <span className="font-bold">₱{bundle.bundlePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Regular Price:</span>
                  <span className="line-through">₱{bundle.regularPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Savings:</span>
                  <span className="font-bold">₱{bundle.savings.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateBundleDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={fetchBundles}
      />
    </div>
  )
}
```

### Step 2: Test Bundle Creation

1. **Navigate to where you added the button**
2. **Click "Create Bundle"**
3. **Fill in the form:**
   - Name: "Test Bundle"
   - Category: Select from dropdown
   - Store: Select from dropdown
   - Add 2-3 items with quantities
   - Set bundle price
4. **Click "Create Bundle"**
5. **Check success message**

### Step 3: Verify in Database

```sql
-- Check created bundles
SELECT * FROM bundles ORDER BY created_at DESC LIMIT 5;

-- Check bundle items
SELECT 
  b.name as bundle_name,
  b.bundle_price,
  b.regular_price,
  b.savings,
  i.name as item_name,
  bi.quantity
FROM bundles b
JOIN bundle_items bi ON b.id = bi.bundle_id
JOIN inventory i ON bi.item_id = i.id
ORDER BY b.created_at DESC;
```

---

## Next Features (When You're Ready)

### Feature 1: Show Bundles in POS
Add bundles to the product selection in Warehouse Dispatch so users can dispatch bundles.

### Feature 2: Bundle Availability
Calculate how many bundles can be made based on available inventory.

### Feature 3: Edit/Delete Bundles
Add management features to edit or delete existing bundles.

### Feature 4: Bundle Analytics
Track which bundles sell best, profit margins, etc.

---

## Quick Reference

### Create Bundle API
```typescript
POST /api/bundles
{
  "name": "Berry Soap 3-Pack",
  "category": "Soap",
  "store": "Main Warehouse",
  "bundlePrice": 250,
  "items": [
    { "itemId": "ITEM-123", "quantity": 3 }
  ]
}
```

### List Bundles API
```typescript
GET /api/bundles
GET /api/bundles?store=Main%20Warehouse
GET /api/bundles?activeOnly=true
```

---

## Files You Have

### Database
- `supabase/migrations/020_create_bundles_table.sql` ✅

### API
- `app/api/bundles/route.ts` ✅

### Components
- `components/create-bundle-dialog.tsx` ✅

### Types
- `lib/types.ts` (Bundle interfaces added) ✅

---

## Support

Everything is ready to use! Just add the Create Bundle button to your app and start creating bundles.

**Status**: ✅ READY TO USE
**Next Step**: Add button to your app
**Then**: Test creating a bundle!

🚀 You're all set!

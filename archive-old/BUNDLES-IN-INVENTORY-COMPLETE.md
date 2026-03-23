# Bundles in Inventory - Implementation Complete

## What Was Done:

### 1. Created Unified Products View
**File**: `supabase/migrations/029_create_products_unified_view_clean.sql`

This view combines:
- Regular products from `inventory` table
- Bundles from `bundles` table

### 2. Created Products API Endpoint
**File**: `app/api/products/route.ts`

Fetches from `products_unified` view with filters for:
- Search (name, category, SKU)
- Store
- Category
- Product type (regular/bundle/all)

### 3. Updated Inventory Page
**File**: `app/dashboard/inventory/page.tsx`

Changed from `/api/items` to `/api/products` to fetch unified data.

---

## How to Deploy:

### Step 1: Run Migration in Supabase
Go to Supabase SQL Editor and run:
```sql
-- File: supabase/migrations/029_create_products_unified_view_clean.sql
```

Or copy-paste the migration content.

### Step 2: Test Locally
```cmd
npm run dev
```

Go to Inventory page - you should see both regular products AND bundles.

### Step 3: Deploy to Vercel
```cmd
git add .
git commit -m "feat: Show bundles in inventory table via unified view"
git push
```

---

## Expected Result:

In the Inventory page, you'll see:
- Regular products (from inventory table)
- Bundles (from bundles table) with a "Bundle" badge
- Both types can be filtered, searched, and sorted together

---

## Bundle Display Features:

Bundles will show:
- Name
- Category
- Store
- Sales Channel
- Quantity (virtual stock)
- Cost (bundle_cost)
- Price (bundle_price)
- Badge (if set)
- Product Type: "bundle"

---

**Status**: ✅ Complete
**Next**: Run migration 029 in Supabase, then test!

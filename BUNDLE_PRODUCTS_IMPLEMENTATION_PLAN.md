# Bundle Products Feature - Implementation Plan 📦

## Overview
Allow users to create product bundles with specific pricing. A bundle is a collection of multiple products sold together at a special price.

---

## Example Use Cases

### Example 1: Soap Bundle
```
Bundle Name: "Berry Soap 3-Pack"
Contains:
- Berry Soap (3 units)
Regular Price: ₱300 (₱100 × 3)
Bundle Price: ₱250 (Save ₱50!)
```

### Example 2: Mixed Bundle
```
Bundle Name: "Starter Kit"
Contains:
- Berry Soap (2 units)
- Build Cord (1 unit)
- Shampoo (1 unit)
Regular Price: ₱800
Bundle Price: ₱650 (Save ₱150!)
```

---

## Database Changes

### 1. Create Bundles Table

**Migration File**: `supabase/migrations/020_create_bundles_table.sql`

```sql
-- Create bundles table
CREATE TABLE IF NOT EXISTS bundles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  store TEXT NOT NULL,
  sales_channel TEXT,
  
  -- Pricing
  bundle_price DECIMAL(10,2) NOT NULL,
  bundle_cost DECIMAL(10,2) NOT NULL,
  regular_price DECIMAL(10,2) NOT NULL, -- Sum of individual items
  savings DECIMAL(10,2) NOT NULL, -- regular_price - bundle_price
  
  -- Inventory
  quantity INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 5,
  
  -- Metadata
  sku TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Display
  image_url TEXT,
  badge TEXT -- e.g., "BEST VALUE", "SAVE 20%"
);

-- Create bundle_items table (what's inside each bundle)
CREATE TABLE IF NOT EXISTS bundle_items (
  id TEXT PRIMARY KEY,
  bundle_id TEXT NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(bundle_id, item_id)
);

-- Create indexes
CREATE INDEX idx_bundles_store ON bundles(store);
CREATE INDEX idx_bundles_category ON bundles(category);
CREATE INDEX idx_bundles_active ON bundles(is_active);
CREATE INDEX idx_bundle_items_bundle ON bundle_items(bundle_id);
CREATE INDEX idx_bundle_items_item ON bundle_items(item_id);

-- Add comments
COMMENT ON TABLE bundles IS 'Product bundles with special pricing';
COMMENT ON TABLE bundle_items IS 'Items included in each bundle';
COMMENT ON COLUMN bundles.bundle_price IS 'Special bundle price (what customer pays)';
COMMENT ON COLUMN bundles.bundle_cost IS 'Total cost of all items in bundle';
COMMENT ON COLUMN bundles.regular_price IS 'Sum of individual item prices';
COMMENT ON COLUMN bundles.savings IS 'Amount saved by buying bundle';
```

---

## TypeScript Interfaces

### Update `lib/types.ts`

```typescript
export interface Bundle {
  id: string
  name: string
  description?: string
  category: string
  store: string
  salesChannel?: string
  
  // Pricing
  bundlePrice: number
  bundleCost: number
  regularPrice: number
  savings: number
  savingsPercentage: number // calculated
  
  // Inventory
  quantity: number
  reorderLevel: number
  
  // Metadata
  sku?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  
  // Display
  imageUrl?: string
  badge?: string
  
  // Relations
  items?: BundleItem[]
}

export interface BundleItem {
  id: string
  bundleId: string
  itemId: string
  itemName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface CreateBundleRequest {
  name: string
  description?: string
  category: string
  store: string
  salesChannel?: string
  bundlePrice: number
  items: Array<{
    itemId: string
    quantity: number
  }>
  reorderLevel?: number
  sku?: string
  badge?: string
}
```

---

## API Endpoints

### 1. Create Bundle API
**File**: `app/api/bundles/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/bundles - List all bundles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const store = searchParams.get('store')
    const category = searchParams.get('category')
    const activeOnly = searchParams.get('activeOnly') !== 'false'
    
    let query = supabase
      .from('bundles')
      .select(`
        *,
        bundle_items (
          id,
          item_id,
          quantity,
          items (
            id,
            name,
            selling_price,
            cost_price
          )
        )
      `)
      .order('created_at', { ascending: false })
    
    if (activeOnly) {
      query = query.eq('is_active', true)
    }
    
    if (store) {
      query = query.eq('store', store)
    }
    
    if (category) {
      query = query.eq('category', category)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error('[Bundles API] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/bundles - Create new bundle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      category,
      store,
      salesChannel,
      bundlePrice,
      items,
      reorderLevel = 5,
      sku,
      badge
    } = body
    
    // Validate required fields
    if (!name || !category || !store || !bundlePrice || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Fetch item details to calculate costs
    const itemIds = items.map((i: any) => i.itemId)
    const { data: itemsData, error: itemsError } = await supabase
      .from('items')
      .select('id, name, cost_price, selling_price')
      .in('id', itemIds)
    
    if (itemsError) throw itemsError
    
    // Calculate bundle cost and regular price
    let bundleCost = 0
    let regularPrice = 0
    
    items.forEach((bundleItem: any) => {
      const item = itemsData?.find(i => i.id === bundleItem.itemId)
      if (item) {
        bundleCost += item.cost_price * bundleItem.quantity
        regularPrice += item.selling_price * bundleItem.quantity
      }
    })
    
    const savings = regularPrice - bundlePrice
    
    // Generate bundle ID
    const bundleId = `BUNDLE-${Date.now()}`
    
    // Insert bundle
    const { data: bundle, error: bundleError } = await supabase
      .from('bundles')
      .insert({
        id: bundleId,
        name,
        description,
        category,
        store,
        sales_channel: salesChannel,
        bundle_price: bundlePrice,
        bundle_cost: bundleCost,
        regular_price: regularPrice,
        savings,
        quantity: 0, // Will be calculated based on component availability
        reorder_level: reorderLevel,
        sku,
        is_active: true,
        badge,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (bundleError) throw bundleError
    
    // Insert bundle items
    const bundleItemsData = items.map((item: any) => ({
      id: `BITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      bundle_id: bundleId,
      item_id: item.itemId,
      quantity: item.quantity,
      created_at: new Date().toISOString()
    }))
    
    const { error: itemsInsertError } = await supabase
      .from('bundle_items')
      .insert(bundleItemsData)
    
    if (itemsInsertError) throw itemsInsertError
    
    return NextResponse.json(bundle, { status: 201 })
  } catch (error: any) {
    console.error('[Bundles API] Error creating bundle:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

### 2. Update/Delete Bundle API
**File**: `app/api/bundles/[id]/route.ts`

```typescript
// PATCH /api/bundles/[id] - Update bundle
// DELETE /api/bundles/[id] - Delete bundle
```

---

## UI Components

### 1. Create Bundle Dialog
**File**: `components/create-bundle-dialog.tsx`

Features:
- Bundle name and description
- Category and store selection
- Item selector (multi-select with quantities)
- Bundle price input
- Shows regular price and savings
- Preview of bundle contents

### 2. Bundle Card Component
**File**: `components/bundle-card.tsx`

Display:
- Bundle name and badge
- Bundle price (large)
- Regular price (strikethrough)
- Savings amount and percentage
- "Contains X items" indicator
- Add to cart button

### 3. Bundle Details Modal
**File**: `components/bundle-details-modal.tsx`

Shows:
- Full bundle information
- List of included items with quantities
- Pricing breakdown
- Stock availability
- Edit/Delete options (admin)

---

## Inventory Page Updates

### Add Bundles Tab
**File**: `app/dashboard/inventory/page.tsx`

```typescript
<Tabs defaultValue="products">
  <TabsList>
    <TabsTrigger value="products">Products</TabsTrigger>
    <TabsTrigger value="bundles">Bundles</TabsTrigger>
  </TabsList>
  
  <TabsContent value="products">
    {/* Existing products table */}
  </TabsContent>
  
  <TabsContent value="bundles">
    <BundlesTable bundles={bundles} />
  </TabsContent>
</Tabs>
```

---

## POS/Warehouse Dispatch Updates

### Add Bundles to Product Selection

```typescript
// Show both individual products and bundles
const allProducts = [
  ...items.map(item => ({ type: 'product', ...item })),
  ...bundles.map(bundle => ({ type: 'bundle', ...bundle }))
]

// When adding bundle to cart
function addBundleToCart(bundle: Bundle) {
  // Check if all bundle items are in stock
  const canFulfill = checkBundleAvailability(bundle)
  
  if (canFulfill) {
    setCart([...cart, { 
      type: 'bundle',
      bundle,
      quantity: 1 
    }])
  } else {
    toast.error('Some items in this bundle are out of stock')
  }
}
```

---

## Business Logic

### 1. Bundle Availability Calculation

```typescript
function calculateBundleAvailability(bundle: Bundle): number {
  // How many complete bundles can we make?
  let maxBundles = Infinity
  
  bundle.items?.forEach(bundleItem => {
    const item = items.find(i => i.id === bundleItem.itemId)
    if (item) {
      const possibleBundles = Math.floor(item.quantity / bundleItem.quantity)
      maxBundles = Math.min(maxBundles, possibleBundles)
    }
  })
  
  return maxBundles === Infinity ? 0 : maxBundles
}
```

### 2. Bundle Dispatch Logic

When dispatching a bundle:
1. Deduct quantities from each component item
2. Create order with bundle details
3. Log transaction for each component

```typescript
async function dispatchBundle(bundle: Bundle, quantity: number) {
  // Deduct from inventory
  for (const bundleItem of bundle.items) {
    await updateItemQuantity(
      bundleItem.itemId,
      -bundleItem.quantity * quantity
    )
  }
  
  // Create order
  await createOrder({
    product: bundle.name,
    qty: quantity,
    total: bundle.bundlePrice * quantity,
    cogs: bundle.bundleCost * quantity,
    // ... other fields
  })
}
```

---

## Features Summary

### Core Features
✅ Create bundles with multiple products
✅ Set custom bundle pricing
✅ Calculate savings automatically
✅ Track bundle inventory availability
✅ Dispatch bundles (deducts component items)
✅ Display bundles in POS/Warehouse Dispatch
✅ Bundle management (edit, delete, activate/deactivate)

### Advanced Features (Optional)
- Bundle variants (different sizes/combinations)
- Dynamic pricing rules
- Bundle promotions
- Bundle analytics
- Auto-create bundles based on frequently bought together

---

## Implementation Steps

### Phase 1: Database & API (Day 1)
1. Create migration file for bundles tables
2. Create bundles API endpoints
3. Update TypeScript interfaces
4. Test API with Postman

### Phase 2: UI Components (Day 2)
1. Create bundle dialog component
2. Create bundle card component
3. Create bundle details modal
4. Add bundles tab to inventory page

### Phase 3: Integration (Day 3)
1. Add bundles to POS page
2. Implement bundle dispatch logic
3. Update inventory calculations
4. Add bundle filtering and search

### Phase 4: Testing & Polish (Day 4)
1. Test bundle creation
2. Test bundle dispatch
3. Test inventory deduction
4. Add validation and error handling
5. Polish UI/UX

---

## Example Bundle Creation Flow

```
1. User clicks "Create Bundle" button
2. Dialog opens with form:
   - Bundle Name: "Berry Soap 3-Pack"
   - Category: "Soap"
   - Store: "Main Warehouse"
   - Select Items:
     ✓ Berry Soap (Qty: 3)
   - Regular Price: ₱300 (auto-calculated)
   - Bundle Price: ₱250 (user input)
   - Savings: ₱50 (auto-calculated, 16.7%)
3. User clicks "Create Bundle"
4. System validates and creates bundle
5. Bundle appears in inventory with badge "SAVE ₱50"
```

---

## Benefits

### For Business
✅ Increase average order value
✅ Move inventory faster
✅ Create promotional packages
✅ Competitive pricing strategies

### For Customers
✅ Better value for money
✅ Convenient pre-packaged sets
✅ Clear savings display
✅ Easy ordering

### For Operations
✅ Simplified inventory management
✅ Accurate cost tracking
✅ Flexible pricing
✅ Easy bundle creation

---

## Next Steps

Ready to implement? I can start with:
1. **Database migration** - Create bundles tables
2. **API endpoints** - CRUD operations for bundles
3. **UI components** - Bundle creation and display
4. **POS integration** - Add bundles to dispatch

Which part would you like me to start with? 🚀

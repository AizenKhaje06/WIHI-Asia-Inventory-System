# 🔧 Bundle API Fix Plan
## Step-by-Step Implementation Guide

**Date**: March 6, 2026  
**Objective**: Fix all type mismatches and implement missing functionality  
**Estimated Time**: 2 hours

---

## 📦 Phase 1: Core Utilities (30 min)

### Step 1.1: Add Helper Functions to bundle-utils.ts

**Location:** `lib/bundle-utils.ts` (top of file, after imports)

```typescript
/**
 * Helper function to get item_id from component
 * Supports both camelCase (itemId) and snake_case (item_id)
 */
function getItemId(component: BundleComponent): string {
  return component.itemId || component.item_id || ''
}

/**
 * Helper function to get item_name from component
 */
function getItemName(component: BundleComponent): string | undefined {
  return component.itemName || component.item_name
}
```

### Step 1.2: Update calculateBundleCost Function

**Replace:**
```typescript
export function calculateBundleCost(
  components: BundleComponent[],
  items: InventoryItem[]
): number {
  return components.reduce((total, component) => {
    const item = items.find(i => i.id === component.item_id)  // ❌ OLD
    if (!item) return total
    return total + (item.costPrice * component.quantity)
  }, 0)
}
```

**With:**
```typescript
export function calculateBundleCost(
  components: BundleComponent[],
  items: InventoryItem[]
): number {
  return components.reduce((total, component) => {
    const itemId = getItemId(component)  // ✅ NEW
    const item = items.find(i => i.id === itemId)
    if (!item) return total
    return total + (item.costPrice * component.quantity)
  }, 0)
}
```

### Step 1.3: Update calculateVirtualStock Function

**Replace all occurrences of `component.item_id` with `getItemId(component)`**

```typescript
export function calculateVirtualStock(
  components: BundleComponent[],
  items: InventoryItem[]
): VirtualStockResult {
  let minBundles = Infinity
  let bottleneck: VirtualStockResult['bottleneck_component'] | undefined
  
  const componentStatus = components.map(component => {
    const itemId = getItemId(component)  // ✅ CHANGED
    const item = items.find(i => i.id === itemId)
    if (!item) {
      return {
        item_id: itemId,  // ✅ CHANGED
        item_name: 'Unknown',
        available_stock: 0,
        required_per_bundle: component.quantity,
        max_bundles_possible: 0
      }
    }
    
    const maxBundles = Math.floor(item.quantity / component.quantity)
    
    if (maxBundles < minBundles) {
      minBundles = maxBundles
      bottleneck = {
        item_id: item.id,
        item_name: item.name,
        available_stock: item.quantity,
        required_per_bundle: component.quantity
      }
    }
    
    return {
      item_id: item.id,
      item_name: item.name,
      available_stock: item.quantity,
      required_per_bundle: component.quantity,
      max_bundles_possible: maxBundles
    }
  })
  
  return {
    bundle_id: '',
    available_bundles: Math.max(0, minBundles === Infinity ? 0 : minBundles),
    bottleneck_component: bottleneck,
    component_status: componentStatus
  }
}
```

### Step 1.4: Update validateBundle Function

**Replace:**
```typescript
const item = items.find(i => i.id === component.item_id)  // ❌ OLD
```

**With:**
```typescript
const itemId = getItemId(component)  // ✅ NEW
const item = items.find(i => i.id === itemId)
```

### Step 1.5: Update All Other Functions

Apply the same pattern to:
- `calculateBundleSavings()` - Line 187
- `formatBundleComponents()` - Line 213
- `canSellBundle()` - Lines 241, 245
- `calculateComponentDeductions()` - Line 287

### Step 1.6: Implement deductBundleComponents Function

**Add to end of bundle-utils.ts:**

```typescript
/**
 * Deduct bundle components from inventory (database operation)
 * This is a placeholder - actual implementation should be in API route
 */
export async function deductBundleComponents(
  bundle: BundleProduct,
  quantity: number,
  metadata: {
    staffName: string
    department: string
    notes: string
  }
): Promise<{
  success: boolean
  deductedComponents?: ComponentDeduction[]
  errors?: string[]
}> {
  // This function should be called from the API route
  // It needs database access which should be handled server-side
  throw new Error('deductBundleComponents should be called from API route, not client-side')
}
```

---

## 🎨 Phase 2: UI Components (15 min)

### Step 2.1: Fix create-bundle-modal.tsx

**Find and replace all instances:**

```typescript
// ❌ OLD (Line 202)
const totalCost = calculateBundleCost(components)

// ✅ NEW
const totalCost = calculateBundleCost(components, items)
```

```typescript
// ❌ OLD (Line 207)
const virtualStock = calculateVirtualStock(components)

// ✅ NEW
const virtualStock = calculateVirtualStock(components, items)
```

```typescript
// ❌ OLD (Line 245)
const bundleCost = calculateBundleCost(components)

// ✅ NEW
const bundleCost = calculateBundleCost(components, items)
```

```typescript
// ❌ OLD (Line 248)
const virtualStock = calculateVirtualStock(components)

// ✅ NEW
const virtualStock = calculateVirtualStock(components, items)
```

### Step 2.2: Update Component State to Use camelCase

**Find the handleAddComponent function and update:**

```typescript
function handleAddComponent() {
  if (!selectedItemId || selectedQuantity <= 0) {
    showError("Please select an item and valid quantity")
    return
  }

  const item = items.find(i => i.id === selectedItemId)
  if (!item) return

  // Check if component already exists
  const existingIndex = components.findIndex(c => 
    (c.itemId || c.item_id) === selectedItemId  // ✅ Support both
  )
  
  if (existingIndex >= 0) {
    const updated = [...components]
    updated[existingIndex].quantity += selectedQuantity
    setComponents(updated)
    showSuccess(`Updated ${item.name} quantity`)
  } else {
    // Add new component with camelCase
    const newComponent: BundleComponent = {
      itemId: item.id,  // ✅ Use camelCase
      itemName: item.name,
      quantity: selectedQuantity,
      costPrice: item.costPrice,
      currentStock: item.quantity
    }
    setComponents([...components, newComponent])
    showSuccess(`Added ${item.name} to bundle`)
  }

  setSelectedItemId("")
  setSelectedQuantity(1)
}
```

---

## 🔌 Phase 3: API Routes (30 min)

### Step 3.1: Fix bundles/sell/route.ts

**Replace entire file with:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'  // ✅ FIXED import
import { validateBundle, calculateBundleCost } from '@/lib/bundle-utils'
import type { BundleProduct, BundleSaleResponse } from '@/lib/types/bundle'

/**
 * POST /api/bundles/sell
 * Sell a bundle product and automatically deduct component inventory
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bundleId, bundle_id, quantity, staffName, staff_name, department, notes } = body

    // Support both camelCase and snake_case
    const id = bundleId || bundle_id
    const staff = staffName || staff_name || 'System'

    // Validate required fields
    if (!id || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Bundle ID and valid quantity are required' },
        { status: 400 }
      )
    }

    // Fetch bundle product
    const { data: bundle, error: bundleError } = await supabaseAdmin
      .from('items')
      .select('*')
      .eq('id', id)
      .eq('product_type', 'bundle')
      .single()

    if (bundleError || !bundle) {
      return NextResponse.json(
        { error: 'Bundle product not found' },
        { status: 404 }
      )
    }

    // Fetch component items for validation
    const componentIds = bundle.bundle_components.map((c: any) => c.item_id || c.itemId)
    const { data: componentItems, error: itemsError } = await supabaseAdmin
      .from('items')
      .select('*')
      .in('id', componentIds)

    if (itemsError || !componentItems) {
      return NextResponse.json(
        { error: 'Failed to fetch component items' },
        { status: 500 }
      )
    }

    // Validate sufficient stock for all components
    const insufficientComponents = []
    for (const component of bundle.bundle_components) {
      const itemId = component.item_id || component.itemId
      const item = componentItems.find((i: any) => i.id === itemId)
      if (!item) {
        return NextResponse.json(
          { error: `Component not found: ${itemId}` },
          { status: 404 }
        )
      }
      
      const requiredQty = component.quantity * quantity
      if (item.quantity < requiredQty) {
        insufficientComponents.push({
          itemId: item.id,
          itemName: item.name,
          available: item.quantity,
          required: requiredQty
        })
      }
    }

    if (insufficientComponents.length > 0) {
      return NextResponse.json(
        { 
          error: 'Insufficient component stock',
          insufficientComponents
        },
        { status: 400 }
      )
    }

    // Deduct component inventory
    const deductedComponents = []
    for (const component of bundle.bundle_components) {
      const itemId = component.item_id || component.itemId
      const deductQty = component.quantity * quantity

      const { error: deductError } = await supabaseAdmin
        .from('items')
        .update({ 
          quantity: supabaseAdmin.raw(`quantity - ${deductQty}`),
          last_updated: new Date().toISOString()
        })
        .eq('id', itemId)

      if (deductError) {
        console.error('[Bundle Sale] Deduction error:', deductError)
        return NextResponse.json(
          { error: 'Failed to deduct component inventory' },
          { status: 500 }
        )
      }

      const item = componentItems.find((i: any) => i.id === itemId)
      deductedComponents.push({
        item_id: itemId,
        itemName: item?.name,
        quantity_per_bundle: component.quantity,
        bundles_sold: quantity,
        total_deducted: deductQty
      })
    }

    // Calculate totals
    const totalCost = bundle.cost_price * quantity
    const totalRevenue = bundle.selling_price * quantity
    const totalProfit = totalRevenue - totalCost

    // Create bundle sale transaction
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .insert({
        item_id: bundle.id,
        item_name: bundle.name,
        quantity: quantity,
        cost_price: bundle.cost_price,
        selling_price: bundle.selling_price,
        total_cost: totalCost,
        total_revenue: totalRevenue,
        profit: totalProfit,
        type: 'sale',
        transaction_type: 'sale',
        department: department || 'Bundle Sale',
        staff_name: staff,
        notes: notes || `Bundle sale: ${bundle.name} x${quantity}`,
        status: 'completed'
      })
      .select()
      .single()

    if (transactionError) {
      console.error('[Bundle Sale] Transaction error:', transactionError)
      return NextResponse.json(
        { error: 'Failed to create sale transaction' },
        { status: 500 }
      )
    }

    // Create log entry
    await supabaseAdmin
      .from('logs')
      .insert({
        operation: 'bundle_sale',
        item_id: bundle.id,
        item_name: bundle.name,
        quantity: quantity,
        details: `Bundle sold: ${bundle.name} x${quantity}. Components: ${deductedComponents.map(c => `${c.itemName} x${c.total_deducted}`).join(', ')}`,
        staff_name: staff,
        status: 'completed'
      })

    const response: BundleSaleResponse = {
      success: true,
      bundle_id: bundle.id,
      quantity_sold: quantity,
      component_deductions: deductedComponents,
      new_available_stock: 0, // Recalculate if needed
      message: `Successfully sold ${quantity} ${bundle.name} bundle(s)`
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('[Bundle Sale] Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
```

### Step 3.2: Update BundleSaleRequest and BundleSaleResponse Types

**Location:** `lib/types/bundle.ts`

```typescript
/**
 * Bundle sale request
 */
export interface BundleSaleRequest {
  bundleId?: string      // Camel case (frontend)
  bundle_id?: string     // Snake case (backend)
  quantity: number
  staffName?: string     // Camel case
  staff_name?: string    // Snake case
  department?: string
  notes?: string
}

/**
 * Bundle sale response
 */
export interface BundleSaleResponse {
  success: boolean
  bundle_id: string
  quantity_sold: number
  component_deductions: ComponentDeduction[]
  new_available_stock: number
  transaction_id?: string  // ✅ ADDED
  message: string
}
```

---

## 🧪 Phase 4: Testing (30 min)

### Step 4.1: Update Postman Collection

**Update all Bundle API request bodies to use camelCase:**

```json
{
  "name": "Gaming Bundle",
  "sku": "BUNDLE-001",
  "components": [
    {
      "itemId": "ITEM-123",
      "quantity": 1
    },
    {
      "itemId": "ITEM-456",
      "quantity": 2
    }
  ],
  "selling_price": 5000,
  "sales_channel": "Shopee",
  "store": "Main Warehouse",
  "reorder_level": 10,
  "is_virtual_stock": true
}
```

### Step 4.2: Test Checklist

Run tests in this order:

1. ✅ **Compile Check**
   ```bash
   npm run build
   ```

2. ✅ **Start Dev Server**
   ```bash
   npm run dev
   ```

3. ✅ **Test Health Endpoint**
   ```bash
   curl http://localhost:3000/api/health
   ```

4. ✅ **Test Bundle Creation** (Postman)
   - POST /api/bundles
   - Verify response has bundle_id
   - Check database for new bundle

5. ✅ **Test Bundle Retrieval** (Postman)
   - GET /api/bundles
   - Verify components have correct properties
   - Check virtual stock calculation

6. ✅ **Test Bundle Sale** (Postman)
   - POST /api/bundles/sell
   - Verify components deducted
   - Check transaction created

---

## ✅ Verification Checklist

### Code Quality
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All imports resolve correctly
- [ ] No unused variables

### Functionality
- [ ] Bundle creation works
- [ ] Virtual stock calculates correctly
- [ ] Bundle sale deducts components
- [ ] Transactions created properly
- [ ] Logs recorded correctly

### API Testing
- [ ] All Postman tests pass
- [ ] Error handling works
- [ ] Validation works
- [ ] Response formats correct

### Database
- [ ] Components deducted correctly
- [ ] Transactions recorded
- [ ] Logs created
- [ ] No orphaned records

---

## 🚀 Deployment Steps

1. **Commit changes**
   ```bash
   git add .
   git commit -m "fix: Bundle API type mismatches and missing implementations"
   ```

2. **Push to dev branch**
   ```bash
   git push origin dev
   ```

3. **Test in dev environment**
   - Run all Postman tests
   - Verify functionality
   - Check logs

4. **Create PR for review**
   - Include this fix plan
   - Reference type mismatch analysis
   - Add test results

---

**Status**: Ready for Implementation  
**Priority**: HIGH  
**Estimated Time**: 2 hours  
**Risk**: Low (well-defined fixes)

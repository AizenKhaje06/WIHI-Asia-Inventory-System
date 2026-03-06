# 🔍 Bundle API Type Mismatch Analysis
## Post Type Change Impact Assessment

**Date**: March 6, 2026  
**Issue**: BundleComponent interface changed from snake_case to camelCase  
**Impact**: Multiple compilation errors and runtime issues

---

## 📋 Type Changes Summary

### Before (Snake Case - Backend)
```typescript
export interface BundleComponent {
  item_id: string
  quantity: number
  item_name?: string
  item_cost?: number
}
```

### After (Dual Support - Frontend + Backend)
```typescript
export interface BundleComponent {
  itemId: string           // Primary (camelCase for frontend)
  item_id?: string         // Fallback (snake_case for backend)
  quantity: number
  itemName?: string        // Primary
  item_name?: string       // Fallback
  costPrice?: number       // Primary
  item_cost?: number       // Fallback
  currentStock?: number    // New field
  item_price?: number      // Backend compatibility
}
```

---

## 🚨 Critical Issues Found

### 1. **lib/bundle-utils.ts** - Multiple Access Errors

#### Issue: All functions use `component.item_id` (snake_case)
**Affected Functions:**
- `calculateBundleCost()` - Line 25
- `calculateVirtualStock()` - Lines 43, 46, 59, 67
- `validateBundle()` - Line 123
- `calculateBundleSavings()` - Line 187
- `formatBundleComponents()` - Line 213
- `canSellBundle()` - Lines 241, 245
- `calculateComponentDeductions()` - Line 287

**Error Type:** Property access on potentially undefined field

**Fix Required:** Change all `component.item_id` to `component.itemId || component.item_id`

---

### 2. **components/create-bundle-modal.tsx** - Type Errors

#### Issue: calculateBundleCost expects 2 args, receives 1
**Lines:** 
- Line 202: `const totalCost = calculateBundleCost(components)`
- Line 207: `const virtualStock = calculateVirtualStock(components)`
- Line 245: `const bundleCost = calculateBundleCost(components)`
- Line 248: `const virtualStock = calculateVirtualStock(components)`

**Error:** Expected 2 arguments (components, items), but got 1

**Fix Required:** Pass `items` array as second parameter

---

### 3. **app/api/bundles/sell/route.ts** - Multiple Issues

#### Issue A: Missing createClient export
**Line 2:** `import { createClient } from '@/lib/supabase-db'`

**Error:** Module has no exported member 'createClient'

**Fix:** Use `import { supabaseAdmin } from '@/lib/supabase'`

#### Issue B: Missing deductBundleComponents function
**Line 3:** `import { deductBundleComponents } from '@/lib/bundle-utils'`

**Error:** Module has no exported member 'deductBundleComponents'

**Fix:** This function doesn't exist yet - needs to be implemented

#### Issue C: Wrong BundleSaleRequest interface
**Lines 17-21:** Request body destructuring

**Error:** Properties don't exist on BundleSaleRequest type

**Fix:** Update BundleSaleRequest interface in types/bundle.ts

#### Issue D: Wrong property names on BundleProduct
**Lines 69, 70, 71, 72:** Using camelCase on snake_case properties

**Error:** Property 'costPrice' does not exist. Did you mean 'cost_price'?

**Fix:** Use snake_case for database properties

---

### 4. **app/api/bundles/route.ts** - Property Access Issues

#### Issue: Accessing snake_case properties with camelCase
**Multiple lines:** Using `item.costPrice`, `item.sellingPrice`, etc.

**Error:** Properties don't exist on database result types

**Fix:** Use snake_case for database properties

---

### 5. **app/api/bundles/[id]/route.ts** - Similar Issues

#### Issue: Same property access problems as route.ts

**Fix:** Consistent snake_case usage for database operations

---

## 🔧 Required Fixes

### Priority 1: Critical (Breaks Compilation)

#### 1.1 Update bundle-utils.ts
```typescript
// Change all occurrences from:
component.item_id

// To:
component.itemId || component.item_id
```

#### 1.2 Fix create-bundle-modal.tsx
```typescript
// Add items parameter to all calls:
const totalCost = calculateBundleCost(components, items)
const virtualStock = calculateVirtualStock(components, items)
```

#### 1.3 Fix bundles/sell/route.ts imports
```typescript
// Change:
import { createClient } from '@/lib/supabase-db'

// To:
import { supabaseAdmin } from '@/lib/supabase'
```

---

### Priority 2: Important (Runtime Errors)

#### 2.1 Implement deductBundleComponents function
**Location:** lib/bundle-utils.ts

**Signature:**
```typescript
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
}>
```

#### 2.2 Update BundleSaleRequest interface
**Location:** lib/types/bundle.ts

```typescript
export interface BundleSaleRequest {
  bundleId: string      // Add camelCase
  bundle_id?: string    // Keep snake_case for compatibility
  quantity: number
  staffName?: string    // Add camelCase
  staff_name?: string   // Keep snake_case
  department?: string
  notes?: string
}
```

#### 2.3 Fix property access in API routes
Use snake_case for database properties:
- `bundle.cost_price` not `bundle.costPrice`
- `bundle.selling_price` not `bundle.sellingPrice`
- `item.cost_price` not `item.costPrice`

---

### Priority 3: Enhancement (Type Safety)

#### 3.1 Add InventoryItem.product_type
**Location:** lib/types.ts

```typescript
export interface InventoryItem {
  // ... existing fields
  product_type?: 'simple' | 'bundle' | 'variant'
}
```

#### 3.2 Create helper function for property access
**Location:** lib/bundle-utils.ts

```typescript
/**
 * Get item_id from component (supports both camelCase and snake_case)
 */
function getComponentItemId(component: BundleComponent): string {
  return component.itemId || component.item_id || ''
}
```

---

## 📊 Impact Assessment

### Files Requiring Changes: 6
1. ✅ lib/types/bundle.ts (DONE - already updated)
2. ❌ lib/bundle-utils.ts (CRITICAL)
3. ❌ components/create-bundle-modal.tsx (CRITICAL)
4. ❌ app/api/bundles/sell/route.ts (CRITICAL)
5. ❌ app/api/bundles/route.ts (IMPORTANT)
6. ❌ app/api/bundles/[id]/route.ts (IMPORTANT)

### Compilation Errors: 15+
- Type mismatches: 8
- Missing properties: 4
- Missing functions: 2
- Wrong argument count: 4

### Runtime Errors (Potential): 10+
- Undefined property access
- Database query failures
- API endpoint failures

---

## 🧪 Testing Strategy

### 1. Unit Tests
- Test calculateBundleCost with both camelCase and snake_case
- Test calculateVirtualStock with mixed property formats
- Test validateBundle with various component formats

### 2. Integration Tests
- Test bundle creation API endpoint
- Test bundle sale API endpoint
- Test virtual stock calculation endpoint

### 3. Postman Collection Tests
Run all Bundle API endpoints:
1. ✅ GET /api/health (baseline)
2. ❌ GET /api/bundles (needs fix)
3. ❌ POST /api/bundles (needs fix)
4. ❌ GET /api/bundles/:id (needs fix)
5. ❌ POST /api/bundles/sell (needs fix)

---

## 📝 Postman Collection Updates Needed

### Update Request Bodies
Change all `item_id` to `itemId` in request examples:

```json
// OLD (snake_case)
{
  "components": [
    {
      "item_id": "ITEM-123",
      "quantity": 1
    }
  ]
}

// NEW (camelCase)
{
  "components": [
    {
      "itemId": "ITEM-123",
      "quantity": 1
    }
  ]
}
```

---

## 🎯 Recommended Fix Order

### Phase 1: Core Utilities (30 min)
1. Fix bundle-utils.ts property access
2. Add helper functions for dual property support
3. Implement deductBundleComponents function

### Phase 2: UI Components (15 min)
4. Fix create-bundle-modal.tsx function calls
5. Update component state management

### Phase 3: API Routes (30 min)
6. Fix bundles/sell/route.ts imports and types
7. Fix bundles/route.ts property access
8. Fix bundles/[id]/route.ts property access

### Phase 4: Testing (30 min)
9. Update Postman collection request bodies
10. Run all API tests
11. Fix any remaining issues

**Total Estimated Time: 2 hours**

---

## ✅ Success Criteria

### Compilation
- ✅ No TypeScript errors
- ✅ No ESLint warnings
- ✅ Build succeeds

### Runtime
- ✅ All API endpoints respond correctly
- ✅ Bundle creation works
- ✅ Bundle sale deducts components
- ✅ Virtual stock calculates correctly

### Testing
- ✅ All Postman tests pass
- ✅ Unit tests pass
- ✅ Integration tests pass

---

## 🚀 Next Steps

1. **Review this analysis** - Confirm approach
2. **Apply fixes in order** - Follow phase plan
3. **Test incrementally** - After each phase
4. **Update documentation** - API docs and Postman collection
5. **Deploy to dev** - Test in development environment

---

**Status**: Analysis Complete - Ready for Implementation  
**Priority**: HIGH - Blocks Bundle Product System development  
**Estimated Fix Time**: 2 hours  
**Risk Level**: Medium (well-defined fixes, clear testing path)

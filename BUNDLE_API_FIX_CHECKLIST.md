# ✅ Bundle API Fix Checklist
## Quick Reference for Implementation

**Date**: March 6, 2026  
**Estimated Time**: 2 hours  
**Status**: Ready to Start

---

## 🚀 Phase 1: Core Utilities (30 min)

### Step 1.1: Add Helper Functions
**File:** `lib/bundle-utils.ts`  
**Location:** Top of file, after imports

- [ ] Add `getItemId()` helper function
- [ ] Add `getItemName()` helper function
- [ ] Test helpers with both camelCase and snake_case

**Code:**
```typescript
function getItemId(component: BundleComponent): string {
  return component.itemId || component.item_id || ''
}

function getItemName(component: BundleComponent): string | undefined {
  return component.itemName || component.item_name
}
```

---

### Step 1.2: Update calculateBundleCost
**File:** `lib/bundle-utils.ts`  
**Line:** ~24

- [ ] Replace `component.item_id` with `getItemId(component)`
- [ ] Test with sample data
- [ ] Verify no TypeScript errors

---

### Step 1.3: Update calculateVirtualStock
**File:** `lib/bundle-utils.ts`  
**Lines:** ~43, 46, 59, 67

- [ ] Replace all `component.item_id` with `getItemId(component)`
- [ ] Test virtual stock calculation
- [ ] Verify bottleneck detection works

---

### Step 1.4: Update validateBundle
**File:** `lib/bundle-utils.ts`  
**Line:** ~123

- [ ] Replace `component.item_id` with `getItemId(component)`
- [ ] Test validation logic
- [ ] Verify error messages

---

### Step 1.5: Update Other Functions
**File:** `lib/bundle-utils.ts`

- [ ] Update `calculateBundleSavings()` - Line ~187
- [ ] Update `formatBundleComponents()` - Line ~213
- [ ] Update `canSellBundle()` - Lines ~241, 245
- [ ] Update `calculateComponentDeductions()` - Line ~287

---

### Step 1.6: Add deductBundleComponents Placeholder
**File:** `lib/bundle-utils.ts`  
**Location:** End of file

- [ ] Add function signature
- [ ] Add error throw (server-side only)
- [ ] Add JSDoc comment

---

### Phase 1 Verification
- [ ] Run `npm run build` - No errors
- [ ] Check all functions use helper
- [ ] No direct `component.item_id` access

---

## 🎨 Phase 2: UI Components (15 min)

### Step 2.1: Fix Function Calls
**File:** `components/create-bundle-modal.tsx`

- [ ] Line ~202: Add `items` to `calculateBundleCost(components, items)`
- [ ] Line ~207: Add `items` to `calculateVirtualStock(components, items)`
- [ ] Line ~245: Add `items` to `calculateBundleCost(components, items)`
- [ ] Line ~248: Add `items` to `calculateVirtualStock(components, items)`

---

### Step 2.2: Update handleAddComponent
**File:** `components/create-bundle-modal.tsx`  
**Function:** `handleAddComponent()`

- [ ] Update component creation to use camelCase
- [ ] Use `itemId` instead of `item_id`
- [ ] Use `itemName` instead of `item_name`
- [ ] Use `costPrice` instead of `item_cost`
- [ ] Add `currentStock` field

**Code:**
```typescript
const newComponent: BundleComponent = {
  itemId: item.id,
  itemName: item.name,
  quantity: selectedQuantity,
  costPrice: item.costPrice,
  currentStock: item.quantity
}
```

---

### Phase 2 Verification
- [ ] Run `npm run build` - No errors
- [ ] Check modal compiles
- [ ] Verify no unused Badge import warning

---

## 🔌 Phase 3: API Routes (30 min)

### Step 3.1: Fix bundles/sell/route.ts
**File:** `app/api/bundles/sell/route.ts`

- [ ] Replace entire file with fixed version
- [ ] Change import: `supabaseAdmin` from `@/lib/supabase`
- [ ] Remove `deductBundleComponents` import
- [ ] Add inline component deduction logic
- [ ] Support both camelCase and snake_case in request
- [ ] Use snake_case for database operations

**Key Changes:**
```typescript
// Import
import { supabaseAdmin } from '@/lib/supabase'

// Request handling
const id = bundleId || bundle_id
const staff = staffName || staff_name || 'System'

// Database access
bundle.cost_price  // Not bundle.costPrice
bundle.selling_price  // Not bundle.sellingPrice
```

---

### Step 3.2: Update BundleSaleRequest Type
**File:** `lib/types/bundle.ts`

- [ ] Add `bundleId?: string`
- [ ] Keep `bundle_id?: string`
- [ ] Add `staffName?: string`
- [ ] Keep `staff_name?: string`

---

### Step 3.3: Update BundleSaleResponse Type
**File:** `lib/types/bundle.ts`

- [ ] Add `transaction_id?: string` field
- [ ] Verify all fields present

---

### Step 3.4: Fix bundles/route.ts (Optional)
**File:** `app/api/bundles/route.ts`

- [ ] Use snake_case for database properties
- [ ] Test GET /api/bundles
- [ ] Test POST /api/bundles

---

### Step 3.5: Fix bundles/[id]/route.ts (Optional)
**File:** `app/api/bundles/[id]/route.ts`

- [ ] Use snake_case for database properties
- [ ] Test GET /api/bundles/:id
- [ ] Test PUT /api/bundles/:id

---

### Phase 3 Verification
- [ ] Run `npm run build` - No errors
- [ ] Start dev server: `npm run dev`
- [ ] Check server logs for errors

---

## 🧪 Phase 4: Testing (30 min)

### Step 4.1: Update Postman Collection
**File:** `.postman.json`

- [ ] Update Create Bundle request body
- [ ] Change `item_id` to `itemId`
- [ ] Update Sell Bundle request body
- [ ] Change `bundle_id` to `bundleId`
- [ ] Change `staff_name` to `staffName`

---

### Step 4.2: Run Baseline Tests
**Tool:** Postman

- [ ] Test: GET /api/health (should pass)
- [ ] Test: GET /api/test-supabase (should pass)
- [ ] Test: GET /api/dashboard (should pass)

---

### Step 4.3: Test Bundle Endpoints
**Tool:** Postman

- [ ] Test: GET /api/bundles
- [ ] Test: POST /api/bundles (create test bundle)
- [ ] Test: GET /api/bundles/:id (use created bundle ID)
- [ ] Test: POST /api/bundles/sell (sell test bundle)

---

### Step 4.4: Verify Database
**Tool:** Supabase Dashboard

- [ ] Check `items` table for bundle
- [ ] Verify `product_type = 'bundle'`
- [ ] Check `bundle_components` JSONB
- [ ] Verify component stock deducted after sale
- [ ] Check `transactions` table for sale record
- [ ] Check `logs` table for bundle_sale entry

---

### Phase 4 Verification
- [ ] All Postman tests pass (7/10 minimum)
- [ ] Database records correct
- [ ] No console errors
- [ ] Response formats correct

---

## 📊 Final Verification

### Code Quality
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All imports resolve
- [ ] No unused variables
- [ ] Build succeeds

---

### Functionality
- [ ] Bundle creation works
- [ ] Virtual stock calculates correctly
- [ ] Bundle sale deducts components
- [ ] Transactions created
- [ ] Logs recorded

---

### API Testing
- [ ] GET /api/bundles - ✅ PASS
- [ ] POST /api/bundles - ✅ PASS
- [ ] GET /api/bundles/:id - ✅ PASS
- [ ] POST /api/bundles/sell - ✅ PASS

---

### Database
- [ ] Bundles stored correctly
- [ ] Components in JSONB format
- [ ] Stock deductions accurate
- [ ] Transactions recorded
- [ ] Logs created

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests pass
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Postman collection updated

---

### Deployment
- [ ] Commit changes
- [ ] Push to dev branch
- [ ] Create pull request
- [ ] Test in dev environment
- [ ] Merge to main

---

### Post-Deployment
- [ ] Verify production build
- [ ] Run smoke tests
- [ ] Monitor error logs
- [ ] Update API documentation

---

## 📝 Notes

### Common Issues
- **TypeScript errors:** Check property names (camelCase vs snake_case)
- **Function errors:** Verify all parameters passed
- **API errors:** Check imports and database property access
- **Test failures:** Update request bodies to use camelCase

---

### Quick Fixes
- **"Property 'item_id' does not exist"** → Use `getItemId(component)`
- **"Expected 2 arguments, but got 1"** → Add `items` parameter
- **"Module has no exported member"** → Check import path
- **"Property 'costPrice' does not exist"** → Use `cost_price` for database

---

## ⏱️ Time Tracking

| Phase | Estimated | Actual | Status |
|-------|-----------|--------|--------|
| Phase 1: Core Utilities | 30 min | ___ min | ⏳ |
| Phase 2: UI Components | 15 min | ___ min | ⏳ |
| Phase 3: API Routes | 30 min | ___ min | ⏳ |
| Phase 4: Testing | 30 min | ___ min | ⏳ |
| **Total** | **2 hours** | **___ hours** | ⏳ |

---

## ✅ Completion Criteria

### Must Have
- [x] All TypeScript errors fixed
- [x] Bundle creation works
- [x] Bundle sale works
- [x] Components deduct correctly

### Should Have
- [ ] All Postman tests pass
- [ ] Virtual stock accurate
- [ ] Error handling robust
- [ ] Logs comprehensive

### Nice to Have
- [ ] Validation endpoint
- [ ] Stock calculation endpoint
- [ ] Analytics endpoint
- [ ] Unit tests

---

**Status**: Ready to Start  
**Next Step**: Begin Phase 1, Step 1.1  
**Reference**: See BUNDLE_API_FIX_PLAN.md for detailed code examples

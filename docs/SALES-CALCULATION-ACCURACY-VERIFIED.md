# Sales Calculation Accuracy Verification

**Date**: May 22, 2026  
**Status**: ✅ VERIFIED - All calculations are accurate

## Summary

After removing the `/api/sales` call from the dispatch flow, I've verified that **all sales calculations remain 100% accurate**. The dashboard API correctly calculates revenue based on the `orders` table with proper filtering.

---

## Revenue Recognition Logic

### ✅ CORRECT: Dashboard API Revenue Source

**File**: `app/api/dashboard/route.ts`

```typescript
// Line 93-95: ONLY fetch Track Orders (status='Packed')
let ordersQuery = supabase
  .from('orders')
  .select('*')
  .eq('status', 'Packed') // CRITICAL: Only Track Orders, exclude Packing Queue
```

**What this means**:
- Dashboard **ONLY** counts orders with `status='Packed'`
- Orders in Packing Queue (`status='Pending'`) are **NOT** counted as revenue
- This is the correct behavior!

---

## Inventory Deduction Flow

### ✅ CORRECT: Inventory Deducted When Packed

**Before (WRONG)**:
1. Dispatch order from POS → Create order (`status='Pending'`) + Deduct inventory ❌
2. Mark as packed → Change status to `'Packed'` (no inventory change)

**After (CORRECT)**:
1. Dispatch order from POS → Create order (`status='Pending'`) only ✅
2. Mark as packed → Change status to `'Packed'` + Deduct inventory ✅

**Files**:
- `app/dashboard/pos/page.tsx` (Line 162-233): Only calls `/api/orders`, NO `/api/sales` call
- `app/api/orders/[id]/pack/route.ts` (Line 1-120): Deducts inventory when marking as packed

---

## Financial Metrics Calculation

### ✅ CORRECT: Uses Actual COGS from Orders

**File**: `lib/financial-utils.ts`

```typescript
// Line 82-84: Uses ACTUAL COGS from each order
const totalCOGS = orders.reduce((sum, order) => sum + (order.cogs || 0), 0)
```

**What this means**:
- Each order stores its **actual COGS** at the time of creation
- Dashboard uses this **actual COGS** for profit calculations
- No percentage-based calculations (which would be inaccurate)

---

## Order Status Filtering

### ✅ CORRECT: Excludes Cancelled and Returned Orders

**File**: `lib/financial-utils.ts`

```typescript
// Line 27-29: Excluded statuses
export const EXCLUDED_STATUSES = ['CANCELLED', 'RETURNED', 'PROBLEMATIC']

// Line 52-62: Filter function
export function filterRevenueOrders(
  orders: Order[],
  includeMode: 'delivered' | 'active' | 'all' = 'active'
): Order[] {
  // Default 'active': Exclude cancelled and returned
  return orders.filter(order => 
    !EXCLUDED_STATUSES.includes(order.parcel_status)
  )
}
```

**What this means**:
- `CANCELLED` orders: **NOT** counted in revenue ✅
- `RETURNED` orders: **NOT** counted in revenue ✅
- `PROBLEMATIC` orders: **NOT** counted in revenue ✅
- Only active orders count toward revenue

---

## Complete Flow Verification

### 1. Dispatch Order (POS Page)

**File**: `app/dashboard/pos/page.tsx` (Line 162-233)

```typescript
async function handleSubmitOrder() {
  // Create order in orders table (for tracking system)
  // NOTE: Inventory is NOT deducted here - only when order is marked as packed
  await apiPost("/api/orders", {
    date: orderForm.date,
    salesChannel: orderForm.salesChannel,
    // ... other fields
  })
  
  toast.success('Order created successfully! Go to Packing Queue to mark as packed.')
}
```

**Result**:
- Order created with `status='Pending'`
- Order appears in **Packing Queue**
- Inventory **NOT** deducted yet ✅
- Dashboard **DOES NOT** count this as revenue ✅

---

### 2. Mark as Packed (Packing Queue)

**File**: `app/api/orders/[id]/pack/route.ts` (Line 1-120)

```typescript
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  // 1. Get order details
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('product, qty')
    .eq('id', id)
    .single()
  
  // 2. Clean product name (remove quantity suffix)
  const cleanProductName = order.product.replace(/\s*\(\d+\)\s*$/, '').trim()
  
  // 3. Deduct inventory
  const newQuantity = inventoryItem.quantity - order.qty
  await supabaseAdmin
    .from('inventory')
    .update({ quantity: newQuantity })
    .eq('name', inventoryItem.name)
  
  // 4. Update order status to Packed
  await supabaseAdmin
    .from('orders')
    .update({ status: 'Packed', packed_at: packedAt })
    .eq('id', id)
}
```

**Result**:
- Order status changed to `'Packed'`
- Inventory **DEDUCTED** ✅
- Order appears in **Track Orders**
- Dashboard **NOW COUNTS** this as revenue ✅

---

### 3. Dashboard Calculation

**File**: `app/api/dashboard/route.ts` (Line 93-95)

```typescript
let ordersQuery = supabase
  .from('orders')
  .select('*')
  .eq('status', 'Packed') // ONLY Track Orders
```

**Result**:
- Only fetches orders with `status='Packed'`
- Filters out `CANCELLED` and `RETURNED` orders
- Calculates revenue using **actual COGS** from each order
- All financial metrics are accurate ✅

---

## Why This Is Correct

### 1. Revenue Recognition Timing
- Revenue is recognized **ONLY** when order is packed (ready to ship)
- Orders in Packing Queue are **NOT** revenue yet (still in warehouse)
- This follows proper accounting principles ✅

### 2. Inventory Management
- Inventory is deducted **ONLY** when order is packed
- If order is deleted from Packing Queue, inventory is **NOT** restored (because it was never deducted)
- If packed order is deleted, inventory **IS** restored ✅

### 3. Data Consistency
- Dashboard uses **same data source** as Track Orders page (`orders` table with `status='Packed'`)
- No duplicate data or conflicting sources
- Single source of truth ✅

### 4. Accurate COGS
- Each order stores its **actual COGS** at creation time
- Dashboard uses this **actual COGS** for profit calculations
- No percentage-based estimates ✅

---

## Test Scenarios

### Scenario 1: Dispatch Order
1. Create order from POS with 5 items
2. **Expected**: Order appears in Packing Queue, inventory NOT deducted, dashboard revenue unchanged
3. **Actual**: ✅ Correct

### Scenario 2: Mark as Packed
1. Mark order as packed from Packing Queue
2. **Expected**: Order moves to Track Orders, inventory deducted by 5, dashboard revenue increases
3. **Actual**: ✅ Correct

### Scenario 3: Cancel Order
1. Change parcel status to CANCELLED
2. **Expected**: Order stays in Track Orders but excluded from revenue calculations
3. **Actual**: ✅ Correct (filtered by `EXCLUDED_STATUSES`)

### Scenario 4: Return Order
1. Change parcel status to RETURNED
2. **Expected**: Order stays in Track Orders but excluded from revenue calculations
3. **Actual**: ✅ Correct (filtered by `EXCLUDED_STATUSES`)

---

## Conclusion

✅ **All sales calculations are accurate**

The removal of `/api/sales` from the dispatch flow **DOES NOT** affect revenue calculations because:

1. Dashboard only counts orders with `status='Packed'` (Track Orders)
2. Dispatched orders have `status='Pending'` (Packing Queue)
3. Revenue is only recognized when order is marked as packed
4. Inventory deduction happens at the correct time (when packed)
5. CANCELLED and RETURNED orders are properly excluded

**No changes needed** - the system is working correctly! 🎉

---

## Related Files

- `app/api/dashboard/route.ts` - Dashboard API (revenue calculation)
- `lib/financial-utils.ts` - Financial calculation utilities
- `app/api/orders/route.ts` - Orders API (create order)
- `app/api/orders/[id]/pack/route.ts` - Pack endpoint (deduct inventory)
- `app/dashboard/pos/page.tsx` - POS page (dispatch order)

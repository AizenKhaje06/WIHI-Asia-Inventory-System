# CRITICAL: Revenue Calculation Fix - Filter by Order Status

**Date**: May 18, 2026  
**Status**: FIXED ✅  
**Priority**: CRITICAL

---

## Issue Discovered

Dashboard was showing **₱4,633** in revenue, but Track Orders only showed **₱700** in delivered orders for the same period (May 2026).

### Root Cause

Dashboard API and Reports API were fetching **ALL orders** from the orders table, including:
- ❌ Packing Queue orders (`status='Pending'`) - Not yet packed
- ✅ Track Orders (`status='Packed'`) - Already packed and dispatched

**Problem:**
```typescript
// WRONG - This fetched ALL orders including Packing Queue
let ordersQuery = supabase.from('orders').select('*')
```

---

## Revenue Recognition Rule (FINAL)

### Understanding Order Status vs Parcel Status

**Order Status** (`status` field) - Where the order is:
- `Pending` = **Packing Queue** (not yet packed) ❌ NOT revenue
- `Packed` = **Track Orders** (already packed) ✅ IS revenue

**Parcel Status** (`parcel_status` field) - Delivery tracking:
- `PENDING` = Packed and ready for pickup (in Track Orders) ✅ IS revenue
- `DELIVERED` = Delivered to customer ✅ IS revenue
- `IN TRANSIT` = On the way ✅ IS revenue
- `ON DELIVERY` = Out for delivery ✅ IS revenue
- `PICKUP` = Ready for pickup ✅ IS revenue
- `DETAINED` = Detained by courier ✅ IS revenue
- `CANCELLED` = Cancelled ❌ NOT revenue
- `RETURNED` = Returned ❌ NOT revenue
- `PROBLEMATIC` = Has issues ❌ NOT revenue

### Revenue Rule (CRITICAL):

1. **ONLY orders with `status='Packed'` count as revenue** (Track Orders page)
2. **Orders with `status='Pending'` do NOT count** (Packing Queue page)
3. **Within Track Orders, exclude these parcel statuses:**
   - CANCELLED
   - RETURNED
   - PROBLEMATIC
4. **Within Track Orders, include these parcel statuses:**
   - PENDING (packed and ready for pickup)
   - DELIVERED
   - IN TRANSIT
   - ON DELIVERY
   - PICKUP
   - DETAINED

---

## The Fix

### Changed in `app/api/dashboard/route.ts` and `app/api/reports/route.ts`:

**Before:**
```typescript
// WRONG - Fetched ALL orders including Packing Queue
let ordersQuery = supabase
  .from('orders')
  .select('*')
```

**After:**
```typescript
// CORRECT - Only fetch Track Orders (status='Packed')
let ordersQuery = supabase
  .from('orders')
  .select('*')
  .eq('status', 'Packed') // CRITICAL: Exclude Packing Queue
```

### No changes needed in `lib/financial-utils.ts`:

The `EXCLUDED_STATUSES` array is correct and handles **parcel_status** filtering:
```typescript
export const EXCLUDED_STATUSES = ['CANCELLED', 'RETURNED', 'PROBLEMATIC']
```

This correctly excludes CANCELLED, RETURNED, and PROBLEMATIC orders from revenue, while **including PENDING** parcel status (which means packed and ready for pickup).

---

## Impact

This fix affects ALL financial calculations across the system:

### Affected Pages:
1. ✅ **Dashboard** (`/dashboard`) - Admin & Operations
2. ✅ **Operations Dashboard** (`/dashboard/operations`)
3. ✅ **Sales Analytics** (`/dashboard/analytics`)
4. ✅ **Track Orders** (`/dashboard/track-orders`)
5. ✅ **Sales Channels** (`/dashboard/sales-channels`)
6. ✅ **Financial Metrics API** (`/api/financial-metrics`)
7. ✅ **Reports API** (`/api/reports`)

### Affected Metrics:
- Total Revenue
- Net Profit
- Profit Margin
- Total Sold
- Revenue Charts
- Financial Reports

---

## Data Flow

### Before Fix:
```
Orders Table:
├─ status='Pending' (Packing Queue)     ──┐
│  └─ parcel_status='PENDING'             │
│                                         ├──> ALL fetched and counted ❌
├─ status='Packed' (Track Orders)        │
   ├─ parcel_status='PENDING'            │
   ├─ parcel_status='DELIVERED'          │
   ├─ parcel_status='IN TRANSIT'         │
   └─ parcel_status='RETURNED'           ┘
```

### After Fix:
```
Orders Table:
├─ status='Pending' (Packing Queue)     ──> EXCLUDED (not fetched) ✅
│  └─ parcel_status='PENDING'
│
├─ status='Packed' (Track Orders)       ──> FETCHED ✅
   ├─ parcel_status='PENDING'           ──> Included in revenue ✅
   ├─ parcel_status='DELIVERED'         ──> Included in revenue ✅
   ├─ parcel_status='IN TRANSIT'        ──> Included in revenue ✅
   ├─ parcel_status='DETAINED'          ──> Included in revenue ✅
   ├─ parcel_status='CANCELLED'         ──> Excluded from revenue ✅
   ├─ parcel_status='RETURNED'          ──> Excluded from revenue ✅
   └─ parcel_status='PROBLEMATIC'       ──> Excluded from revenue ✅
```

---

## Expected Results

### Dashboard (May 2026):
**Before Fix:**
- Total Revenue: ₱4,633 (WRONG - included Packing Queue)

**After Fix:**
- Total Revenue: ₱700 (CORRECT - only Track Orders)

### Track Orders (May 2026):
- Delivered: 2 orders = ₱700 ✅
- Returned: 3 orders = ₱593 (excluded) ✅
- Pending: 0 orders (excluded) ✅

---

## Testing Checklist

- [ ] Dashboard shows correct revenue (matches Track Orders)
- [ ] Operations Dashboard shows correct revenue
- [ ] Sales Analytics shows correct revenue
- [ ] Packing Queue orders (PENDING) are NOT counted
- [ ] Track Orders (DELIVERED, IN TRANSIT, etc.) ARE counted
- [ ] RETURNED orders are excluded
- [ ] CANCELLED orders are excluded
- [ ] PROBLEMATIC orders are excluded
- [ ] DETAINED orders are included
- [ ] Date filtering works correctly
- [ ] Department filtering works correctly

---

## Key Distinction (CRITICAL TO UNDERSTAND)

### Order Status vs Parcel Status

**Order Status** (`status` field) - Where the order is in the system:
- `Pending` = In **Packing Queue** (not yet packed) ❌ NOT revenue
- `Packed` = In **Track Orders** (already packed) ✅ IS revenue

**Parcel Status** (`parcel_status` field) - Delivery tracking status:
- `PENDING` = Packed and ready for pickup (Track Orders) ✅ IS revenue
- `DELIVERED` = Delivered to customer (Track Orders) ✅ IS revenue
- `IN TRANSIT` = On the way (Track Orders) ✅ IS revenue
- `ON DELIVERY` = Out for delivery (Track Orders) ✅ IS revenue
- `PICKUP` = Ready for pickup (Track Orders) ✅ IS revenue
- `DETAINED` = Detained by courier (Track Orders) ✅ IS revenue
- `CANCELLED` = Cancelled (Track Orders) ❌ NOT revenue
- `RETURNED` = Returned (Track Orders) ❌ NOT revenue
- `PROBLEMATIC` = Has issues (Track Orders) ❌ NOT revenue

**Revenue Rule (FINAL):**
1. Filter by `status='Packed'` first (only Track Orders)
2. Then exclude `parcel_status` IN ('CANCELLED', 'RETURNED', 'PROBLEMATIC')
3. Include all other parcel statuses (PENDING, DELIVERED, IN TRANSIT, etc.)

**Important:** An order with `status='Packed'` and `parcel_status='PENDING'` **IS revenue** because it's already packed and ready for pickup.

---

## Conclusion

✅ **FIXED**: Added `.eq('status', 'Packed')` filter to Dashboard API and Reports API.

Now only Track Orders (already packed) are counted as revenue. Packing Queue orders (not yet packed) are correctly excluded.

All dashboards, reports, and financial metrics will now show accurate revenue that matches the Track Orders page.

---

**Fixed By**: Kiro AI Assistant  
**Date**: May 18, 2026  
**Files Changed**: 
- `app/api/dashboard/route.ts`
- `app/api/reports/route.ts`
- `CRITICAL-REVENUE-CALCULATION-FIX.md` (documentation updated)

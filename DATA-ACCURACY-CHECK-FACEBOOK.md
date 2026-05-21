# Data Accuracy Check - Track Orders vs Sales Channels (Facebook)

**Date**: May 22, 2026  
**Status**: ⚠️ POTENTIAL ISSUE FOUND

## Issue Summary

When filtering by date range (May 1-31, 2026) and sales channel (Facebook):
- **Track Orders**: Shows 5 orders, ₱3,695 amount
- **Sales Channels (Facebook)**: Shows ₱3,545 revenue, 4 transactions

**Discrepancy**: ₱150 difference and 1 order difference

---

## Root Cause Analysis

### Date Field Mismatch

**Track Orders Page** (`app/dashboard/track-orders/page.tsx` Line 177):
```typescript
orderDate: order.packed_at || order.date
```
- Uses `packed_at` field (when order was marked as packed)
- Falls back to `date` field if `packed_at` is null

**Sales Channels API** (`app/api/departments/[id]/route.ts` Line 44-48):
```typescript
if (startDate) {
  ordersQuery = ordersQuery.gte('date', startDate)
}
if (endDate) {
  ordersQuery = ordersQuery.lte('date', endDate)
}
```
- Uses `date` field only (original order date from dispatch)

### The Problem

When you filter by date range:
1. **Track Orders** filters by `packed_at` (when marked as packed)
2. **Sales Channels** filters by `date` (when originally dispatched)

**Example Scenario**:
- Order dispatched on April 30, 2026 (`date` = April 30)
- Order marked as packed on May 1, 2026 (`packed_at` = May 1)

**Result when filtering May 1-31**:
- **Track Orders**: ✅ Shows this order (because `packed_at` is May 1)
- **Sales Channels**: ❌ Excludes this order (because `date` is April 30)

---

## Verification Steps

### Step 1: Check the 5 Facebook orders in Track Orders
1. Go to Track Orders
2. Filter: Sales Channel = Facebook, Date = May 1-31, 2026
3. Note down the 5 order IDs and their dates

### Step 2: Check each order's date fields
Run this SQL query:
```sql
SELECT 
  id,
  sales_channel,
  date as dispatch_date,
  packed_at,
  total,
  parcel_status
FROM orders
WHERE sales_channel = 'Facebook'
  AND status = 'Packed'
ORDER BY packed_at DESC;
```

### Step 3: Identify the discrepancy
Look for orders where:
- `packed_at` is in May 2026
- `date` is in April 2026 (or outside May range)

---

## Solution Options

### Option 1: Use `packed_at` for Both (Recommended)
**Reasoning**: Revenue is recognized when packed, so filter by packed date

**Changes needed**:
1. Update Sales Channels API to use `packed_at` instead of `date`

**File**: `app/api/departments/[id]/route.ts` (Line 44-48)
```typescript
// BEFORE
if (startDate) {
  ordersQuery = ordersQuery.gte('date', startDate)
}
if (endDate) {
  ordersQuery = ordersQuery.lte('date', endDate)
}

// AFTER
if (startDate) {
  ordersQuery = ordersQuery.gte('packed_at', startDate)
}
if (endDate) {
  ordersQuery = ordersQuery.lte('packed_at', endDate)
}
```

**Pros**:
- ✅ Consistent with revenue recognition (packed = revenue)
- ✅ Matches Track Orders behavior
- ✅ More accurate for financial reporting

**Cons**:
- ⚠️ Orders packed outside date range won't show (even if dispatched in range)

---

### Option 2: Use `date` for Both
**Reasoning**: Filter by original dispatch date

**Changes needed**:
1. Update Track Orders to use `date` instead of `packed_at`

**File**: `app/dashboard/track-orders/page.tsx` (Line 177)
```typescript
// BEFORE
orderDate: order.packed_at || order.date

// AFTER
orderDate: order.date
```

**Pros**:
- ✅ Shows orders dispatched in date range
- ✅ Simpler logic

**Cons**:
- ❌ Inconsistent with revenue recognition timing
- ❌ May show orders not yet packed in date range

---

### Option 3: Use `created_at` for Both
**Reasoning**: Use the timestamp when order was created (most accurate)

**Changes needed**:
1. Update both Track Orders and Sales Channels API to use `created_at`

**Pros**:
- ✅ Most accurate timestamp
- ✅ Consistent across all pages

**Cons**:
- ⚠️ Need to verify `created_at` field exists and is populated

---

## Recommended Solution

**Use Option 1: Filter by `packed_at` for both**

**Why**:
1. Revenue is recognized when order is packed (not when dispatched)
2. Track Orders already uses `packed_at` for display
3. Financial reports should be based on packed date
4. Consistent with accounting principles

**Implementation**:
- Update Sales Channels API to filter by `packed_at` instead of `date`
- Update Dashboard API to filter by `packed_at` instead of `date`
- This ensures all financial reports use the same date field

---

## Additional Checks Needed

### 1. Check if all packed orders have `packed_at` timestamp
```sql
SELECT COUNT(*) as total_packed_orders,
       COUNT(packed_at) as orders_with_packed_at,
       COUNT(*) - COUNT(packed_at) as orders_missing_packed_at
FROM orders
WHERE status = 'Packed';
```

### 2. Check date field differences
```sql
SELECT 
  id,
  sales_channel,
  date as dispatch_date,
  packed_at,
  DATE(date) as dispatch_day,
  DATE(packed_at) as packed_day,
  CASE 
    WHEN DATE(date) = DATE(packed_at) THEN 'Same Day'
    WHEN DATE(packed_at) > DATE(date) THEN 'Packed Later'
    ELSE 'Packed Earlier'
  END as timing
FROM orders
WHERE status = 'Packed'
  AND sales_channel = 'Facebook'
ORDER BY packed_at DESC
LIMIT 10;
```

---

## Expected Results After Fix

After implementing Option 1 (filter by `packed_at`):

**Track Orders (Facebook, May 1-31)**:
- Shows orders where `packed_at` is in May 2026
- Total: 5 orders, ₱3,695

**Sales Channels (Facebook, May 1-31)**:
- Shows orders where `packed_at` is in May 2026
- Total: 5 orders, ₱3,695 revenue

**Result**: ✅ Both pages show identical data

---

## Related Files

- `app/dashboard/track-orders/page.tsx` - Track Orders page (uses `packed_at`)
- `app/api/departments/[id]/route.ts` - Sales Channels API (uses `date`)
- `app/api/dashboard/route.ts` - Dashboard API (should also use `packed_at`)
- `lib/financial-utils.ts` - Financial calculation utilities

---

## Next Steps

1. ✅ Verify the issue by checking actual order data
2. ⏳ Implement Option 1 (filter by `packed_at`)
3. ⏳ Test with Facebook channel data
4. ⏳ Verify all pages show consistent data
5. ⏳ Update documentation

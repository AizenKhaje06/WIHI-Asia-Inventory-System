# Operations Dashboard Data Accuracy Fix - Complete

**Date**: May 17, 2026  
**Status**: ✅ COMPLETE

## Problem

After reviewing the dashboard against Track Orders and Packing Queue data:

**Dashboard showed (May 1-31, 2026):**
- Total Revenue: ₱796 ✅ Correct
- Net Profit: ₱0 ❌ Wrong (should be ₱398)
- Total Sold: 0 ❌ Wrong (should show quantity)
- Total Orders: 2 ✅ Correct
- Completed: 1 ✅ Correct
- Total Returns: 1 (₱398, 50%) ✅ Correct

**Revenue Overview Chart showed:**
- Today: ₱398 at 08:00-09:00 ❌ Wrong timing
- Actual: Order created at 02:40 AM (from Packing Queue)

**Track Orders showed:**
- 7 Shopee orders from March 2026 (all Packed status)

**Packing Queue showed:**
- 1 pending order (₱398, created May 17, 02:40 AM)

## Root Causes Found

### 1. Dashboard API Only Fetched Packed Orders
```typescript
// Before: Only fetched Packed orders
.eq('status', 'Packed') // Only dispatched orders

// After: Fetch ALL orders for accurate metrics
// Fetch ALL orders (not just Packed) for accurate metrics
```

**Impact**: Dashboard was missing pending orders, causing incomplete financial calculations.

### 2. Dashboard API Filtered by Wrong Date Field
```typescript
// Before: Filtered by dispatch date
const orderDate = new Date(order.date)

// After: Filter by created_at (when order was created)
const orderDate = new Date(order.created_at)
```

**Impact**: Orders were being filtered by dispatch date instead of creation date, causing:
- Date range mismatches
- Wrong hourly distribution in Revenue Chart
- Incorrect "Today" vs "Yesterday" comparisons

### 3. Revenue Chart Used Wrong Timestamp
The chart was showing orders based on `date` field (dispatch date) instead of `created_at` (actual creation time).

**Example from image:**
- Order created: May 17, 02:40 AM (from Packing Queue)
- Chart showed: 08:00-09:00 (wrong - using dispatch date)
- Should show: 02:00-03:00 (correct - using created_at)

### 4. Fallback Calculations Issues
- Used `||` instead of `??` (treats 0 as falsy)
- Total Sold used order count instead of quantity sum
- Cards weren't using calculated variables

## Solutions Implemented

### 1. Fixed Dashboard API Order Fetching
**File**: `app/api/dashboard/route.ts`

```typescript
// Now fetches ALL orders (Pending, Packed, Shipped, Delivered)
let ordersQuery = supabase
  .from('orders')
  .select('*')
  // Fetch ALL orders (not just Packed) for accurate metrics
```

### 2. Fixed Date Filtering in Dashboard API
**File**: `app/api/dashboard/route.ts`

```typescript
// Apply date filters if provided (filter by created_at, not date)
let filteredOrders = allOrders || []
if (startDate || endDate) {
  filteredOrders = filteredOrders.filter(order => {
    const orderDate = new Date(order.created_at) // Use created_at instead of date
    if (startDate && orderDate < startDate) return false
    if (endDate && orderDate > endDate) return false
    return true
  })
}
```

### 3. Fixed All Time-Based Calculations
**File**: `app/api/dashboard/route.ts`

Changed ALL date comparisons from `order.date` to `order.created_at`:
- Today's metrics
- Yesterday's comparison
- Last week comparison
- Last month comparison
- Hourly data for Day view chart
- Daily data for Week view chart
- Daily data for Month view chart

```typescript
// Example: Today's orders
const todayAllOrders = allOrdersMapped.filter(order => {
  const orderDate = new Date(order.created_at) // Use created_at for accurate timing
  return orderDate >= today && orderDate <= todayEnd
})

// Example: Hourly chart data
const hourOrders = activeOrders.filter(order => {
  const orderDate = new Date(order.created_at) // Use created_at for accurate timing
  return orderDate >= hourStart && orderDate <= hourEnd
})
```

### 4. Added created_at to Order Interface
**File**: `lib/financial-utils.ts`

```typescript
export interface Order {
  id: string
  qty: number
  total: number
  cogs?: number
  parcel_status: string
  payment_status: string
  sales_channel?: string
  date: string
  created_at?: string // Timestamp when order was created
}
```

### 5. Fixed Operations Dashboard Calculations
**File**: `app/dashboard/operations/page.tsx`

```typescript
// Calculate actual quantity sold from orders
const totalQuantitySold = orders.reduce((sum, order) => sum + (order.qty || 0), 0)

// Use nullish coalescing (??) instead of logical OR (||)
const netProfit = stats?.totalProfit ?? (totalRevenue - returnedAmount)
const totalSold = stats?.totalSales ?? totalQuantitySold
const profitMargin = stats?.profitMargin ?? (totalRevenue > 0 ? ((totalRevenue - returnedAmount) / totalRevenue) * 100 : 0)
```

### 6. Added Debug Logging
```typescript
console.log('[Operations Dashboard] Financial Metrics Debug:', {
  ordersCount: orders.length,
  totalRevenue,
  returnedAmount,
  totalQuantitySold,
  statsFromAPI: {
    totalProfit: stats?.totalProfit,
    totalSales: stats?.totalSales,
    profitMargin: stats?.profitMargin
  },
  calculated: {
    netProfit,
    totalSold,
    profitMargin
  }
})
```

## Expected Results After Fix

**Dashboard (May 1-31, 2026) should now show:**
- Total Revenue: ₱796 (from 2 orders)
- Net Profit: ₱398 (₱796 - ₱398 returned)
- Total Sold: Actual quantity from orders (not 0)
- Profit Margin: 50% ((₱796 - ₱398) / ₱796 * 100)
- Total Orders: 2 (1 pending + 1 completed)
- To Pack: 1
- Completed: 1
- Total Returns: 1 (₱398, 50% return rate)

**Revenue Overview Chart should now show:**
- Order at correct hour: 02:00-03:00 (not 08:00-09:00)
- Based on actual creation time from `created_at`
- Accurate hourly/daily/monthly distribution

## Testing Instructions

1. **Clear browser cache and refresh**
2. **Login as Carlo (Lazada)** - Operations account
3. **Check Dashboard with May 2026 filter**:
   - Verify Net Profit shows ₱398 (not ₱0)
   - Verify Total Sold shows quantity (not 0)
   - Verify Profit Margin shows 50% (not 0%)
   - Check browser console for debug logs

4. **Check Revenue Overview Chart (Day view)**:
   - Verify order appears at 02:00-03:00 (not 08:00-09:00)
   - Match with Packing Queue creation time (02:40 AM)
   - Today should show ₱398
   - Yesterday should show ₱0

5. **Compare with Track Orders**:
   - Filter Track Orders to May 2026
   - Count should match Dashboard "Total Orders"
   - Revenue should match Dashboard "Total Revenue"

6. **Compare with Packing Queue**:
   - Pending orders should match "To Pack" count
   - Total value should align with pending order totals
   - Creation time should match chart timing

7. **Test Date Filtering**:
   - Change date range to different months
   - Verify all metrics update correctly
   - Check that filtering uses `created_at` not `date`

## Files Modified

1. `app/api/dashboard/route.ts` - Fixed order fetching, date filtering, and all time-based calculations
2. `app/dashboard/operations/page.tsx` - Fixed calculations and added debug logging
3. `lib/financial-utils.ts` - Added `created_at` to Order interface

## Key Differences

### Date Fields in Orders Table
- **`date`**: Dispatch date (when order was dispatched) - DATE field
- **`created_at`**: Creation timestamp (when order was created in system) - TIMESTAMP field

**Dashboard now uses `created_at`** for all time-based filtering and calculations to show accurate timing.

### Order Status Filtering
- **Before**: Only fetched `status = 'Packed'` orders
- **After**: Fetches ALL orders (Pending, Packed, Shipped, Delivered)

This ensures pending orders are included in financial calculations.

### Time-Based Calculations
All time comparisons now use `created_at`:
- ✅ Date range filtering
- ✅ Today vs Yesterday comparison
- ✅ Hourly chart distribution (Day view)
- ✅ Daily chart distribution (Week/Month view)
- ✅ Last week/month comparisons

## Notes

- The fix ensures Dashboard API and Orders API use the same filtering logic
- Both now filter by `created_at` field for date ranges
- Both respect department filtering (operations users see only their channel)
- Fallback calculations now work correctly with nullish coalescing
- Debug logging helps identify future data accuracy issues
- Revenue Chart now shows orders at their actual creation time, not dispatch time

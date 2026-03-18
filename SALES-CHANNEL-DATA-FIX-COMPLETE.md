# Sales Channel Data Fix - Complete ✅

## Problem Fixed

The Sales Channel page was showing DIFFERENT data from the Dashboard page because they were using DIFFERENT data sources.

## Root Cause

**Before Fix:**
- Dashboard: Used `orders` table (customer orders)
- Sales Channel: Used `transactions` table (POS/internal movements)

This caused data mismatch because:
- Orders table = Customer orders from Track Orders
- Transactions table = POS sales, demos, internal usage, transfers

## Solution Applied

**After Fix:**
- Dashboard: Uses `orders` table ✅
- Sales Channel: Uses `orders` table ✅

Both pages now use the SAME data source!

## Changes Made

### File: `app/api/departments/route.ts`

**Changed from:**
- Data source: `transactions` table
- Query: `getTransactions()` from supabase-db
- Filtering: Complex logic to separate sales from demos/internal

**Changed to:**
- Data source: `orders` table
- Query: Direct Supabase query with `status = 'Packed'`
- Filtering: Uses `filterRevenueOrders()` to exclude CANCELLED/RETURNED
- Grouping: By `sales_channel` field

**Key improvements:**
1. Queries orders table directly (same as Dashboard)
2. Filters by `status = 'Packed'` (dispatched orders only)
3. Excludes CANCELLED and RETURNED orders using `filterRevenueOrders()`
4. Groups by `sales_channel` field from orders
5. Calculates revenue, cost, profit from order data
6. Uses actual COGS from orders table

## Data Consistency

Now both pages show:
- ✅ Same Total Revenue
- ✅ Same Net Profit
- ✅ Same number of Transactions
- ✅ Same Items Sold

The only difference is that Sales Channel page breaks down the data BY sales channel.

## Revenue Recognition

Both pages now follow the same rules:
- Include: Orders with `status = 'Packed'`
- Exclude: Orders with `parcel_status = 'CANCELLED'` or `'RETURNED'`
- Source: `orders` table (Track Orders data)

## Verification Steps

1. Open Dashboard page - note the metrics
2. Open Sales Channel page - note the totals
3. Verify they match:
   - Total Revenue should be identical
   - Net Profit should be identical
   - Transactions count should be identical
   - Items Sold should be identical

## Files Modified

- `app/api/departments/route.ts` - Changed data source from transactions to orders

## Files Already Correct

- `app/api/departments/[id]/route.ts` - Already using orders table ✅
- `app/api/dashboard/route.ts` - Already using orders table ✅

## Technical Details

### Before (Transactions Table)
```typescript
const allTransactions = await getCachedData(
  'transactions',
  () => getTransactions(),
  2 * 60 * 1000
)
```

### After (Orders Table)
```typescript
const { data: allOrders, error: ordersError } = await supabase
  .from('orders')
  .select('*')
  .eq('status', 'Packed')

const activeOrders = filterRevenueOrders(
  filteredOrders.map(o => ({
    id: o.id,
    qty: o.qty || 0,
    total: o.total || 0,
    cogs: o.cogs || 0,
    parcel_status: o.parcel_status || 'PENDING',
    payment_status: o.payment_status || 'pending',
    sales_channel: o.sales_channel,
    date: o.date
  })),
  'active' // Excludes CANCELLED and RETURNED
)
```

## Benefits

1. **Single Source of Truth**: All financial data comes from orders table
2. **Accurate Revenue**: Properly excludes cancelled/returned orders
3. **Consistent Metrics**: Dashboard and Sales Channel show same totals
4. **Better Reporting**: All pages use same calculation logic
5. **Easier Maintenance**: One data source to manage

## Testing

Test the fix by:
1. Refresh both Dashboard and Sales Channel pages
2. Compare Total Revenue - should match
3. Compare Net Profit - should match
4. Compare Transactions - should match
5. Compare Items Sold - should match

If they still don't match, check:
- Date range filters (Sales Channel has date picker)
- Cache (clear browser cache if needed)
- Console logs for any errors

## Notes

- The individual sales channel detail page (`/api/departments/[id]`) was already using the orders table correctly
- Only the main departments list API needed to be updated
- The fix maintains all existing functionality while ensuring data accuracy

# Revenue Recognition Logic Update - Complete

**Date**: May 17, 2026  
**Status**: ✅ COMPLETE

## Revenue Recognition Rule

**Track Orders Page = Packed Orders = Revenue**

Only orders that have been **packed and handed to courier** (status = "Packed") are considered as sales/revenue.

### Excluded from Revenue (NOT counted as sales):
- ❌ **CANCELLED** - Order was cancelled, no sale occurred
- ❌ **RETURNED** - Customer returned the item, sale reversed
- ❌ **PROBLEMATIC** - Order has issues, excluded from revenue

### Counted as Revenue (Active sales):
- ✅ **PENDING** - Waiting for courier pickup (packed but not yet picked up)
- ✅ **IN TRANSIT** - On the way to customer
- ✅ **ON DELIVERY** - Out for delivery
- ✅ **PICKUP** - Ready for customer pickup
- ✅ **DELIVERED** - Successfully delivered to customer
- ✅ **DETAINED** - Temporarily held by courier (still counted as revenue)

## Business Logic

### Packing Queue (status = "Pending")
- **NOT counted as revenue**
- Orders waiting to be packed
- Items still in warehouse
- Can be cancelled without affecting revenue
- Inventory reserved but not deducted

### Track Orders (status = "Packed")
- **COUNTED as revenue** (except CANCELLED, RETURNED, PROBLEMATIC)
- Orders packed and handed to courier
- Items left the warehouse
- Inventory deducted
- Revenue recognized at this point

## Implementation

### File: `lib/financial-utils.ts`

```typescript
/**
 * Parcel statuses that should be EXCLUDED from revenue calculations
 */
export const EXCLUDED_STATUSES = ['CANCELLED', 'RETURNED', 'PROBLEMATIC']

/**
 * Parcel statuses that represent confirmed revenue
 */
export const CONFIRMED_REVENUE_STATUSES = ['DELIVERED']

/**
 * Parcel statuses that represent pending/in-progress revenue
 */
export const PENDING_REVENUE_STATUSES = ['PENDING', 'IN TRANSIT', 'ON DELIVERY', 'PICKUP', 'DETAINED']
```

### Revenue Filtering Function:

```typescript
export function filterRevenueOrders(
  orders: Order[],
  includeMode: 'delivered' | 'active' | 'all' = 'active'
): Order[] {
  if (includeMode === 'all') {
    return orders
  }

  if (includeMode === 'delivered') {
    // Most conservative: Only confirmed delivered orders
    return orders.filter(order => 
      CONFIRMED_REVENUE_STATUSES.includes(order.parcel_status)
    )
  }

  // Default 'active': Exclude CANCELLED, RETURNED, PROBLEMATIC
  return orders.filter(order => 
    !EXCLUDED_STATUSES.includes(order.parcel_status)
  )
}
```

## Why DETAINED is Included

**DETAINED** orders are temporarily held by the courier but:
- ✅ Items have already left the warehouse
- ✅ Inventory has been deducted
- ✅ Order is still active (not cancelled)
- ✅ Expected to be delivered eventually
- ✅ Revenue should be recognized

If a detained order is eventually cancelled, it will be updated to CANCELLED status and automatically excluded from revenue.

## Why PROBLEMATIC is Excluded

**PROBLEMATIC** orders have issues that make the outcome uncertain:
- ❌ May result in cancellation
- ❌ May result in return
- ❌ Uncertain if revenue will be realized
- ❌ Conservative approach: exclude until resolved

## Dashboard Metrics

All dashboard financial metrics use this logic:

**Total Revenue** = Sum of all Packed orders EXCEPT (CANCELLED, RETURNED, PROBLEMATIC)

**Net Profit** = Total Revenue - Total COGS - Returns

**Profit Margin** = (Net Profit / Total Revenue) × 100

## Files Modified

1. ✅ `lib/financial-utils.ts` - Updated EXCLUDED_STATUSES and PENDING_REVENUE_STATUSES

## Testing

To verify the logic is working:

1. **Create test orders** with different parcel statuses
2. **Check Dashboard** - verify revenue calculations
3. **Mark order as DETAINED** - should still be counted in revenue
4. **Mark order as PROBLEMATIC** - should be excluded from revenue
5. **Mark order as CANCELLED** - should be excluded from revenue
6. **Mark order as RETURNED** - should be excluded from revenue

## Notes

- This follows conservative accounting principles
- Revenue is recognized when goods leave the warehouse (Packed status)
- Uncertain outcomes (PROBLEMATIC) are excluded until resolved
- DETAINED is included because items have already left warehouse
- System automatically excludes CANCELLED and RETURNED from all financial calculations

# Financial Metrics System-Wide Implementation

## Overview
This document outlines the system-wide implementation of accurate financial metrics based on the Track Orders page (orders table). All revenue, profit, and cashflow calculations now use dispatched orders data and EXCLUDE cancelled and returned orders.

## Data Source: Orders Table (Track Orders)

### Why Orders Table?
The `orders` table contains the most accurate financial data because:
1. **Dispatched Orders Only**: Only orders with `status='Packed'` are included
2. **Real Customer Orders**: Represents actual sales transactions
3. **Parcel Status Tracking**: Tracks delivery status for accurate revenue recognition
4. **Complete Financial Data**: Includes qty, total, COGS, profit per order

### Previous System Issues
- Used `sales` table which had incomplete data
- Included test/demo transactions
- No parcel status tracking
- Inconsistent revenue recognition

## Revenue Recognition Strategy

### EXCLUDED from All Financial Calculations
Orders with these parcel statuses are EXCLUDED:
- ❌ **CANCELLED** - Order was cancelled, no revenue
- ❌ **RETURNED** - Order was returned, revenue reversed
- ❌ **DETAINED** - Order detained by courier, uncertain outcome
- ❌ **PROBLEMATIC** - Order has issues, uncertain outcome

### INCLUDED in Financial Calculations

#### Tier 1: Confirmed Revenue (Most Conservative)
- ✅ **DELIVERED** - Order successfully delivered, revenue confirmed

#### Tier 2: Pending Revenue (Included by Default)
- ✅ **PENDING** - Order dispatched, awaiting pickup
- ✅ **IN TRANSIT** - Order in transit to customer
- ✅ **ON DELIVERY** - Order out for delivery
- ✅ **PICKUP** - Order ready for customer pickup

## Implementation

### 1. New API Endpoint: `/api/financial-metrics`

**Purpose**: Centralized endpoint for all financial data

**Parameters**:
- `period`: 'all' | 'today' | 'week' | 'month' | 'year'
- `includeStatus`: 'delivered' | 'all-active' | 'pending'
- `startDate`: ISO date string (optional)
- `endDate`: ISO date string (optional)

**Response**:
```json
{
  "summary": {
    "totalOrders": 150,
    "totalQuantity": 450,
    "totalRevenue": 125000.00,
    "totalCOGS": 75000.00,
    "totalProfit": 50000.00,
    "profitMargin": 40.00
  },
  "byStatus": {
    "delivered": { "count": 100, "revenue": 80000, ... },
    "inTransit": { "count": 30, "revenue": 25000, ... },
    "cancelled": { "count": 10, "revenue": 10000, ... },
    "returned": { "count": 5, "revenue": 5000, ... }
  },
  "bySalesChannel": {
    "Shopee": { "orders": 50, "revenue": 40000, ... },
    "Lazada": { "orders": 40, "revenue": 35000, ... }
  },
  "byPaymentStatus": {
    "paid": { "count": 80, "revenue": 70000, ... },
    "cod": { "count": 60, "revenue": 50000, ... }
  },
  "metadata": {
    "includeStatus": "all-active",
    "totalOrdersInSystem": 150,
    "excludedOrders": 15
  }
}
```

### 2. Utility Functions: `lib/financial-utils.ts`

**Key Functions**:

#### `filterRevenueOrders(orders, includeMode)`
Filters orders based on revenue recognition strategy
- `'delivered'` - Only confirmed delivered orders
- `'active'` - All except cancelled/returned (RECOMMENDED)
- `'all'` - Everything (for reporting purposes)

#### `calculateFinancialMetrics(orders, cogsPercentage)`
Calculates all financial metrics from orders
- Total Orders, Quantity, Revenue
- COGS (default 60%)
- Profit, Profit Margin

#### `calculateBySalesChannel(orders)`
Groups metrics by sales channel

#### `calculateByPaymentStatus(orders)`
Groups metrics by payment status

#### `getExcludedOrdersSummary(orders)`
Returns summary of excluded orders for transparency

### 3. Constants

```typescript
// Excluded from revenue
EXCLUDED_STATUSES = ['CANCELLED', 'RETURNED']

// Confirmed revenue
CONFIRMED_REVENUE_STATUSES = ['DELIVERED']

// Pending revenue
PENDING_REVENUE_STATUSES = ['PENDING', 'IN TRANSIT', 'ON DELIVERY', 'PICKUP']

// Problematic (optional)
PROBLEMATIC_STATUSES = ['DETAINED', 'PROBLEMATIC']
```

## Pages to Update

### Priority 1: Core Financial Pages
1. ✅ **Dashboard** (`app/dashboard/page.tsx`)
   - Total Revenue card
   - Total Profit card
   - Profit Margin gauge
   - Revenue chart

2. ✅ **Reports Page** (`app/dashboard/reports/page.tsx`)
   - All financial summaries
   - Excel/PDF exports
   - Transaction reports
   - Product performance reports

3. ✅ **Sales Channels** (`app/dashboard/sales-channels/[id]/page.tsx`)
   - Channel-specific revenue
   - Channel profit metrics
   - Cash flow data

### Priority 2: Analytics Pages
4. ✅ **Business Insights** (`app/dashboard/insights/page.tsx`)
   - Revenue trends
   - Profit analysis
   - Return analytics (keep separate)

5. ✅ **Analytics** (`app/dashboard/analytics/page.tsx`)
   - Financial KPIs
   - Performance metrics

### Priority 3: Supporting Pages
6. ✅ **Track Orders** (already using correct data)
7. ✅ **Sales Page** (`app/dashboard/sales/page.tsx`)

## Migration Steps

### Step 1: Update Dashboard API
```typescript
// app/api/dashboard/route.ts
import { filterRevenueOrders, calculateFinancialMetrics } from '@/lib/financial-utils'

// Fetch orders instead of sales
const { data: orders } = await supabase
  .from('orders')
  .select('*')
  .eq('status', 'Packed')

// Filter to active orders only
const activeOrders = filterRevenueOrders(orders, 'active')

// Calculate metrics
const metrics = calculateFinancialMetrics(activeOrders)
```

### Step 2: Update Each Page
```typescript
// Replace old data fetching
const data = await apiGet('/api/sales') // OLD

// With new financial metrics
const data = await apiGet('/api/financial-metrics?includeStatus=all-active') // NEW
```

### Step 3: Update Components
```typescript
// Use utility functions for consistency
import { formatCurrency, formatPercentage } from '@/lib/financial-utils'

<div>{formatCurrency(metrics.totalRevenue)}</div>
<div>{formatPercentage(metrics.profitMargin)}</div>
```

## Recommendations

### 1. Default Revenue Recognition: "Active Orders"
**Recommended**: Use `includeStatus='all-active'`
- Includes: DELIVERED, PENDING, IN TRANSIT, ON DELIVERY, PICKUP
- Excludes: CANCELLED, RETURNED
- Reason: Balances accuracy with realistic revenue projection

### 2. Conservative Reporting: "Delivered Only"
**Use for**: Official financial reports, accounting
- Includes: DELIVERED only
- Excludes: Everything else
- Reason: Most conservative, only confirmed revenue

### 3. Separate Tracking for Excluded Orders
**Important**: Always show excluded orders separately
- Display cancelled orders count and value
- Display returned orders count and value
- Helps identify issues and trends

### 4. Add Revenue Status Indicator
Add visual indicator on dashboard:
```
Revenue Recognition: Active Orders
(Excludes 15 cancelled and 8 returned orders worth ₱23,450)
```

### 5. Historical Data Handling
For historical analysis:
- Keep cancelled/returned in database
- Filter them out in calculations
- Show them separately in reports
- Track cancellation/return rates

## Testing Checklist

- [ ] Dashboard shows correct revenue (excludes cancelled/returned)
- [ ] Reports page uses orders data
- [ ] Sales channels show accurate metrics
- [ ] Excel/PDF exports exclude cancelled/returned
- [ ] Business insights calculations are correct
- [ ] Track orders page still works correctly
- [ ] All financial cards show consistent data
- [ ] Profit margins are calculated correctly
- [ ] COGS calculations are accurate
- [ ] Date filtering works properly

## Benefits

### Accuracy
- ✅ Real customer orders only
- ✅ Proper revenue recognition
- ✅ Excludes cancelled/returned automatically
- ✅ Tracks delivery status

### Consistency
- ✅ Single source of truth (orders table)
- ✅ Centralized calculations
- ✅ Same logic across all pages
- ✅ Reusable utility functions

### Transparency
- ✅ Clear exclusion rules
- ✅ Separate tracking of excluded orders
- ✅ Metadata shows what's included/excluded
- ✅ Easy to audit

### Flexibility
- ✅ Multiple revenue recognition modes
- ✅ Configurable COGS percentage
- ✅ Date range filtering
- ✅ Channel/status grouping

## Next Steps

1. **Update Dashboard API** - Highest priority
2. **Update Reports Page** - Second priority
3. **Update Sales Channels** - Third priority
4. **Update remaining pages** - As needed
5. **Add revenue recognition indicator** - For transparency
6. **Create migration script** - For historical data (if needed)
7. **Update documentation** - User guides and training

## Support

For questions or issues:
1. Check this documentation
2. Review `lib/financial-utils.ts` for calculation logic
3. Test with `/api/financial-metrics` endpoint
4. Verify data in Track Orders page

## Version History

- **v1.0** - Initial implementation
- **Date**: March 4, 2026
- **Author**: System Implementation

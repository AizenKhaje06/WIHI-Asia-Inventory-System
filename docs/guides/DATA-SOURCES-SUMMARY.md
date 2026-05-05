# Data Sources Summary - Important!

## ⚠️ IMPORTANT: Different Pages Use Different Tables

### Pages Using `orders` Table (Supabase)
These pages get data from the **`orders`** table:

1. **Track Orders** (`/dashboard/track-orders`)
   - API: `/api/orders`
   - Table: `orders`
   - Data: All orders with tracking info

2. **Sales Channels** (`/dashboard/sales-channels`)
   - API: `/api/departments`
   - Table: `orders`
   - Data: Orders grouped by sales_channel

3. **Sales Analytics** (`/dashboard/analytics`)
   - API: `/api/reports`
   - Table: `orders`
   - Data: Sales performance metrics

4. **Dashboard** (`/dashboard`)
   - API: `/api/dashboard`
   - Table: `orders`
   - Data: Overview stats and KPIs

5. **Packing Queue** (`/dashboard/packing-queue`)
   - API: `/api/orders` (filtered by status)
   - Table: `orders`
   - Data: Unpacked orders

6. **Warehouse Dispatch** (`/dashboard/pos`)
   - Creates new records in `orders` table
   - Table: `orders`

### Pages Using `transactions` Table (Old System)
These pages get data from the **`transactions`** table:

1. **Business Insights** (`/dashboard/insights`)
   - API: `/api/analytics`
   - Table: `transactions`
   - Data: ABC analysis, turnover, forecasts, profit margins

2. **Internal Usage** (`/dashboard/internal-usage`)
   - API: `/api/internal-usage`
   - Table: `transactions` (filtered by type='internal')
   - Data: Internal usage records

### Pages Using `inventory` Table

1. **Inventory/Products** (`/dashboard/inventory`)
   - API: `/api/items`
   - Table: `inventory`
   - Data: Product stock levels

2. **Low Stock** (`/dashboard/inventory/low-stock`)
   - API: `/api/items` (filtered)
   - Table: `inventory`
   - Data: Items below reorder level

3. **Out of Stock** (`/dashboard/inventory/out-of-stock`)
   - API: `/api/items` (filtered)
   - Table: `inventory`
   - Data: Items with 0 quantity

## Key Differences

### `orders` Table
- **Purpose**: Order tracking from dispatch to delivery
- **Columns**: id, date, sales_channel, store, courier, waybill, qty, cogs, total, product, status, parcel_status, etc.
- **Used For**: Order management, tracking, fulfillment
- **Created By**: Warehouse Dispatch page

### `transactions` Table
- **Purpose**: Historical transaction records (old system)
- **Columns**: id, item_id, quantity, type, timestamp, etc.
- **Used For**: Analytics, insights, historical data
- **Created By**: Old POS system (legacy)

## Team Leader Access

### For `orders` Table Pages
Team leaders see only their assigned sales channel:
- ✅ Track Orders - filtered by sales_channel
- ✅ Sales Channels - shows only their channel
- ✅ Packing Queue - only their channel's orders
- ✅ Warehouse Dispatch - can only create orders for their channel

### For `transactions` Table Pages
Team leaders should also be filtered:
- ⚠️ **Business Insights** - NOW FILTERED (just fixed!)
  - Sales channel filter auto-set to their channel
  - Dropdown disabled
  - All analytics show only their channel's data

## Migration Status

The system is transitioning from `transactions` table to `orders` table:
- ✅ Order management moved to `orders` table
- ✅ Track Orders uses `orders` table
- ✅ Sales reporting uses `orders` table
- ⚠️ Business Insights still uses `transactions` table (legacy)
- ⚠️ Internal Usage still uses `transactions` table

## Recommendation

Consider migrating Business Insights to use `orders` table for consistency:
- All order-related data in one place
- Easier to maintain
- Better performance
- Consistent filtering for team leaders

## Files Reference

### Orders Table APIs
- `app/api/orders/route.ts`
- `app/api/departments/route.ts`
- `app/api/reports/route.ts`
- `app/api/dashboard/route.ts`

### Transactions Table APIs
- `app/api/analytics/route.ts`
- `app/api/internal-usage/route.ts`

### Database Functions
- `lib/supabase-db.ts` - Contains getTransactions(), getOrders(), etc.

## Summary

**NO** - Business Insights page is **NOT** based on Track Orders table (`orders`).

Business Insights uses `transactions` table, while Track Orders uses `orders` table. They are **different data sources**.

However, I just added the team leader filter to Business Insights page, so team leaders will only see their channel's data from the `transactions` table.

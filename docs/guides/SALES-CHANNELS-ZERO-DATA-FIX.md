# Sales Channels Zero Data Issue - Diagnostic Guide

## Problem
Sales Channels page shows 0 values for all cards (Revenue, Profit, Transactions, Items).

## Console Logs Show
```
[Departments API] Total orders fetched: 0
[Departments API] After date filter: 0
[Departments API] Active orders (excluding CANCELLED/RETURNED): 0
[Departments API] Sales channels found: []
[Departments API] Totals: { revenue: 0, cost: 0, profit: 0, transactions: 0, quantity: 0 }
```

## Root Cause
The API is fetching 0 orders from the `orders` table in Supabase, which means either:
1. No orders exist in the database
2. Orders exist but are outside the date range filter (default: last 30 days)
3. Database connection issue
4. RLS (Row Level Security) is blocking access

## Important: Table Information
- **Supabase Table**: `orders` (NOT `track_order`)
- **API Source**: `/api/departments` fetches from `orders` table
- **Same Data**: Sales Channels uses same data as Track Orders page

## Diagnostic Steps

### Step 1: Run Quick Test
```bash
cd scripts/utils
TEST-SALES-CHANNELS.cmd
```

This will:
- Check if orders exist in database
- Show total order count
- Display date range of orders
- Show orders by sales channel
- Check if there are orders in last 30 days

### Step 2: Check Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Table Editor
4. Open `orders` table
5. Check if there are rows
6. Check the `date` column values

### Step 3: Check Database Directly
Run this SQL query:
```sql
-- Check total orders
SELECT COUNT(*) as total_orders FROM orders;

-- Check orders by sales channel
SELECT 
  sales_channel,
  COUNT(*) as order_count,
  SUM(total) as total_revenue
FROM orders
GROUP BY sales_channel;

-- Check date range
SELECT 
  MIN(date) as earliest_date,
  MAX(date) as latest_date
FROM orders;
```

### Step 3: Check Date Range on Sales Channels Page
The Sales Channels page defaults to last 30 days. If your orders are older:
1. Open Sales Channels page
2. Adjust Start Date and End Date to cover your order dates
3. Click "Apply Filter"

## Solutions

### Solution 1: Adjust Date Range
If orders exist but are outside the default 30-day range:
1. Go to Sales Channels page
2. Set Start Date to earliest order date
3. Set End Date to today
4. Click Apply Filter

### Solution 2: Add Test Orders
If no orders exist, add test orders:
```sql
-- Add sample orders
INSERT INTO orders (sales_channel, total, qty, cogs, date, parcel_status, payment_status)
VALUES 
  ('Facebook', 5000, 10, 3000, CURRENT_DATE, 'DELIVERED', 'paid'),
  ('TikTok', 3000, 5, 1800, CURRENT_DATE, 'DELIVERED', 'paid'),
  ('Shopee', 7000, 15, 4200, CURRENT_DATE, 'DELIVERED', 'paid'),
  ('Lazada', 4000, 8, 2400, CURRENT_DATE, 'DELIVERED', 'paid'),
  ('Physical Store', 6000, 12, 3600, CURRENT_DATE, 'DELIVERED', 'paid');
```

### Solution 3: Check API Response
Open browser DevTools:
1. Go to Network tab
2. Refresh Sales Channels page
3. Find `/api/departments` request
4. Check Response tab
5. Verify if data is returned

## Expected Behavior

When working correctly, you should see:
```
[Departments API] Total orders fetched: 150
[Departments API] After date filter: 45
[Departments API] Active orders (excluding CANCELLED/RETURNED): 42
[Departments API] Sales channels found: ['Facebook', 'TikTok', 'Shopee', 'Lazada', 'Physical Store']
[Departments API] Totals: { revenue: 125000, cost: 75000, profit: 50000, transactions: 42, quantity: 210 }
```

## Quick Fix Commands

### Check Orders
```bash
cd scripts/test
node check-orders-dates.js
```

### Check SQL
```bash
cd scripts/sql
# Run CHECK-SALES-CHANNELS-DATA.sql in your database client
```

## Related Files
- API: `app/api/departments/route.ts`
- Page: `app/dashboard/sales-channels/page.tsx`
- Utils: `lib/financial-utils.ts`

## Notes
- Sales Channels page uses same data source as Track Orders page
- Date filter is applied on frontend AND backend
- CANCELLED and RETURNED orders are excluded from revenue calculations
- COGS is auto-calculated as 60% of total if missing

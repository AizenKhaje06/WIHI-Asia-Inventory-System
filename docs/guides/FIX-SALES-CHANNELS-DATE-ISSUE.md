# Fix Sales Channels Date Issue - SOLVED ✅

## Problem Found
✅ May 38 orders sa database  
❌ Pero lahat ay March 1-23, 2026  
❌ Sales Channels page default: Last 30 days (March 29 - April 28, 2026)  
❌ Result: 0 orders sa date range = 0 data

## Quick Fix - Option 1: Adjust Date Range (Easiest)

Sa Sales Channels page:
1. Set **Start Date**: `2026-03-01`
2. Set **End Date**: `2026-04-28` (or today)
3. Click **Apply Filter**

✅ Makikita mo na ang data!

## Quick Fix - Option 2: Update Order Dates (Recommended)

Para automatic na gumagana ang "Last 30 days" default:

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Click "New Query"

### Step 2: Run Update Script

**Option A: Update all to today** (Simplest)
```sql
UPDATE orders
SET date = CURRENT_DATE
WHERE date < CURRENT_DATE - INTERVAL '30 days';
```

**Option B: Spread across last 30 days** (More realistic)
```sql
UPDATE orders
SET date = CURRENT_DATE - (random() * 30)::int
WHERE date < CURRENT_DATE - INTERVAL '30 days';
```

**Option C: Keep relative spacing** (Best for historical data)
```sql
-- This moves all March 1-23 orders forward to recent dates
-- while keeping the same spacing between them
UPDATE orders
SET date = date + (CURRENT_DATE - '2026-03-23'::date)
WHERE date BETWEEN '2026-03-01' AND '2026-03-23';
```

### Step 3: Verify
```sql
-- Check date range
SELECT 
  MIN(date) as earliest_date,
  MAX(date) as latest_date,
  COUNT(*) as total_orders
FROM orders;

-- Should show dates within last 30 days
```

### Step 4: Refresh Sales Channels Page
1. Go back to Sales Channels page
2. Refresh browser (F5)
3. ✅ Data should appear!

## Expected Result

After fix, you should see:
- **Total Revenue**: ₱18,566
- **Transactions**: 38
- **Sales Channels**: 
  - Shopee: ₱4,586 (6 orders)
  - Physical Store: ₱4,543 (12 orders)
  - Lazada: ₱3,549 (8 orders)
  - TikTok: ₱3,243 (8 orders)
  - Facebook: ₱2,645 (4 orders)

## Why This Happened

Your orders were created in March 1-23, 2026, but the Sales Channels page defaults to "Last 30 days" which is March 29 - April 28, 2026. Since there are no orders in that range, it shows 0.

## Prevention

Going forward:
1. Always create orders with `CURRENT_DATE` or recent dates
2. Or adjust date range on Sales Channels page to match your data
3. Use the date filter to view historical data

## Files
- SQL Script: `scripts/sql/UPDATE-ORDER-DATES-TO-RECENT.sql`
- Test Script: `scripts/test/check-orders-dates.js`
- Test Command: `scripts/utils/TEST-SALES-CHANNELS.cmd`

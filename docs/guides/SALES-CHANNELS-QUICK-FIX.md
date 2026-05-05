# Sales Channels Zero Data - Quick Fix

## Problema
Walang data sa Sales Channels page (lahat 0 values).

## Mabilis na Solusyon

### 1. Test kung may orders
```bash
cd scripts/utils
TEST-SALES-CHANNELS.cmd
```

### 2. Kung walang orders sa database

#### Option A: Check Supabase Dashboard
1. Buksan https://supabase.com/dashboard
2. Select project mo
3. Go to Table Editor
4. Buksan `orders` table
5. Check kung may data

#### Option B: Add test orders
```sql
-- Run sa Supabase SQL Editor
INSERT INTO orders (
  id, date, sales_channel, store, courier, waybill,
  qty, cogs, total, product, dispatched_by, status, parcel_status
)
VALUES 
  ('TEST-001', CURRENT_DATE, 'Facebook', 'Facebook Store', 'J&T', 'JT001', 10, 3000, 5000, 'Test Product', 'Admin', 'Packed', 'DELIVERED'),
  ('TEST-002', CURRENT_DATE, 'TikTok', 'TikTok Shop', 'LBC', 'LBC002', 5, 1800, 3000, 'Test Product 2', 'Admin', 'Packed', 'DELIVERED'),
  ('TEST-003', CURRENT_DATE, 'Shopee', 'Shopee Mall', 'Flash', 'FL003', 15, 4200, 7000, 'Test Product 3', 'Admin', 'Packed', 'DELIVERED'),
  ('TEST-004', CURRENT_DATE, 'Lazada', 'Lazada Store', 'Ninja Van', 'NV004', 8, 2400, 4000, 'Test Product 4', 'Admin', 'Packed', 'DELIVERED'),
  ('TEST-005', CURRENT_DATE, 'Physical Store', 'Main Store', NULL, NULL, 12, 3600, 6000, 'Test Product 5', 'Admin', 'Packed', 'DELIVERED');
```

### 3. Kung may orders pero old dates

Sa Sales Channels page:
1. Adjust Start Date (set to earliest order date)
2. Adjust End Date (set to today)
3. Click "Apply Filter"

## Importante

- **Table name**: `orders` (sa Supabase)
- **Default date range**: Last 30 days
- **Same data source**: Track Orders page
- **Excluded statuses**: CANCELLED, RETURNED

## Quick Check

Kung gumagana na:
- ✅ May values sa cards (Revenue, Profit, etc.)
- ✅ May data sa charts
- ✅ May sales channels sa list

Kung hindi pa gumagana:
- ❌ Check .env.local - Supabase credentials
- ❌ Check RLS policies sa Supabase
- ❌ Check browser console for errors

## Test Command
```bash
# Quick test
cd scripts/utils
TEST-SALES-CHANNELS.cmd

# Or manual test
cd scripts/test
node check-orders-dates.js
```

## Related Files
- API: `app/api/departments/route.ts`
- Page: `app/dashboard/sales-channels/page.tsx`
- Table: `orders` (Supabase)
- Migration: `supabase/migrations/014_create_orders_tracking_system.sql`

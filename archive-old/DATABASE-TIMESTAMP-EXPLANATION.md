# Database Timestamp Structure - Explanation

## Current Database Tables

### 1. `orders` Table (Main table - currently used)
This is the main table for all orders (dispatch, packing, tracking).

**Key Timestamp Fields:**
- `date` (date) - Dispatch date from form (date only, no time) - e.g., `2026-03-23`
- `created_at` (timestamp) - When order was created in database (full timestamp) - e.g., `2026-03-23 01:45:00`
- `updated_at` (timestamp) - Last update time
- `packed_at` (timestamp) - When order was marked as packed

### 2. `packing_queue` Table (Old/Deprecated?)
Based on the screenshot, this table exists but may be old/unused.

**Fields:**
- `dispatch_timestamp` (timestamp) - Old dispatch time

### 3. `orders_items` Table
Related items for orders.

### 4. `dispatch_tracking` Table
May be for tracking dispatch history.

## How Timestamps Work

### When Order is Dispatched (Created)
```sql
INSERT INTO orders (
  id,
  date,              -- '2026-03-23' (from form date field)
  created_at,        -- '2026-03-23T01:45:00Z' (UTC timestamp)
  ...
)
```

### When Order is Packed
```sql
UPDATE orders SET
  status = 'Packed',
  packed_at = '2026-03-23T01:50:00Z',  -- UTC timestamp
  packed_by = 'username'
WHERE id = 'order-id'
```

## Display Logic

### Packing Queue Page
Should display: `created_at` (when order was dispatched)
- Shows: `03/23/26 01:45` (Manila time)

### Track Orders Page
Should display: `packed_at` (when order was marked as packed)
- Shows: `03/23/26 01:50` (Manila time)

### Activity Logs
Displays: `timestamp` from logs table
- Shows: `03/23/26 01:45` (Manila time)

## Current Issue (Based on Screenshots)

The `created_at` in your screenshot shows `2026-03-01 12:20:52.551` which is **old test data** from March 1.

For new orders dispatched on March 23, the `created_at` should show the correct timestamp.

## Verification Steps

1. Run `CHECK-ORDERS-TIMESTAMPS.sql` in Supabase SQL Editor
2. Check if new orders (March 23) have proper `created_at` timestamps
3. Verify that `created_at` has time component (not just 00:00:00)

## Expected Behavior

When you dispatch an order at 1:45 AM on March 23:

**Database stores:**
- `date`: `2026-03-23`
- `created_at`: `2026-03-22T17:45:00Z` (UTC = Manila 1:45 AM - 8 hours)

**Application displays:**
- Packing Queue: `03/23/26 01:45` (converts UTC to Manila)
- Activity Logs: `03/23/26 01:45` (converts UTC to Manila)

## Notes

- All timestamps in database are stored in UTC
- JavaScript automatically converts UTC to local timezone when displaying
- The `formatDateTime()` helper function handles this conversion properly

# Debugging: Status Undefined Issue

## Problem
- Console shows `status: undefined`
- Cancel API works (can read/write status in Supabase)
- Frontend shows all transactions as "Completed"

## Latest Changes Applied

### 1. Bypassed Cache (CRITICAL FIX)
**Files**: `app/api/reports/route.ts`, `app/api/dashboard/route.ts`
- Removed `getCachedData()` wrapper
- Fetch directly from `getTransactions()` every time
- No more stale cached data

### 2. Enhanced Logging
**File**: `lib/supabase-db.ts`
```typescript
console.log('[getTransactions] Raw data from Supabase (first 3 rows):')
console.log(JSON.stringify(data?.slice(0, 3), null, 2))
```
This will show EXACTLY what Supabase returns.

### 3. Check Both Column Name Formats
```typescript
status: row.status || 'completed',
cancellationReason: row.cancellation_reason || row.cancellationReason,
cancelledBy: row.cancelled_by || row.cancelledBy,
cancelledAt: row.cancelled_at || row.cancelledAt,
```

## What to Check Now

### Step 1: Restart Server
```cmd
npm run dev
```

### Step 2: Open Browser Console (F12)
Look for this log:
```
[getTransactions] Raw data from Supabase (first 3 rows):
[
  {
    "id": "...",
    "item_name": "BERRY SOAP",
    "status": "cancelled",    <-- CHECK THIS
    ...
  }
]
```

### Step 3: Check Raw Data
**If status field EXISTS in raw data:**
✅ The fix is working! Just refresh the page.

**If status field is NULL or missing:**
❌ The column doesn't exist in Supabase.

## Verify Supabase Columns

### Run this SQL in Supabase SQL Editor:
```sql
-- Check if columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'transactions' 
AND column_name IN ('status', 'cancellation_reason', 'cancelled_by', 'cancelled_at')
ORDER BY column_name;
```

### Expected Result:
```
column_name          | data_type           | is_nullable
---------------------|---------------------|-------------
cancelled_at         | timestamp with...   | YES
cancelled_by         | character varying   | YES
cancellation_reason  | text                | YES
status               | character varying   | YES
```

### If Columns Don't Exist:
Run this migration in Supabase SQL Editor:
```sql
-- Add status columns to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed';

ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(100),
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

-- Update existing records
UPDATE transactions 
SET status = 'completed' 
WHERE status IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
```

## Check Your Cancelled Transactions

### Run this SQL:
```sql
SELECT id, item_name, status, cancellation_reason, cancelled_by, cancelled_at
FROM transactions
WHERE status = 'cancelled'
ORDER BY cancelled_at DESC;
```

### Expected Result:
Should show 2 rows (BERRY SOAP, BUILD CORD) with status = 'cancelled'.

### If No Rows Returned:
The status column exists but has no 'cancelled' values. This means:
1. The cancel API is updating the `logs` table, not `transactions` table
2. OR the transactions were deleted instead of marked as cancelled

## Next Steps

1. **Restart server** and check console logs
2. **Look for raw Supabase data** in console
3. **Verify status field** in raw data
4. **If missing**, run the SQL queries above in Supabase
5. **Report back** what you see in the console logs

---

**Critical**: We need to see the raw Supabase data to diagnose this properly.

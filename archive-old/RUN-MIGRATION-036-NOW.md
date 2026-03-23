# RUN MIGRATION 036 NOW - Add Date Range Columns

## Error
```
Could not find the 'end_date' column of 'email_report_schedules' in the schema cache
```

## Solution
Kailangan i-run yung migration para ma-add yung `start_date` at `end_date` columns.

## Option 1: Supabase Dashboard (EASIEST)

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" sa left sidebar
4. Copy-paste this SQL:

```sql
-- Add date range columns to email_report_schedules table
ALTER TABLE email_report_schedules
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Add comments
COMMENT ON COLUMN email_report_schedules.start_date IS 'Optional start date for report filtering';
COMMENT ON COLUMN email_report_schedules.end_date IS 'Optional end date for report filtering';
```

5. Click "Run" button
6. Refresh your app page

## Option 2: Using Migration File

If you have Supabase CLI installed:

```bash
# Run the migration
supabase db push

# Or run specific migration
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/036_add_date_range_to_email_schedules.sql
```

## Verify Migration

After running, verify columns exist:

```sql
-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'email_report_schedules'
ORDER BY ordinal_position;
```

Should show:
- `start_date` | date | YES
- `end_date` | date | YES

## After Migration

1. Refresh your browser (Ctrl+Shift+R)
2. Go to Settings → Email Reports
3. Try selecting date range again
4. Should work now!

## Quick Test

```sql
-- Test insert with date range
INSERT INTO email_report_schedules (
  id,
  recipient_email,
  recipient_name,
  report_type,
  frequency,
  schedule_time,
  start_date,
  end_date,
  is_active,
  created_by
) VALUES (
  'TEST-' || NOW()::TEXT,
  'test@example.com',
  'Test User',
  'track_orders',
  'daily',
  '08:00',
  '2026-03-01',
  '2026-03-31',
  true,
  'admin'
);

-- Check if it worked
SELECT id, recipient_email, start_date, end_date
FROM email_report_schedules
WHERE recipient_email = 'test@example.com';

-- Clean up test
DELETE FROM email_report_schedules
WHERE recipient_email = 'test@example.com';
```

## Status

Once migration is done:
✅ Date range picker will work
✅ No more schema cache errors
✅ Can save schedules with date ranges

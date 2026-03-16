# 🚨 COPY THIS SQL TO SUPABASE NOW

## ERROR YOU GOT:
```
ERROR: 42601: syntax error at or near "supabase"
LINE 2: supabase/migrations/035_create_email_reports_tables.sql
```

## PROBLEMA:
You typed the **FILENAME** instead of the **FILE CONTENT**!

## SOLUTION - GAWIN MO TO:

### Step 1: Open Supabase SQL Editor
1. Go to: https://app.supabase.com/project/rsvzbmhuckwndvqfhzml/sql
2. Click "New Query"

### Step 2: Copy THE CONTENT BELOW (NOT THE FILENAME!)

Copy everything from `-- ============` to the end:

```sql
-- ============================================
-- EMAIL REPORT SCHEDULES TABLE
-- ============================================
-- Stores email report schedule configurations

CREATE TABLE IF NOT EXISTS email_report_schedules (
  id TEXT PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  report_type TEXT NOT NULL CHECK (report_type IN ('track_orders', 'inventory', 'sales')),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  schedule_time TEXT NOT NULL DEFAULT '08:00',
  schedule_day TEXT,
  is_active BOOLEAN DEFAULT true,
  filters JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  last_sent_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- EMAIL REPORT LOGS TABLE
-- ============================================
-- Tracks all email report sends

CREATE TABLE IF NOT EXISTS email_report_logs (
  id TEXT PRIMARY KEY,
  schedule_id TEXT REFERENCES email_report_schedules(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  report_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  report_date_range TEXT,
  orders_count INTEGER,
  total_amount NUMERIC,
  file_size_bytes INTEGER,
  generation_time_ms INTEGER,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_email_schedules_active ON email_report_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_email_schedules_frequency ON email_report_schedules(frequency);
CREATE INDEX IF NOT EXISTS idx_email_schedules_type ON email_report_schedules(report_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_schedule ON email_report_logs(schedule_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_report_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_report_logs(sent_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE email_report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_report_logs ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "email_schedules_service_role_all"
ON email_report_schedules
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "email_logs_service_role_all"
ON email_report_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Authenticated users can read
CREATE POLICY "email_schedules_select_policy"
ON email_report_schedules
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "email_logs_select_policy"
ON email_report_logs
FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE email_report_schedules IS 'Stores automated email report schedule configurations';
COMMENT ON TABLE email_report_logs IS 'Tracks all email report send attempts and results';
COMMENT ON COLUMN email_report_schedules.schedule_day IS 'Day of week (1-7) for weekly or day of month (1-31) for monthly';
COMMENT ON COLUMN email_report_schedules.filters IS 'JSON object storing report filter preferences';
```

### Step 3: Paste and Run
1. Paste the SQL above into Supabase SQL Editor
2. Click "Run" button
3. You should see: "Success. No rows returned"

### Step 4: Verify Tables Created
Run this to check:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('email_report_schedules', 'email_report_logs');
```

You should see 2 tables!

---

## AFTER MIGRATION SUCCESS:

### Test the UI:
1. Go to: http://localhost:3000/dashboard/settings
2. Click "Email Reports" tab
3. Click "Add Recipient"
4. Fill in:
   - Name: Your Name
   - Email: your@email.com
   - Frequency: Daily
   - Time: 08:00
5. Click "Add"
6. Click the "Send" icon to test

---

## NEXT: Deploy to Vercel

After local testing works, add to Vercel:
1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Add these:
   - `CRON_SECRET` = `l3ahkma1m06`
   - `NEXT_PUBLIC_APP_URL` = `https://your-domain.vercel.app`
3. Redeploy

---

## TAPOS NA! ✅

Once migration runs successfully:
- ✅ Tables created
- ✅ UI connected to Supabase
- ✅ Can add/edit/delete schedules
- ✅ Can send test emails
- ✅ Cron job ready (after Vercel deploy)

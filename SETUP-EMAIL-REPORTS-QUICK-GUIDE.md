# Quick Setup Guide - Automated Email Reports

## Step 1: Run Database Migration ✅

Go to Supabase Dashboard → SQL Editor → New Query

Copy and paste the entire content of:
```
supabase/migrations/035_create_email_reports_tables.sql
```

Click "Run" - this creates the tables.

---

## Step 2: Add Environment Variables

Add to your `.env.local` file:

```env
# Generate a random secret (use any random string)
CRON_SECRET=my-super-secret-cron-key-12345

# Your app URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, use your actual domain:
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.vercel.app
```

---

## Step 3: Add Recipients

Go to Supabase Dashboard → SQL Editor → New Query

Copy from `INSERT-EMAIL-SCHEDULE-EXAMPLE.sql` and modify:

```sql
INSERT INTO email_report_schedules (
  id,
  recipient_email,
  recipient_name,
  report_type,
  frequency,
  schedule_time,
  schedule_day,
  is_active,
  filters,
  created_by
) VALUES (
  'SCHED-001',
  'your-email@company.com',  -- CHANGE THIS
  'Your Name',                -- CHANGE THIS
  'track_orders',
  'daily',
  '08:00',
  NULL,
  true,
  '{}',
  'admin'
);
```

Click "Run" to add the recipient.

---

## Step 4: Test Locally (Optional)

```bash
# In terminal
curl -X GET http://localhost:3000/api/cron/send-reports \
  -H "Authorization: Bearer my-super-secret-cron-key-12345"
```

This will immediately send a test email.

---

## Step 5: Deploy to Vercel

```bash
git add .
git commit -m "Add automated email reports"
git push
```

Vercel will:
1. Detect the cron configuration in `vercel.json`
2. Automatically schedule the job
3. Run daily at 8:00 AM

---

## Verify It's Working

### Check Vercel Dashboard:
1. Go to your project on Vercel
2. Click "Cron Jobs" tab
3. You should see: `/api/cron/send-reports` scheduled

### Check Supabase Logs:
```sql
-- View recent email sends
SELECT * FROM email_report_logs 
ORDER BY sent_at DESC 
LIMIT 10;
```

---

## Schedule Options

### Daily at 8 AM:
```sql
frequency = 'daily'
schedule_time = '08:00'
schedule_day = NULL
```

### Weekly (Monday at 8 AM):
```sql
frequency = 'weekly'
schedule_time = '08:00'
schedule_day = '1'  -- 0=Sunday, 1=Monday, etc.
```

### Monthly (1st day at 8 AM):
```sql
frequency = 'monthly'
schedule_time = '08:00'
schedule_day = '1'  -- Day of month (1-31)
```

---

## Troubleshooting

### No emails received?
1. Check Supabase logs table
2. Check Vercel function logs
3. Verify RESEND_API_KEY is set
4. Verify CRON_SECRET matches

### Wrong time?
- Vercel uses UTC time
- 8:00 AM Manila = 00:00 UTC
- Adjust schedule_time accordingly

### Change schedule time:
```sql
UPDATE email_report_schedules 
SET schedule_time = '09:00' 
WHERE id = 'SCHED-001';
```

### Disable a schedule:
```sql
UPDATE email_report_schedules 
SET is_active = false 
WHERE id = 'SCHED-001';
```

---

## That's It! 🎉

Your automated email reports are now set up and will run daily at 8 AM!

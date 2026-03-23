-- Check all active email schedules
SELECT 
  id,
  recipient_email,
  report_type,
  frequency,
  schedule_time,
  schedule_day,
  is_active,
  last_sent_at,
  created_at
FROM email_report_schedules
WHERE is_active = true
ORDER BY schedule_time;

-- Check recent email logs
SELECT 
  id,
  schedule_id,
  recipient_email,
  status,
  error_message,
  orders_count,
  sent_at
FROM email_report_logs
ORDER BY sent_at DESC
LIMIT 10;

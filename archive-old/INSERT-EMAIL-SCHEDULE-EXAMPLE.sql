-- ============================================
-- INSERT EMAIL REPORT SCHEDULE - EXAMPLE
-- ============================================
-- Use this to add recipients for automated email reports

-- Example 1: Daily report at 8 AM
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
  'boss@company.com',
  'Boss Name',
  'track_orders',
  'daily',
  '08:00',
  NULL,
  true,
  '{}',
  'admin'
);

-- Example 2: Weekly report every Monday at 8 AM
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
  'SCHED-002',
  'manager@company.com',
  'Manager Name',
  'track_orders',
  'weekly',
  '08:00',
  '1',
  true,
  '{}',
  'admin'
);

-- Example 3: Monthly report on 1st day at 8 AM
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
  'SCHED-003',
  'accounting@company.com',
  'Accounting Team',
  'track_orders',
  'monthly',
  '08:00',
  '1',
  true,
  '{}',
  'admin'
);

-- ============================================
-- NOTES
-- ============================================
-- frequency options: 'daily', 'weekly', 'monthly'
-- schedule_day: 
--   - For weekly: 0-6 (0=Sunday, 1=Monday, etc.)
--   - For monthly: 1-31 (day of month)
--   - For daily: NULL
-- schedule_time: 24-hour format 'HH:MM' (e.g., '08:00', '14:30')
-- filters: JSON object for future filtering options (use '{}' for now)

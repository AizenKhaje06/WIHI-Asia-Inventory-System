-- Quick Fix: Add date range columns to email_report_schedules
-- Run this in Supabase SQL Editor

-- Add columns
ALTER TABLE email_report_schedules
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Add comments for documentation
COMMENT ON COLUMN email_report_schedules.start_date IS 'Optional start date for report filtering';
COMMENT ON COLUMN email_report_schedules.end_date IS 'Optional end date for report filtering';

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'email_report_schedules'
AND column_name IN ('start_date', 'end_date');

-- Should return:
-- start_date | date | YES
-- end_date   | date | YES

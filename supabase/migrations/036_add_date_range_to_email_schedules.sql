-- Add date range columns to email_report_schedules table
-- This allows filtering reports by date range

ALTER TABLE email_report_schedules
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Add comment
COMMENT ON COLUMN email_report_schedules.start_date IS 'Optional start date for report filtering';
COMMENT ON COLUMN email_report_schedules.end_date IS 'Optional end date for report filtering';

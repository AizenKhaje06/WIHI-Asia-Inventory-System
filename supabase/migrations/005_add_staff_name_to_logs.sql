-- Add staff_name column to logs table
-- This allows tracking which staff member performed each operation

ALTER TABLE logs 
ADD COLUMN IF NOT EXISTS staff_name TEXT;

-- Add index for faster queries filtering by staff
CREATE INDEX IF NOT EXISTS idx_logs_staff_name ON logs(staff_name);

-- Add comment
COMMENT ON COLUMN logs.staff_name IS 'Name of staff member who performed the operation';

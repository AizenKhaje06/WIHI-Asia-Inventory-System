-- Rename transaction_history VIEW to packing_queue for better clarity
-- This VIEW shows pending orders waiting to be packed

-- Drop old view
DROP VIEW IF EXISTS transaction_history;

-- Create new view with clearer name
CREATE VIEW packing_queue AS
SELECT * FROM orders WHERE status = 'Pending';

-- Add comment for documentation
COMMENT ON VIEW packing_queue IS 'View of pending orders waiting to be packed in the Packing Queue page';

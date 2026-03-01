-- Add payment_status column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Add comment
COMMENT ON COLUMN orders.payment_status IS 'Payment status: pending, paid, cod, refunded';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Recreate track_orders VIEW to include new payment_status column
DROP VIEW IF EXISTS track_orders;
CREATE VIEW track_orders AS
SELECT * FROM orders WHERE status = 'Packed';

COMMENT ON VIEW track_orders IS 'View of packed orders ready for tracking';

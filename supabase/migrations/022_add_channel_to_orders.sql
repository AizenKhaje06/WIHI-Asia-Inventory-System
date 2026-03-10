-- Migration: Add channel field to orders table
-- Purpose: Support channel-based filtering for team leaders

-- Add sales_channel column if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS sales_channel VARCHAR(50);

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_orders_sales_channel ON orders(sales_channel);

-- Add comment for documentation
COMMENT ON COLUMN orders.sales_channel IS 'Sales channel for the order (Warehouse Admin, TikTok, Shopee, Facebook, Lazada)';

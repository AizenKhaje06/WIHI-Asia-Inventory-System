-- Migration: Create dispatch_tracking table
-- Purpose: Track dispatch operations for team leaders

CREATE TABLE IF NOT EXISTS dispatch_tracking (
  id VARCHAR(50) PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  dispatch_timestamp TIMESTAMP NOT NULL,
  tracking_info JSONB,
  channel VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_dispatch_tracking_order_id ON dispatch_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_tracking_channel ON dispatch_tracking(channel);
CREATE INDEX IF NOT EXISTS idx_dispatch_tracking_order_channel ON dispatch_tracking(order_id, channel);
CREATE INDEX IF NOT EXISTS idx_dispatch_tracking_timestamp ON dispatch_tracking(dispatch_timestamp);

-- Add comments for documentation
COMMENT ON TABLE dispatch_tracking IS 'Tracks dispatch operations and tracking information by channel';
COMMENT ON COLUMN dispatch_tracking.id IS 'Unique dispatch tracking identifier';
COMMENT ON COLUMN dispatch_tracking.order_id IS 'Reference to order';
COMMENT ON COLUMN dispatch_tracking.dispatch_timestamp IS 'When the order was dispatched';
COMMENT ON COLUMN dispatch_tracking.tracking_info IS 'Tracking information (courier, waybill, etc.)';
COMMENT ON COLUMN dispatch_tracking.channel IS 'Sales channel (Warehouse Admin, TikTok, Shopee, Facebook, Lazada)';

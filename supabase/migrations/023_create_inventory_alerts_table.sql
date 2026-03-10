-- Migration: Create inventory_alerts table
-- Purpose: Track low stock alerts for team leaders

CREATE TABLE IF NOT EXISTS inventory_alerts (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  store_id VARCHAR(50) NOT NULL,
  current_stock INTEGER NOT NULL,
  threshold INTEGER NOT NULL,
  channel VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_channel ON inventory_alerts(channel);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_store_id ON inventory_alerts(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_channel_store ON inventory_alerts(channel, store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_product_id ON inventory_alerts(product_id);

-- Add comments for documentation
COMMENT ON TABLE inventory_alerts IS 'Tracks low stock alerts for inventory items by channel';
COMMENT ON COLUMN inventory_alerts.id IS 'Unique alert identifier';
COMMENT ON COLUMN inventory_alerts.product_id IS 'Reference to inventory product';
COMMENT ON COLUMN inventory_alerts.store_id IS 'Reference to store';
COMMENT ON COLUMN inventory_alerts.current_stock IS 'Current stock level';
COMMENT ON COLUMN inventory_alerts.threshold IS 'Low stock threshold';
COMMENT ON COLUMN inventory_alerts.channel IS 'Sales channel (Warehouse Admin, TikTok, Shopee, Facebook, Lazada)';

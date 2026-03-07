-- Migration: Create Bundles System
-- Date: 2026-03-05
-- Description: Create tables for product bundles with special pricing

-- Create bundles table
CREATE TABLE IF NOT EXISTS bundles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  store TEXT NOT NULL,
  sales_channel TEXT,
  
  -- Pricing
  bundle_price DECIMAL(10,2) NOT NULL,
  bundle_cost DECIMAL(10,2) NOT NULL,
  regular_price DECIMAL(10,2) NOT NULL,
  savings DECIMAL(10,2) NOT NULL,
  
  -- Inventory
  quantity INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 5,
  
  -- Metadata
  sku TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Display
  image_url TEXT,
  badge TEXT
);

-- Create bundle_items table (what's inside each bundle)
CREATE TABLE IF NOT EXISTS bundle_items (
  id TEXT PRIMARY KEY,
  bundle_id TEXT NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(bundle_id, item_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bundles_store ON bundles(store);
CREATE INDEX IF NOT EXISTS idx_bundles_category ON bundles(category);
CREATE INDEX IF NOT EXISTS idx_bundles_active ON bundles(is_active);
CREATE INDEX IF NOT EXISTS idx_bundles_sales_channel ON bundles(sales_channel);
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle ON bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_item ON bundle_items(item_id);

-- Add comments for documentation
COMMENT ON TABLE bundles IS 'Product bundles with special pricing';
COMMENT ON TABLE bundle_items IS 'Items included in each bundle';
COMMENT ON COLUMN bundles.bundle_price IS 'Special bundle price (what customer pays)';
COMMENT ON COLUMN bundles.bundle_cost IS 'Total cost of all items in bundle';
COMMENT ON COLUMN bundles.regular_price IS 'Sum of individual item prices';
COMMENT ON COLUMN bundles.savings IS 'Amount saved by buying bundle (regular_price - bundle_price)';
COMMENT ON COLUMN bundles.quantity IS 'Available bundle quantity (calculated from component items)';
COMMENT ON COLUMN bundles.badge IS 'Display badge like "BEST VALUE", "SAVE 20%"';

-- Enable Row Level Security (RLS)
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now, can be restricted later)
CREATE POLICY "Allow all operations on bundles" ON bundles FOR ALL USING (true);
CREATE POLICY "Allow all operations on bundle_items" ON bundle_items FOR ALL USING (true);

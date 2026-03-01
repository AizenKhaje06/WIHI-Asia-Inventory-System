-- Migration: Create Orders Tracking System
-- Date: 2026-03-01
-- Description: Complete order tracking from dispatch to packed to shipped

-- Step 1: Create orders table (replaces/extends transactions for order tracking)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  
  -- Order Details
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  sales_channel TEXT NOT NULL,
  store TEXT NOT NULL,
  
  -- Shipping Details
  courier TEXT,
  waybill TEXT,
  
  -- Financial Details
  qty INTEGER NOT NULL,
  cogs DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  
  -- Product Details
  product TEXT NOT NULL, -- Comma-separated list of products
  
  -- Status Tracking
  status TEXT DEFAULT 'Pending', -- Pending, Packed, Shipped, Delivered
  parcel_status TEXT DEFAULT 'Pending', -- Pending, In Transit, Delivered
  
  -- People Tracking
  dispatched_by TEXT NOT NULL,
  packed_by TEXT,
  packed_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Soft delete
  deleted_at TIMESTAMP
);

-- Step 2: Create order_items table (detailed item breakdown)
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Item Details
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  cost_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  
  -- Calculated
  total_cost DECIMAL(10,2) NOT NULL,
  total_revenue DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Step 3: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_parcel_status ON orders(parcel_status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date);
CREATE INDEX IF NOT EXISTS idx_orders_sales_channel ON orders(sales_channel);
CREATE INDEX IF NOT EXISTS idx_orders_packed_by ON orders(packed_by);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Step 4: Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Add comments for documentation
COMMENT ON TABLE orders IS 'Order tracking from dispatch to delivery';
COMMENT ON TABLE order_items IS 'Detailed breakdown of items in each order';

COMMENT ON COLUMN orders.status IS 'Order status: Pending (waiting to pack), Packed (ready to ship), Shipped, Delivered';
COMMENT ON COLUMN orders.parcel_status IS 'Parcel tracking status: Pending, In Transit, Delivered';
COMMENT ON COLUMN orders.packed_by IS 'Name of person who packed the order';
COMMENT ON COLUMN orders.packed_at IS 'Timestamp when order was marked as packed';

-- Step 6: Create view for Transaction History (unpacked orders)
CREATE OR REPLACE VIEW transaction_history AS
SELECT 
  id,
  date,
  sales_channel,
  store,
  courier,
  waybill,
  status,
  qty,
  cogs,
  total,
  parcel_status,
  product,
  dispatched_by,
  packed_by,
  packed_at,
  created_at
FROM orders
WHERE status = 'Pending' -- Only show unpacked orders
  AND deleted_at IS NULL
ORDER BY created_at DESC;

-- Step 7: Create view for Track Orders (packed orders)
CREATE OR REPLACE VIEW track_orders AS
SELECT 
  id,
  date,
  sales_channel,
  store,
  courier,
  waybill,
  status,
  qty,
  cogs,
  total,
  parcel_status,
  product,
  dispatched_by,
  packed_by,
  packed_at,
  created_at,
  updated_at
FROM orders
WHERE status IN ('Packed', 'Shipped', 'Delivered') -- Only show packed/shipped orders
  AND deleted_at IS NULL
ORDER BY created_at DESC;

-- Step 8: Sample data (optional - remove if not needed)
-- INSERT INTO orders (id, date, sales_channel, store, courier, waybill, qty, cogs, total, product, dispatched_by, status, parcel_status)
-- VALUES 
--   ('ORD-001', CURRENT_DATE, 'Shopee', 'Shopee Mall Store', 'J&T', 'JT123456789', 5, 2500.00, 5000.00, 'Product A (3), Product B (2)', 'Aizen06', 'Pending', 'Pending'),
--   ('ORD-002', CURRENT_DATE, 'Lazada', 'Lazada Flagship', 'Flash', 'FL987654321', 2, 1000.00, 2000.00, 'Product C (2)', 'Aizen06', 'Packed', 'Pending');

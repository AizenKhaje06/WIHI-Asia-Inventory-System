-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Insert default categories
INSERT INTO categories (id, name, created_at) VALUES
  ('CAT-001', 'Electronics', NOW()),
  ('CAT-002', 'Clothing', NOW()),
  ('CAT-003', 'Food & Beverages', NOW()),
  ('CAT-004', 'Home & Garden', NOW()),
  ('CAT-005', 'Sports & Outdoors', NOW()),
  ('CAT-006', 'Books & Media', NOW()),
  ('CAT-007', 'Toys & Games', NOW()),
  ('CAT-008', 'Health & Beauty', NOW()),
  ('CAT-009', 'Automotive', NOW()),
  ('CAT-010', 'Office Supplies', NOW())
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read categories
CREATE POLICY "Allow authenticated users to read categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow all authenticated users to insert categories (for now)
CREATE POLICY "Allow authenticated users to insert categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow all authenticated users to update categories (for now)
CREATE POLICY "Allow authenticated users to update categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (true);

-- Allow all authenticated users to delete categories (for now)
CREATE POLICY "Allow authenticated users to delete categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (true);

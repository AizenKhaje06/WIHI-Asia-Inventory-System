-- Migration: Convert customers table to business_contacts
-- Purpose: Transform customer loyalty system into business contact management for suppliers, distributors, and resellers

-- Step 1: Rename the table
ALTER TABLE customers RENAME TO business_contacts;

-- Step 2: Drop loyalty/rewards columns
ALTER TABLE business_contacts 
  DROP COLUMN IF EXISTS loyalty_points,
  DROP COLUMN IF EXISTS total_purchases,
  DROP COLUMN IF EXISTS total_spent,
  DROP COLUMN IF EXISTS last_purchase,
  DROP COLUMN IF EXISTS tier;

-- Step 3: Add business contact specific columns
ALTER TABLE business_contacts
  ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255),
  ADD COLUMN IF NOT EXISTS contact_type VARCHAR(50) DEFAULT 'supplier' CHECK (contact_type IN ('supplier', 'distributor', 'reseller')),
  ADD COLUMN IF NOT EXISTS position VARCHAR(100),
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Step 4: Update existing data - set contact_person to current name
UPDATE business_contacts 
SET contact_person = name 
WHERE contact_person IS NULL;

-- Step 5: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_business_contacts_type ON business_contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_business_contacts_company ON business_contacts(company_name);

-- Step 6: Add comment to table
COMMENT ON TABLE business_contacts IS 'Business contacts including suppliers, distributors, and resellers';

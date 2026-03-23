-- Run this in Supabase SQL Editor to check for issues

-- 1. Check if there are any triggers on bundles table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'bundles';

-- 2. Check column definition
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'bundles' AND column_name = 'quantity';

-- 3. Try manual insert to test
INSERT INTO bundles (
    id,
    name,
    store,
    bundle_price,
    bundle_cost,
    regular_price,
    savings,
    quantity,
    is_active
) VALUES (
    'TEST-BUNDLE-123',
    'Test Bundle',
    'Test Store',
    100,
    50,
    150,
    50,
    999,  -- Testing with 999
    true
);

-- 4. Check if it saved correctly
SELECT id, name, quantity FROM bundles WHERE id = 'TEST-BUNDLE-123';

-- 5. Clean up test
DELETE FROM bundles WHERE id = 'TEST-BUNDLE-123';

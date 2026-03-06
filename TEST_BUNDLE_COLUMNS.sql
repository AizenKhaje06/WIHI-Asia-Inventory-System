-- =====================================================
-- TEST: Check if bundle columns exist
-- Run this in Supabase SQL Editor to diagnose the issue
-- =====================================================

-- Test 1: Check if product_type enum exists
SELECT 
  'product_type enum' as test,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING - RUN MIGRATION!' 
  END as result;

-- Test 2: List ALL columns in inventory table
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'inventory'
ORDER BY ordinal_position;

-- Test 3: Check specifically for bundle columns
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'inventory' AND column_name = 'product_type'
    ) THEN '✅ product_type EXISTS'
    ELSE '❌ product_type MISSING'
  END as product_type_check,
  
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'inventory' AND column_name = 'bundle_components'
    ) THEN '✅ bundle_components EXISTS'
    ELSE '❌ bundle_components MISSING'
  END as bundle_components_check,
  
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'inventory' AND column_name = 'is_virtual_stock'
    ) THEN '✅ is_virtual_stock EXISTS'
    ELSE '❌ is_virtual_stock MISSING'
  END as is_virtual_stock_check,
  
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'inventory' AND column_name = 'store'
    ) THEN '✅ store EXISTS'
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'inventory' AND column_name = 'storage_room'
    ) THEN '⚠️ storage_room EXISTS (needs rename)'
    ELSE '❌ store/storage_room MISSING'
  END as store_check;

-- Test 4: Try to insert a test bundle (will show exact error)
-- UNCOMMENT BELOW TO TEST INSERT (will fail if columns missing)
/*
INSERT INTO inventory (
  id,
  name,
  category,
  store,
  quantity,
  cost_price,
  selling_price,
  reorder_level,
  last_updated,
  product_type,
  bundle_components,
  is_virtual_stock
) VALUES (
  'test-bundle-' || gen_random_uuid()::text,
  'TEST BUNDLE - DELETE ME',
  'Test',
  'Test Store',
  0,
  100,
  150,
  5,
  NOW()::text,
  'bundle',
  '[{"item_id": "test", "quantity": 1}]'::jsonb,
  true
);
*/

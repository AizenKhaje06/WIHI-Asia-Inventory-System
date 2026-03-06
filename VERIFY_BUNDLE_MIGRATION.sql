-- =====================================================
-- VERIFY BUNDLE MIGRATION
-- Run this to check if migration was successful
-- =====================================================

-- Check 1: Verify product_type enum exists
SELECT 
  'product_type enum' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status;

-- Check 2: Verify inventory columns
SELECT 
  column_name,
  data_type,
  '✅ EXISTS' as status
FROM information_schema.columns
WHERE table_name = 'inventory'
  AND column_name IN ('product_type', 'bundle_components', 'is_virtual_stock', 'bundle_metadata', 'sales_channel', 'store', 'storage_room')
ORDER BY column_name;

-- Check 3: Verify bundle_transactions table
SELECT 
  'bundle_transactions table' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bundle_transactions') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status;

-- Check 4: Verify functions
SELECT 
  routine_name as function_name,
  '✅ EXISTS' as status
FROM information_schema.routines
WHERE routine_name IN ('calculate_bundle_virtual_stock', 'deduct_bundle_components')
ORDER BY routine_name;

-- Check 5: Count existing bundles
SELECT 
  'Existing bundles' as check_name,
  COUNT(*) as count
FROM inventory
WHERE product_type = 'bundle';

-- Check 6: Show sample inventory structure
SELECT 
  id,
  name,
  product_type,
  CASE 
    WHEN bundle_components IS NOT NULL THEN 'HAS COMPONENTS'
    ELSE 'NO COMPONENTS'
  END as bundle_status,
  is_virtual_stock,
  COALESCE(store, storage_room, 'NO STORE') as store_field
FROM inventory
LIMIT 5;

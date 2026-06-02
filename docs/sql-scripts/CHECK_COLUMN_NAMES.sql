-- Check actual column names returned by products_unified view
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'products_unified'
ORDER BY ordinal_position;

-- Test query to see actual data structure
SELECT 
    id,
    name,
    image_url,
    "productType",
    "salesChannel"
FROM products_unified
LIMIT 3;

-- Check if image_url column exists and has data
SELECT 
    COUNT(*) as total_products,
    COUNT(image_url) as products_with_image_url,
    COUNT(*) - COUNT(image_url) as products_without_image_url
FROM products_unified;

-- Show products that have image_url
SELECT 
    id,
    name,
    image_url
FROM products_unified
WHERE image_url IS NOT NULL;

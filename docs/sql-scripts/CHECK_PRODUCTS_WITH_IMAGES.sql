-- Check which products have images
SELECT 
    'inventory' as source,
    id,
    name,
    image_url,
    CASE 
        WHEN image_url IS NULL THEN '❌ No Image'
        WHEN image_url LIKE 'http%' THEN '✅ Has Supabase URL'
        ELSE '⚠️ Has Relative Path'
    END as status
FROM inventory
UNION ALL
SELECT 
    'bundles' as source,
    id,
    name,
    image_url,
    CASE 
        WHEN image_url IS NULL THEN '❌ No Image'
        WHEN image_url LIKE 'http%' THEN '✅ Has Supabase URL'
        ELSE '⚠️ Has Relative Path'
    END as status
FROM bundles
ORDER BY status DESC, name;

-- Count summary
SELECT 
    'SUMMARY' as info,
    COUNT(*) as total_products,
    COUNT(image_url) as products_with_images,
    COUNT(*) - COUNT(image_url) as products_without_images
FROM (
    SELECT image_url FROM inventory
    UNION ALL
    SELECT image_url FROM bundles
) combined;

-- Show only products WITH images
SELECT 
    name,
    image_url
FROM inventory
WHERE image_url IS NOT NULL
UNION ALL
SELECT 
    name,
    image_url
FROM bundles
WHERE image_url IS NOT NULL;

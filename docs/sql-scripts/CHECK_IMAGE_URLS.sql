-- Check what image URLs are stored in the database
SELECT 
    id,
    name,
    image_url,
    CASE 
        WHEN image_url IS NULL THEN 'No image URL'
        WHEN image_url LIKE 'http%' THEN 'Full URL'
        ELSE 'Relative path'
    END as url_type
FROM inventory
WHERE image_url IS NOT NULL
ORDER BY name
LIMIT 20;

-- Check if any products have relative paths (like /lipocolla.png)
SELECT 
    id,
    name,
    image_url
FROM inventory
WHERE image_url NOT LIKE 'http%'
    AND image_url IS NOT NULL;

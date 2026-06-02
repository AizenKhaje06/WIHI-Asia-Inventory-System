-- Option A: If images are in public folder, use relative paths
-- This will make images load from /public/[filename]
UPDATE inventory
SET image_url = '/' || SUBSTRING(image_url FROM '[^/]+$')
WHERE image_url LIKE '%supabase.co/storage%';

-- Option B: Set to NULL if images don't exist yet
-- This will show placeholder icons instead
UPDATE inventory
SET image_url = NULL
WHERE image_url LIKE '%supabase.co/storage%';

-- Option C: If you have images in a specific public folder
-- Example: /images/products/lipocolla.png
UPDATE inventory
SET image_url = '/images/products/' || SUBSTRING(image_url FROM '[^/]+$')
WHERE image_url LIKE '%supabase.co/storage%';

-- Check results
SELECT id, name, image_url FROM inventory WHERE name LIKE '%LIPOCOLLA%';

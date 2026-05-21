-- Clean inventory product names by removing quantity suffix like (1), (2), (295), etc.
-- This ensures proper matching with orders

-- Preview what will be changed
SELECT 
  name as old_name,
  TRIM(REGEXP_REPLACE(name, '\s*\(\d+\)\s*$', '')) as new_name,
  quantity
FROM inventory
WHERE name ~ '\(\d+\)$'
ORDER BY name;

-- Uncomment below to actually update the names
/*
UPDATE inventory
SET name = TRIM(REGEXP_REPLACE(name, '\s*\(\d+\)\s*$', ''))
WHERE name ~ '\(\d+\)$';
*/

-- After running, verify the changes
-- SELECT name, quantity FROM inventory ORDER BY name;

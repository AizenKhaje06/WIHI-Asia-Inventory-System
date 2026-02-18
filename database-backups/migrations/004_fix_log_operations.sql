-- Fix Log Operations
-- Updates existing logs to have correct operation types

-- Update 'dispatch' and 'other' to 'sale'
UPDATE logs 
SET operation = 'sale' 
WHERE operation IN ('dispatch', 'other')
  AND (details ILIKE '%dispatched%' OR details NOT ILIKE '%demo%' AND details NOT ILIKE '%internal%');

-- Update 'demo' to 'demo-display'
UPDATE logs 
SET operation = 'demo-display' 
WHERE operation = 'demo' 
   OR details ILIKE '%demo/display%'
   OR details ILIKE '%demo / display%';

-- Update 'internal' to 'internal-usage'
UPDATE logs 
SET operation = 'internal-usage' 
WHERE operation = 'internal' 
   OR details ILIKE '%internal use%'
   OR details ILIKE '%internal-use%';

-- Update 'transfer' to 'warehouse'
UPDATE logs 
SET operation = 'warehouse' 
WHERE operation = 'transfer' 
   OR details ILIKE '%warehouse%'
   OR details ILIKE '%transferred%';

-- Show summary
SELECT 
  operation,
  COUNT(*) as count
FROM logs
GROUP BY operation
ORDER BY count DESC;

-- Backfill total_revenue for existing transactions
-- This updates all transactions that don't have total_revenue set

UPDATE transactions 
SET total_revenue = selling_price * quantity 
WHERE total_revenue IS NULL OR total_revenue = 0;

-- Verify the update
-- SELECT COUNT(*) as updated_count 
-- FROM transactions 
-- WHERE total_revenue > 0;

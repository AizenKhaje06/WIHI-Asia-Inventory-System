@echo off
echo ========================================
echo SUPABASE STATUS COLUMNS TEST
echo ========================================
echo.
echo This will test if status columns exist in Supabase
echo.
echo STEPS:
echo 1. Open Supabase Dashboard
echo 2. Go to Table Editor
echo 3. Open "transactions" table
echo 4. Check if these columns exist:
echo    - status (VARCHAR)
echo    - cancellation_reason (TEXT)
echo    - cancelled_by (VARCHAR)
echo    - cancelled_at (TIMESTAMP)
echo.
echo 5. Run this SQL query in SQL Editor:
echo.
echo SELECT id, item_name, status, cancellation_reason, cancelled_by, cancelled_at
echo FROM transactions
echo WHERE status = 'cancelled'
echo ORDER BY cancelled_at DESC
echo LIMIT 5;
echo.
echo EXPECTED RESULT:
echo - Should show 2 rows (BERRY SOAP and BUILD CORD)
echo - status column should show 'cancelled'
echo - cancellation_reason should have values
echo.
echo If columns don't exist, run migrations:
echo 1. Go to SQL Editor in Supabase
echo 2. Run: supabase/migrations/010_add_status_to_transactions.sql
echo.
echo ========================================
echo.
pause

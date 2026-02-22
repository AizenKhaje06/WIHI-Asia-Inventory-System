@echo off
echo ========================================
echo RESTARTING DEV SERVER
echo ========================================
echo.
echo The Supabase default value has been removed.
echo The cancelled transactions should now display correctly!
echo.
echo Steps:
echo 1. Stop your current dev server (Ctrl+C)
echo 2. Run: npm run dev
echo 3. Go to Reports page
echo 4. Check Transaction History for red "Cancelled" badges
echo.
echo Expected CMD output:
echo [Reports API] Cancelled transactions found: 2
echo [Reports API] Cancelled IDs: [
echo   { id: 'TXN-1771559486536', name: 'BUILD CORD', status: 'cancelled' },
echo   { id: 'TXN-1771559485886', name: 'BERRY SOAP', status: 'cancelled' }
echo ]
echo.
echo ========================================
pause

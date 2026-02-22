@echo off
echo ========================================
echo CANCELLED ORDERS STATUS FIX - TEST
echo ========================================
echo.
echo This will test if cancelled orders are showing correctly
echo.
echo STEPS:
echo 1. Make sure dev server is running (npm run dev)
echo 2. Open browser to http://localhost:3000
echo 3. Open Browser Console (F12)
echo 4. Navigate to Reports page
echo 5. Check console for: [Reports API] Sample transaction
echo 6. Navigate to Dashboard page  
echo 7. Check console for: [Dashboard API] Sample transaction with status
echo.
echo EXPECTED RESULTS:
echo - Reports page: Red "Cancelled" badges in Transaction History
echo - Dashboard page: "2 Cancelled Orders" in 7th KPI card
echo - Console logs should show status field (not undefined)
echo.
echo DATABASE STATE:
echo - You have 2 cancelled transactions in Supabase
echo - BERRY SOAP (cancelled)
echo - BUILD CORD (cancelled)
echo.
echo ========================================
echo.
pause

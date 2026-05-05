@echo off
echo ========================================
echo SALES CHANNELS DATA - DIAGNOSTIC TEST
echo ========================================
echo.
echo Testing database connection and orders...
echo.
cd ../..
node scripts/test/check-orders-dates.js
echo.
echo ========================================
echo.
echo If you see "No orders found", check:
echo 1. Supabase dashboard - orders table
echo 2. Date range on Sales Channels page
echo 3. Database connection in .env.local
echo.
pause

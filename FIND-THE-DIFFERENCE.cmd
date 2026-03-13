@echo off
echo ========================================
echo FIND THE DIFFERENCE - DEBUG GUIDE
echo ========================================
echo.
echo Dashboard:  P2,995,059
echo Inventory:  P6,500,111.44
echo Difference: P3,505,052.44
echo.
echo ========================================
echo STEP 1: RUN SQL QUERIES
echo ========================================
echo.
echo 1. Open Supabase Dashboard
echo 2. Go to SQL Editor
echo 3. Run queries from: DEBUG-INVENTORY-VALUE.sql
echo 4. Note the "total_value_selling_price" result
echo.
echo ========================================
echo STEP 2: CHECK DASHBOARD
echo ========================================
echo.
echo 1. Go to: http://localhost:3000/dashboard
echo 2. Check "Inventory Value" card
echo 3. Open browser DevTools (F12)
echo 4. Go to Network tab
echo 5. Find request to: /api/dashboard
echo 6. Check response - look for "totalValue"
echo.
echo ========================================
echo STEP 3: CHECK INVENTORY PAGE
echo ========================================
echo.
echo 1. Go to: http://localhost:3000/dashboard/inventory
echo 2. Check "Total Value" 
echo 3. Open browser DevTools (F12)
echo 4. Go to Network tab
echo 5. Find request to: /api/items
echo 6. Check response - count items
echo.
echo ========================================
echo STEP 4: COMPARE
echo ========================================
echo.
echo SQL Query Result:     P_________
echo Dashboard API:        P_________
echo Dashboard Display:    P_________
echo Inventory API:        P_________
echo Inventory Display:    P_________
echo.
echo Which one is different?
echo.
echo ========================================
echo POSSIBLE CAUSES:
echo ========================================
echo.
echo 1. CACHE - Old data cached
echo    Fix: Clear .next folder, hard refresh
echo.
echo 2. FILTER - Inventory page has active filter
echo    Fix: Clear all filters, check "All Channels"
echo.
echo 3. API MISMATCH - Different calculations
echo    Fix: Check app/api/dashboard/route.ts
echo         Check app/api/items/route.ts
echo.
echo 4. DATA ISSUE - Database has wrong data
echo    Fix: Run SQL queries to verify
echo.
echo ========================================
pause

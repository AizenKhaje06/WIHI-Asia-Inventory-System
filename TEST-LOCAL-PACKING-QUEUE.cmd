@echo off
echo ========================================
echo TEST PACKING QUEUE PAGE LOCALLY
echo ========================================
echo.
echo This will test if the page works in local development
echo.
pause

echo.
echo Building production version...
npm run build

echo.
echo.
echo ========================================
echo CHECK THE BUILD OUTPUT ABOVE
echo ========================================
echo.
echo Look for this line:
echo   ○ /dashboard/packing-queue
echo.
echo If you see it = page exists
echo If you DON'T see it = build problem
echo.
pause

echo.
echo Starting production server...
echo Open browser to: http://localhost:3000/dashboard/packing-queue
echo.
npm run start

@echo off
echo ========================================
echo EMERGENCY FIX - RENAME ROUTE
echo ========================================
echo.
echo This will:
echo 1. Rename packing-queue to packing-queue-temp
echo 2. Commit and push
echo 3. Rename back to packing-queue
echo 4. Commit and push again
echo.
echo This forces Vercel to recognize the route.
echo.
pause

echo.
echo Step 1: Renaming to temp...
git mv app/dashboard/packing-queue app/dashboard/packing-queue-temp
git add .
git commit -m "Temp: Rename packing-queue"
git push origin main

echo.
echo Waiting 30 seconds for Vercel to deploy...
timeout /t 30

echo.
echo Step 2: Renaming back...
git mv app/dashboard/packing-queue-temp app/dashboard/packing-queue
git add .
git commit -m "Fix: Restore packing-queue route"
git push origin main

echo.
echo ========================================
echo DONE!
echo ========================================
echo.
echo Wait 2-3 minutes for Vercel to rebuild
echo Then test the page again
echo.
pause

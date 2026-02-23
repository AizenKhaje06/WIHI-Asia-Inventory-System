@echo off
echo ========================================
echo COMMITTING ALL CHANGES
echo ========================================
echo.

echo [1/3] Adding files...
git add app/dashboard/cancelled-orders/page.tsx app/dashboard/sales-channels/page.tsx

echo [2/3] Committing changes...
git commit -m "Update Cancelled Orders page with compact cards and fix sales channel icons"

echo [3/3] Pushing to GitHub...
git push

echo.
echo ========================================
echo DONE! Changes pushed to GitHub
echo ========================================
pause
